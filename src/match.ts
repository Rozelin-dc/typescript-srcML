import * as ts from 'typescript'
import { create } from 'xmlbuilder2'
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces'

export const convertAstToXml = (file: ts.SourceFile) => {
  const dash = (node: ts.Node, parentElement: XMLBuilder) => {
    const element = parentElement.ele(ts.SyntaxKind[node.kind])

    const children = node.getChildren()
    if (children.length === 0) {
      element.txt(node.getText())
    } else {
      children.forEach((child) => dash(child, element))
    }
  }

  const xml = create()
  dash(file, xml)

  return xml
}
