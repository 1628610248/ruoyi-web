import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'

import { ElMessage, ElNotification } from 'element-plus'
import { createDiscreteApi } from 'naive-ui'
import { useUserStore } from '@/store/modules/user'
import { getToken } from '@/store/modules/auth/helper'
import { tansParams } from '@/utils/ruoyi'
import cache from '@/plugins/cache'
import { HttpStatus } from '@/enums/RespEnum'
import { errorCode } from '@/utils/errorCode'
import { decryptBase64, decryptWithAes, encryptBase64, encryptWithAes, generateAesKey } from '@/utils/request/crypto'
import { decrypt, encrypt } from '@/utils/request/jsencrypt'
const encryptHeader = 'encrypt-key'
const { message } = createDiscreteApi(['message'])
// 是否显示重新登录
export const isRelogin = { show: false }
export const globalHeaders = () => {
  return {
    Authorization: `Bearer ${getToken()}`,
    clientid: import.meta.env.VITE_APP_CLIENT_ID,
  }
}
axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
axios.defaults.headers.clientId = import.meta.env.VITE_CHAT_APP_CLIENT_ID
// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_GLOB_API_URL,
  timeout: 50000,
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isToken = (config.headers || {}).isToken === false
    // 是否需要防止数据重复提交
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
    // 是否需要加密
    const isEncrypt = config.headers?.isEncrypt === 'true'
    if (getToken() && !isToken)
      config.headers.Authorization = `Bearer ${getToken()}` // 让每个请求携带自定义token 请根据实际情况自行修改
    config.headers.clientid = import.meta.env.VITE_CHAT_APP_CLIENT_ID // 让每个请求携带自定义token 请根据实际情况自行修改

    // get请求映射params参数
    if (config.method === 'get' && config.params) {
      let url = `${config.url}?${tansParams(config.params)}`
      url = url.slice(0, -1)
      config.params = {}
      config.url = url
    }

    if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
      const requestObj = {
        url: config.url,
        data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
        time: new Date().getTime(),
      }
      const sessionObj = cache.session.getJSON('sessionObj')
      if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
        cache.session.setJSON('sessionObj', requestObj)
      }
      else {
        const s_url = sessionObj.url // 请求地址
        const s_data = sessionObj.data // 请求数据
        const s_time = sessionObj.time // 请求时间
        const interval = 500 // 间隔时间(ms)，小于此时间视为重复提交
        if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
          const message = '数据正在处理，请勿重复提交'
          console.warn(`[${s_url}]: ${message}`)
          return Promise.reject(new Error(message))
        }
        else {
          cache.session.setJSON('sessionObj', requestObj)
        }
      }
    }
    if (import.meta.env.VITE_APP_ENCRYPT === 'true') {
      // 当开启参数加密
      if (isEncrypt && (config.method === 'post' || config.method === 'put')) {
        // 生成一个 AES 密钥
        const aesKey = generateAesKey()
        config.headers[encryptHeader] = encrypt(encryptBase64(aesKey))
        config.data = typeof config.data === 'object' ? encryptWithAes(JSON.stringify(config.data), aesKey) : encryptWithAes(config.data, aesKey)
      }
    }
    // FormData数据去请求头Content-Type
    if (config.data instanceof FormData)
      delete config.headers['Content-Type']

    return config
  },
  (error: any) => {
    console.log(error)
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (res: AxiosResponse) => {
    if (import.meta.env.VITE_APP_ENCRYPT === 'true') {
      // 加密后的 AES 秘钥
      const keyStr = res.headers[encryptHeader]
      // 加密
      if (keyStr != null && keyStr != '') {
        const data = res.data
        // 请求体 AES 解密
        const base64Str = decrypt(keyStr)
        // base64 解码 得到请求头的 AES 秘钥
        const aesKey = decryptBase64(base64Str.toString())
        // aesKey 解码 data
        const decryptData = decryptWithAes(data, aesKey)
        // 将结果 (得到的是 JSON 字符串) 转为 JSON
        res.data = JSON.parse(decryptData)
      }
    }
    // 未设置状态码则默认成功状态
    const code = res.data.code || HttpStatus.SUCCESS
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode.default
    // 二进制数据则直接返回
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer')
      return res.data

    if (code === 401) {
      // 退出登录
      message.error('无效的会话，或者会话已过期，请重新登录。')
      useUserStore().logout().then(() => {
        location.href = '#/login'
      })
    }
    else if (code === HttpStatus.SERVER_ERROR) {
      // console.log(msg);
      return Promise.reject(new Error(msg))
    }
    else if (code === HttpStatus.WARN) {
      ElMessage({ message: msg, type: 'warning' })
      return Promise.reject(new Error(msg))
    }
    else if (code !== HttpStatus.SUCCESS) {
      ElNotification.error({ title: msg })
      return Promise.reject('error')
    }
    else {
      return Promise.resolve(res.data)
    }
  },
  (error: any) => {
    let { message } = error
    if (message == 'Network Error')
      message = '后端接口连接异常'
    else if (message.includes('timeout'))
      message = '系统接口请求超时'
    else if (message.includes('Request failed with status code'))
      message = `系统接口${message.substr(message.length - 3)}异常`

    ElMessage({ message, type: 'error', duration: 5 * 1000 })
    return Promise.reject(error)
  },
)
// 导出 axios 实例
export default service
