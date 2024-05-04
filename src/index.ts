import * as ts from 'typescript'

import { getFileFromCommandOption } from './command'
import { astToXmlWithSpace, convertAstToXml } from './match'

const createSrcMl = async () => {
  try {
    const { fileName, code } = await getFileFromCommandOption()
    const sourceFile = ts.createSourceFile(
      fileName,
      code,
      {
        languageVersion: ts.ScriptTarget.ES2016,
        jsDocParsingMode: ts.JSDocParsingMode.ParseNone,
      },
      true,
      ts.ScriptKind.TS
    )

    // const xml = convertAstToXml(sourceFile)
    // console.log(xml.end({ prettyPrint: true }))

    const xmlStr = astToXmlWithSpace(sourceFile, code)
    console.log(xmlStr)
  } catch (e) {
    console.error(e)
  }
}

createSrcMl()
