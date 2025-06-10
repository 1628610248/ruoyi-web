import { ref } from 'vue'
import { defineStore } from 'pinia'
import { to } from 'await-to-js'
import type { UserInfo, UserState } from './helper'
import { defaultSetting, getLocalState, setLocalState } from './helper'
import type { LoginParams, UserData } from '@/typings/user'
import { doLogin, loginOut } from '@/api/user'
import { getToken, removeToken, setToken } from '@/store/modules/auth/helper'

const token = ref(getToken())

// 创建用户仓库
export const useUserStore = defineStore('user-store', {
  // 仓库存储数据
  state: (): UserState => getLocalState(),
  // 异步|逻辑的地方
  actions: {
    // 用户登录的方法
    async userLogin(data: LoginParams) {
      // 登录请求
      const [err, res] = await to(doLogin<UserData>(data))
      if (res) {
        const data = res.data
        // token本地存储
        setToken(data.access_token)
        // token.value = data.access_token
        return Promise.resolve()
      }
      return Promise.reject(err)
    },
    // 二维码登录的方法
    async userQrLogin(token: string) {
      setToken(token)
    },

    logout: async (): Promise<void> => {
      await loginOut()
      token.value = ''
      removeToken()
    },

    updateUserInfo(userInfo: Partial<UserInfo>) {
      this.userInfo = { ...this.userInfo, ...userInfo }
      this.recordState()
    },

    resetUserInfo() {
      this.userInfo = { ...defaultSetting().userInfo }
      this.recordState()
    },

    recordState() {
      setLocalState(this.$state)
    },
  },
})
