/**
 * Extract config metadata from JSDoc comments in valaxy types.
 *
 * Usage:
 *   npx tsx packages/devtools/scripts/extract-config-meta.ts
 *
 * This script uses the TypeScript compiler API to parse JSDoc annotations
 * from `packages/valaxy/types/config.ts` and outputs a JSON metadata file
 * that the devtools client can use to display field descriptions, defaults,
 * and type info.
 */
import * as fs from 'node:fs'
import * as path from 'node:path'
import process from 'node:process'
import * as ts from 'typescript'

interface FieldMeta {
  name: string
  type: string
  description?: string
  descriptionZh?: string
  default?: string
  deprecated?: boolean
  children?: FieldMeta[]
}

interface ConfigMeta {
  generated: string
  siteConfig: FieldMeta[]
  valaxyConfig: FieldMeta[]
}

function getJSDocTags(node: ts.Node): ts.JSDocTag[] {
  const jsDocs = (node as any).jsDoc as ts.JSDoc[] | undefined
  if (!jsDocs)
    return []
  const tags: ts.JSDocTag[] = []
  for (const doc of jsDocs) {
    if (doc.tags) {
      tags.push(...doc.tags)
    }
  }
  return tags
}

function getJSDocComment(node: ts.Node): string {
  const jsDocs = (node as any).jsDoc as ts.JSDoc[] | undefined
  if (!jsDocs)
    return ''
  const comments: string[] = []
  for (const doc of jsDocs) {
    if (doc.comment) {
      const text = typeof doc.comment === 'string'
        ? doc.comment
        : doc.comment.map((c: any) => c.text || '').join('')
      if (text)
        comments.push(text.trim())
    }
  }
  return comments.join('\n')
}

function extractDescription(node: ts.Node): { en?: string, zh?: string } {
  const comment = getJSDocComment(node)
  const tags = getJSDocTags(node)

  let en = comment
  let zh = ''

  for (const tag of tags) {
    const tagName = tag.tagName.text
    const tagComment = typeof tag.comment === 'string'
      ? tag.comment
      : tag.comment?.map((c: any) => c.text || '').join('') || ''

    if (tagName === 'zh' || tagName === 'zh_CN')
      zh = tagComment.trim()
    else if (tagName === 'en' || tagName === 'en_US')
      en = en || tagComment.trim()
    else if (tagName === 'description')
      en = en || tagComment.trim()
    else if (tagName === 'description:zh-CN')
      zh = tagComment.trim()
    else if (tagName === 'description:en-US')
      en = en || tagComment.trim()
  }

  return { en: en || undefined, zh: zh || undefined }
}

function extractDefault(node: ts.Node): string | undefined {
  const tags = getJSDocTags(node)
  for (const tag of tags) {
    if (tag.tagName.text === 'default') {
      const text = typeof tag.comment === 'string'
        ? tag.comment
        : tag.comment?.map((c: any) => c.text || '').join('') || ''
      return text.trim() || undefined
    }
  }
  return undefined
}

function isDeprecated(node: ts.Node): boolean {
  const tags = getJSDocTags(node)
  return tags.some(t => t.tagName.text === 'deprecated')
}

function typeToString(node: ts.TypeNode | undefined, checker: ts.TypeChecker): string {
  if (!node)
    return 'unknown'

  if (ts.isTypeLiteralNode(node))
    return 'object'

  if (ts.isArrayTypeNode(node))
    return `${typeToString(node.elementType, checker)}[]`

  if (ts.isUnionTypeNode(node)) {
    return node.types.map(t => typeToString(t, checker)).join(' | ')
  }

  if (ts.isLiteralTypeNode(node)) {
    if (node.literal.kind === ts.SyntaxKind.StringLiteral)
      return `'${(node.literal as ts.StringLiteral).text}'`
    if (node.literal.kind === ts.SyntaxKind.TrueKeyword)
      return 'true'
    if (node.literal.kind === ts.SyntaxKind.FalseKeyword)
      return 'false'
  }

  if (ts.isTypeReferenceNode(node)) {
    return node.typeName.getText()
  }

  const text = node.getText()
  return text || 'unknown'
}

function extractMembers(
  members: ts.NodeArray<ts.TypeElement>,
  checker: ts.TypeChecker,
): FieldMeta[] {
  const fields: FieldMeta[] = []
  for (const member of members) {
    if (!ts.isPropertySignature(member))
      continue

    const name = member.name?.getText() || ''
    if (!name)
      continue

    const desc = extractDescription(member)
    const defaultVal = extractDefault(member)
    const deprecated = isDeprecated(member)

    let typeName = 'unknown'
    let children: FieldMeta[] | undefined

    if (member.type) {
      if (ts.isTypeLiteralNode(member.type)) {
        typeName = 'object'
        children = extractMembers(member.type.members, checker)
      }
      else {
        typeName = typeToString(member.type, checker)
      }
    }

    const field: FieldMeta = {
      name,
      type: typeName,
    }
    if (desc.en)
      field.description = desc.en
    if (desc.zh)
      field.descriptionZh = desc.zh
    if (defaultVal)
      field.default = defaultVal
    if (deprecated)
      field.deprecated = true
    if (children && children.length > 0)
      field.children = children

    fields.push(field)
  }
  return fields
}

function extractInterfaceFields(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  interfaceName: string,
): FieldMeta[] {
  for (const statement of sourceFile.statements) {
    if (ts.isInterfaceDeclaration(statement) && statement.name.text === interfaceName) {
      return extractMembers(statement.members, checker)
    }
  }
  return []
}

function main() {
  const root = path.resolve(__dirname, '../../..')
  const configPath = path.resolve(root, 'packages/valaxy/types/config.ts')
  const outputPath = path.resolve(root, 'packages/devtools/src/client/config-meta.json')

  if (!fs.existsSync(configPath)) {
    console.error(`Config types file not found: ${configPath}`)
    process.exit(1)
  }

  const program = ts.createProgram([configPath], {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    skipLibCheck: true,
    noEmit: true,
  })

  const checker = program.getTypeChecker()
  const sourceFile = program.getSourceFile(configPath)
  if (!sourceFile) {
    console.error('Failed to parse source file')
    process.exit(1)
  }

  const siteConfig = extractInterfaceFields(sourceFile, checker, 'SiteConfig')
  const valaxyConfig = extractInterfaceFields(sourceFile, checker, 'ValaxyConfig')

  const meta: ConfigMeta = {
    generated: new Date().toISOString(),
    siteConfig,
    valaxyConfig,
  }

  fs.writeFileSync(outputPath, `${JSON.stringify(meta, null, 2)}\n`)
  console.log(`Config metadata written to ${outputPath}`)
  console.log(`  SiteConfig fields: ${siteConfig.length}`)
  console.log(`  ValaxyConfig fields: ${valaxyConfig.length}`)
}

main()
