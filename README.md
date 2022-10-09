# webp-prefer-loader

TODO: 文档待更新

![npm package](https://img.shields.io/npm/v/webp-prefer-loader)

## 功能

+ webpack loader
+ 目前已测试webpack4
+ 可将项目中非webp图片生成对应的.webp文件

## Usage

webpack配置和在vue项目中使用的示例

### Webpack配置

webpack配置（可结合url-loader使用,也可单独使用）

``` js
{
  module:{
    rules:[ 
      {
        test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
        use: [
          /* config.module.rule('images').use('url-loader') */
          {
            loader: 'url-loader',
            options: {
              limit: 1000,
              fallback: {
                loader: require('webp-prefer-loader'),
                options: {
                  // cwebp转换参数 doc:https://developers.google.com/speed/webp/docs/cwebp

                  convertOption:'-q 90',// 默认-q 90
                  name: 'static/img/[name].[hash:8].[ext]',
                  beforeConvert: function () {
                      if (resourceQueryObj.webp == null) {
                        // 不带webp的query的，不进行处理
                        return false
                      }
                      const webpOutputPath = outputPath + '.webp'
                      return {
                        // 是否emit原始png文件
                        dontEmitOrigin:true,
                        // 原始png文件同目录下是否创建webp文件，为空时，不处理
                        webpSrcPath: resourcePath + '.webp',
                        // 是否打包出来，如果为空的话，不会打包，不为空时，需要保证webpSrcPath有值
                        webpOutputPath,
                      }
                   }
                }
              }
            }
          }
        ]
      },]
  }
}
```

### Vue使用

见example下
