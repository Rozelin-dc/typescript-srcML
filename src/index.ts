import * as ts from 'typescript'

import { getFileFromCommandOption } from './command'
import { convertAstToXml } from './match'

const createSrcMl = async () => {
  try {
    const { fileName, code } = await getFileFromCommandOption()
    const sourceFile = ts.createSourceFile(
      fileName,
      code,
      ts.ScriptTarget.ES2015,
      /*setParentNodes */ true
    )
    const xml = convertAstToXml(sourceFile)

    console.log(xml.end({ prettyPrint: true }))
  } catch (e) {
    console.error(e)
  }
}

createSrcMl()
