// import { reactive } from 'vue'

import { mlog } from './mjapi'
import type { gptConfigType } from '@/store'
import { gptConfigStore } from '@/store'
import { ss } from '@/utils/storage'

export class chatSetting {
  private uuid: number
  private localKey = 'chat-setting'
  // private gptConfig: gptConfigType
  // 构造函数
  constructor(uuid: number) {
    this.uuid = uuid
    // this.gptConfig = gptConfigStore.myData;
    // this.init();
  }

  public setUuid(uuid: number) {
    this.uuid = uuid
    return this
  }

  public getGptConfig(): gptConfigType {
    const index = this.findIndex()
    if (index <= -1)
      return gptConfigStore.myData
    const arr = this.getObjs()
    return arr[index]
  }

  public getObjs(): gptConfigType[] {
    const obj = ss.get(this.localKey) as undefined | gptConfigType[]
    if (!obj)
      return []
    return obj
  }

  public findIndex() {
    return this.getObjs().findIndex(v => v.uuid && v.uuid == this.uuid)
  }

  public save(obj: Partial<gptConfigType>) {
    mlog('chatsave', 'gogo')
    const sobj = { ...gptConfigStore.myData, ...obj }
    sobj.uuid = this.uuid
    const index = this.findIndex()
    const arr = this.getObjs()
    if (index > -1)
      arr[index] = sobj
    else arr.push(sobj)
    ss.set(this.localKey, arr)
    return this
  }
}
