import * as ts from 'typescript'
import { create } from 'xmlbuilder2'
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces'

export const convertAstToXml = (sourceFile: ts.SourceFile) => {
  const dash = (node: ts.Node, parentElement: XMLBuilder) => {
    const { line: lineStart, character: charStart } =
      sourceFile.getLineAndCharacterOfPosition(node.getStart())
    const { line: lineEnd, character: charEnd } =
      sourceFile.getLineAndCharacterOfPosition(node.getEnd())

    const element = parentElement
      .ele(ts.SyntaxKind[node.kind])
      .att('pos', node.pos.toString())
      .att('end', node.end.toString())
      .att('lineStart', lineStart.toString())
      .att('charStart', charStart.toString())
      .att('lineEnd', lineEnd.toString())
      .att('charEnd', charEnd.toString())

    const children = node.getChildren()
    if (children.length === 0) {
      element.txt(node.getText())
    } else {
      children.forEach((child) => dash(child, element))
    }
  }

  const xml = create()
  dash(sourceFile, xml)

  return xml
}

export const astToXmlWithSpace = (sourceFile: ts.SourceFile, code: string) => {
  let res = ''
  const lines = code.split('\n').map((line) => line.replace('\r', ''))

  const insertSpace = (spaces: string[]) => {
    // スペース・改行・コメントを挿入
    let beginComment: '//' | '/*' | false = false
    for (let i = 0; i < spaces.length; i++) {
      const space = spaces[i]

      for (let j = 0; j < space.length; j++) {
        const c = space[j]

        if (j === space.length - 1 || c === ' ' || c === '\t') {
          res += c
        } else if (!beginComment && c === '/' && space[j + 1] === '/') {
          res += '<SingleLineComment>'
          res += c
          beginComment = '//'
        } else if (!beginComment && c === '/' && space[j + 1] === '*') {
          res += '<MultiLineComment>'
          res += c
          beginComment = '/*'
        } else if (beginComment === '/*' && c === '*' && space[j + 1] === '/') {
          res += '*/'
          res += '</MultiLineComment>'
          j++
          beginComment = false
          continue
        } else {
          res += c
        }
      }

      if (beginComment === '//') {
        res += '</SingleLineComment>'
        beginComment = false
      }

      if (i !== spaces.length - 1) {
        res += '\n'
      }
    }

    if (beginComment) {
      // コメントが閉じていない
      throw new Error('Invalid comment')
    }
  }

  const dashNode = (node: ts.Node, parentNode?: ts.Node) => {
    res += `<${ts.SyntaxKind[node.kind]}>`

    const children = node.getChildren()
    if (children.length === 0) {
      res += node.getText()
    } else {
      children.forEach((child) => dashNode(child, node))
    }

    res += `</${ts.SyntaxKind[node.kind]}>`

    // 間に挟むスペース・改行・コメントの計算
    if (!parentNode) {
      return
    }
    const parentChildren = parentNode.getChildren()
    const nextNodeIndex =
      parentChildren.findIndex((child) => child.pos === node.pos) + 1
    if (nextNodeIndex === 0 || nextNodeIndex >= parentChildren.length) {
      // 兄弟の中で最後のノードなら何もしない
      return
    }
    const nextNode = parentChildren[nextNodeIndex]
    if (node.pos > nextNode.pos) {
      // ここには到達しないはず(次のノードの方が現在のノードより前に存在することはあり得ない)
      throw new Error('Invalid node position')
    }

    // 現在のノードと次のノードの間のスペースを挿入
    const { line: nodeLine, character: nodeChar } =
      sourceFile.getLineAndCharacterOfPosition(node.getEnd())
    const { line: nextNodeLine, character: nextNodeChar } =
      sourceFile.getLineAndCharacterOfPosition(nextNode.getStart())
    if (nodeLine === nextNodeLine) {
      if (nextNodeChar - nodeChar <= 0) {
        return
      }
      const space = lines[nodeLine].slice(nodeChar, nextNodeChar)
      insertSpace([space])
    } else {
      const spaces = lines.slice(nodeLine, nextNodeLine + 1)
      spaces[0] = spaces[0].slice(nodeChar)
      spaces[spaces.length - 1] = lines[nextNodeLine].slice(0, nextNodeChar)
      insertSpace(spaces)
    }
  }

  dashNode(sourceFile)

  return res
}
