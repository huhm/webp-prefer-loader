
import Vue from 'vue'
import { DirectiveBinding } from 'vue/types/options'
import { DirectiveOptions } from 'vue/types/umd'

const BASE64_PREFIX = 'data:image'

let _isSupportWebp: boolean
export function isSupportWebp() {
  if (_isSupportWebp != null) {
    return _isSupportWebp
  }
  _isSupportWebp =
    !![].map &&
    typeof window !== 'undefined' &&
    window.document
      .createElement('canvas')
      .toDataURL('image/webp')
      .indexOf('data:image/webp') === 0
  return _isSupportWebp
}

/**
 * 支持webp且链接是图片的url转化为webp链接
 * TODO: png图片转换到其他域名下
 * @param srcValue
 */
function tryConvertWebPUrl(srcValue: string) {
  if (
    isSupportWebp() &&
    srcValue.substr(0, BASE64_PREFIX.length) !== BASE64_PREFIX
  ) {
    const isWebp = srcValue.substr(srcValue.length - 5, 5) === '.webp'
    if (isWebp) {
      return srcValue
    }
    return srcValue + '.webp'
  }
  return srcValue
}
function update(el: HTMLElement, binding: DirectiveBinding) {
  const bindingKeys = Object.keys(binding)
  const isBind = !bindingKeys.includes('oldValue')
  const isBindTrue = isBind && binding.expression === undefined
  if (binding.oldValue === binding.value && !isBindTrue) {
    return
  }
  let bindingValue = binding.value
  if (!bindingValue && isBindTrue) {
    bindingValue = true
  }
  let type = binding.arg
  if (!type) {
    if (el.tagName === 'IMG') {
      type = 'src'
    } else {
      type = 'bg'
    }
  }
  // console.log('[V-WEBP]', el, binding, bindingValue)
  let srcValue
  if (bindingValue) {
    let str = bindingValue
    if (bindingValue === true) {
      if (type === 'src') {
        str = el.getAttribute('src')
      } else {
        console.error(
          '[WEBP] DoNot Support v-webp="true" with backgroundImage,please use param lik v-webp="img"'
        )
      }
    }
    if (typeof str === 'string') {
      srcValue = tryConvertWebPUrl(str)
    }
  }
  if (type === 'src') {
    el.setAttribute(type, srcValue)
    if (!srcValue) {
      el.removeAttribute(type)
    }
  } else if (type === 'bg') {
    if (srcValue) {
      el.style.backgroundImage = `url(${srcValue})`
    } else {
      el.style.backgroundImage = ''
    }
  }
}
const directiveOptions: DirectiveOptions = {
  bind: update,
  update,
}

/**
 * @usage v-webp:src="./src/xx/zz.png?webp"
 * @usage v-webp:bg="./src/xx/zz.png?webp" 设置backgroundImage:url(xxx)
 * @usage v-webp="./src/xx/zz.png?webp" 如果是img标签设置webp,如果是其他标签设置backgroundImage
 * @usage v-webp="true" | v-webp 使用el的src属性
 * @usage v-webp="false"
 * @usage :comp-prop="imgData | webp"
 */
export default function install() {
  Vue.directive('webp', directiveOptions)
  Vue.filter('webp', webpFilter)
}

export function webpFilter(value: string) {
  if (!value) return value
  return tryConvertWebPUrl(value)
}
