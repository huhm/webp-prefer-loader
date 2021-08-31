const {Buffer} = require('buffer')
const fs = require('fs')
const path = require('path')

const webp = require('webp-converter')

const tmpDir = 'webp_tmp'
 // eslint-disable-next-line consistent-return
 function tempPath() {
  if (process.platform === 'darwin') {
     // return osx library path
    return path.join(__dirname, './', `/${  tmpDir  }/`);
  } else if (process.platform === 'linux') {
     // return linux library path
    return path.join(__dirname, './', `/${  tmpDir  }/`)
  } else if (process.platform === 'win32') {
    if (process.arch === 'x64') {
      // return windows 64bit library path
      return path.join(__dirname, './', `\\${  tmpDir  }\\`)
    }
    // show unsupported platform message
      // eslint-disable-next-line no-console
      console.log('Unsupported platform:', process.platform, process.arch)
  } else {
    // show unsupported platform message
    // eslint-disable-next-line no-console
    console.log('Unsupported platform:', process.platform, process.arch)
  }
}

/**
 * @param  {string} filepath
 * @param  {string} type
 */
function encodeImage(filepath, type) {
  const data = fs.readFileSync(filepath)
  const buf = Buffer.from(data)
  if (type === 'base64') {
    const base64 = buf.toString('base64')
    // console.log('Base64 ' + filepath + ': ' + base64);
    return base64
  }
    return buf

}
let no = 1

/**
 * @param  {buffer} buffer
 * @param  {string} image_type
 * @param  {string} option
 */
// convert image buffer  to webp buffer
// eslint-disable-next-line consistent-return
module.exports.buffer2webp = (buffer, imageType, option, uniqueFileName) => {
  //   let buf = Buffer.from(buffer)
  //   let base64str = buf.toString('base64')

  // eslint-disable-next-line no-plusplus
  const filename = uniqueFileName || String(no++)
  const tmpPath = tempPath()
  if (!fs.existsSync(tmpPath)) {
    fs.mkdirSync(tmpPath)
  }

  const inputFilePath = `${tmpPath}${filename}.${imageType}`

  const webpImagePath = `${tmpPath}${filename}.webp`

  //   let status = base64_to_image(base64str, input_file_path)
  const status = true
  fs.writeFileSync(inputFilePath, buffer)
  if (status) {
    const result = webp.cwebp(inputFilePath, webpImagePath, option)
    return result.then(response => {
      // eslint-disable-next-line no-console
      console.log('[WEBP] cwebp', response)
      const webpBuffer = encodeImage(webpImagePath, 'buffer')

      fs.unlinkSync(inputFilePath)
      fs.unlinkSync(webpImagePath)

      return webpBuffer
    })
  }
    // eslint-disable-next-line no-console
    console.log('[WEBP] Failed')

}
