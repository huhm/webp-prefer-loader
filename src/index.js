const path = require('path')
const querystring = require('querystring')
const fs = require('fs')

const {getOptions,interpolateName} = require('loader-utils')

// const imagemin = require('imagemin')
// const imageminWebp = require('imagemin-webp')
const webp = require('./webp-utils')

function defaultBeforeConvert({
  resourcePath,
  resourceQueryObj,
  outputPath,
}) {
  if (resourceQueryObj.webp == null) {
    return false
  }
  const webpOutputPath = `${outputPath}.webp`
  return {
    dontEmitOrigin: false,
    webpSrcPath: `${resourcePath}.webp`,
    webpOutputPath,
  }
}

/**
 * Webp options
 * @param {*} content
 */


/**
 * webp options: https://github.com/imagemin/imagemin-webp
 * @param beforeConvert {(info:{resourcePath:string,resourceQueryObj:Record<string,string>,outPutPath:string})=>{dontEmitOrigin:boolean,webpSrcPath:string,webpOutputPath:string}}
 */
function WebPPreferLoader(content) {
  const options = getOptions(this) ||{}
  const context = options.context || this.rootContext
  const name = options.name || '[hash].[ext]'
  const immutable = /\[([^:\]]+:)?(hash|contenthash)(:[^\]]+)?\]/gi.test(name)
  const url = interpolateName(this, name, {
    context,
    content,
    regExp: options.regExp,
  })
  let outputPath = url
  if (options.outputPath) {
    if (typeof options.outputPath === 'function') {
      outputPath = options.outputPath(url, this.resourcePath, context)
    } else {
      outputPath = path.posix.join(options.outputPath, url)
    }
  }

  let publicPath = `__webpack_public_path__ + ${JSON.stringify(outputPath)}`

  if (options.publicPath) {
    if (typeof options.publicPath === 'function') {
      publicPath = options.publicPath(url, this.resourcePath, context)
    } else {
      publicPath = `${
        options.publicPath.endsWith('/')
          ? options.publicPath
          : `${options.publicPath}/`
      }${url}`
    }

    publicPath = JSON.stringify(publicPath)
  }

  if (options.postTransformPublicPath) {
    publicPath = options.postTransformPublicPath(publicPath)
  }

  // this.cacheable && this.cacheable()//??
  const callback = this.async()
  // debugger
  const moduleString = `${
    options.esModules ? 'export default' : 'module.exports ='
  } ${publicPath};`
  const emitOriginFunc = () => {
    if (typeof options.emitFile === 'undefined' || options.emitFile) {
      this.emitFile(outputPath, content, null, { immutable })
    }
  }

  let waitPromise = Promise.resolve(true)
  // check by query ： only deal the resource url with query ?webp
  const { resourceQuery, resourcePath } = this
  const beforeConvert = options.beforeConvert || defaultBeforeConvert
  let resourceQueryObj = {}
  if (resourceQuery) {
    resourceQueryObj = querystring.parse(resourceQuery.substr(1))
  }
  const convertOption = beforeConvert({
    resourcePath,
    resourceQueryObj,
    resourceQuery,
    outputPath,
  })
  if (convertOption === false) {
    emitOriginFunc()
  } else {
    if (!convertOption.dontEmitOrigin) {
      emitOriginFunc()
    }
    const { webpSrcPath, webpOutputPath } = convertOption
    if (webpSrcPath || webpOutputPath) {
      let webpContentPromise
      if (webpSrcPath && fs.existsSync(webpSrcPath)) {
        // webpsrc exists to read
        webpContentPromise = new Promise((resolve, reject) => {
          fs.readFile(webpSrcPath, (err, webpContent) => {
            if (err) {
              reject(err)
            } else {
              resolve(webpContent)
            }
          })
        })
      } else {
        // 2.not exist create TODO
        const extname = path.extname(resourcePath)
        webpContentPromise = webp
          .buffer2webp(content, extname.substr(1), '-q 75')
          .then(webpBuffer => {
            // Save to local
            if (webpSrcPath) {
              return new Promise((resolve, reject) => {
                fs.writeFile(webpSrcPath, webpBuffer, err => {
                  if (err) {
                    // eslint-disable-next-line no-console
                    console.log(
                      '[webp-loader]',
                      'save webp to local src error',
                      webpSrcPath
                    )
                    reject(err)
                  } else {
                    // eslint-disable-next-line no-console
                    console.log(
                      `[webp-loader] webp created success,compression ratio=${
                        (webpBuffer.length / content.length).toFixed(2)
                        }%`
                    )
                    resolve(webpBuffer)
                  }
                })
              })
            }
              return webpBuffer

          })
      }
      waitPromise = webpContentPromise.then(webpContent => {
        // 3.emit
        if(webpOutputPath){
          this.emitFile(webpOutputPath, webpContent, null, { immutable })
        }
      })
    }
  }

  waitPromise
    .then(() => {
      callback(null, moduleString)
    })
    .catch(err => {
      callback(err)
    })


}
WebPPreferLoader.raw=true;
module.exports = WebPPreferLoader
