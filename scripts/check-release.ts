import process from 'node:process'
import { checkReleaseVersions } from './release-check'

checkReleaseVersions(process.cwd(), process.env.GITHUB_REF_TYPE === 'tag' ? process.env.GITHUB_REF_NAME : undefined)
  .then(version => console.log(`Coordinated release v${version} and scaffold versions match`))
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
