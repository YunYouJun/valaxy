import type { KnownEditor } from 'devframe/utils/launch-editor'

interface EditorPresentation {
  commands: KnownEditor[]
  name: string
  icon: string
}

// Presentation only; the Open service supplies the supported command list.
export const editorPresentations: EditorPresentation[] = [
  { commands: ['code'], name: 'Visual Studio Code', icon: 'i-vscode-icons:file-type-vscode' },
  { commands: ['code-insiders'], name: 'VS Code Insiders', icon: 'i-vscode-icons:file-type-vscode-insiders' },
  { commands: ['cursor'], name: 'Cursor', icon: 'i-simple-icons:cursor' },
  { commands: ['zed'], name: 'Zed', icon: 'i-simple-icons:zedindustries' },
  { commands: ['webstorm', 'wstorm'], name: 'WebStorm', icon: 'i-simple-icons:webstorm' },
  { commands: ['codium', 'vscodium'], name: 'VSCodium', icon: 'i-simple-icons:vscodium' },
  { commands: ['subl', 'sublime', 'sublime_text'], name: 'Sublime Text', icon: 'i-simple-icons:sublimetext' },
  { commands: ['idea'], name: 'IntelliJ IDEA', icon: 'i-simple-icons:intellijidea' },
  { commands: ['trae'], name: 'Trae', icon: 'i-simple-icons:trae' },
  { commands: ['atom'], name: 'Atom', icon: 'i-simple-icons:atom' },
  { commands: ['pycharm', 'charm'], name: 'PyCharm', icon: 'i-simple-icons:pycharm' },
  { commands: ['phpstorm'], name: 'PhpStorm', icon: 'i-simple-icons:phpstorm' },
  { commands: ['rubymine'], name: 'RubyMine', icon: 'i-simple-icons:rubymine' },
  { commands: ['clion'], name: 'CLion', icon: 'i-simple-icons:clion' },
  { commands: ['goland'], name: 'GoLand', icon: 'i-simple-icons:goland' },
  { commands: ['rider'], name: 'Rider', icon: 'i-simple-icons:rider' },
  { commands: ['notepad++'], name: 'Notepad++', icon: 'i-simple-icons:notepadplusplus' },
  { commands: ['vim'], name: 'Vim', icon: 'i-simple-icons:vim' },
  { commands: ['mvim'], name: 'MacVim', icon: 'i-simple-icons:vim' },
  { commands: ['gvim'], name: 'gVim', icon: 'i-simple-icons:vim' },
  { commands: ['emacs'], name: 'Emacs', icon: 'i-simple-icons:gnuemacs' },
  { commands: ['emacsclient'], name: 'Emacs Client', icon: 'i-simple-icons:gnuemacs' },
  { commands: ['mate'], name: 'TextMate', icon: 'i-ph:code' },
  { commands: ['rmate'], name: 'Remote TextMate', icon: 'i-ph:code' },
  { commands: ['antigravity'], name: 'Antigravity', icon: 'i-ph:code' },
  { commands: ['appcode'], name: 'AppCode', icon: 'i-ph:code' },
  { commands: ['joe'], name: 'JOE', icon: 'i-ph:terminal' },
]

export function getEditorPresentation(editor?: KnownEditor) {
  return editorPresentations.find(item => editor && item.commands.includes(editor))
}
