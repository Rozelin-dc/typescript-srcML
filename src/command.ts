import fs from 'fs'

import yargs from 'yargs'

export const getFileFromCommandOption = async () => {
  try {
    const argv = await yargs(process.argv.slice(2))
      .options({
        file: {
          demandOption: true,
          string: true,
        },
      })
      .parse()

    const fileName = argv.file
    const code = fs.readFileSync(fileName).toString()
    return { fileName, code }
  } catch (e) {
    throw new Error('Error while reading file\n' + e)
  }
}
