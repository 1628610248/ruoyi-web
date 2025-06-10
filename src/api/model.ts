import request from '@/utils/request/req'

/**
 * 查询未隐藏模型
 * @returns
 */
export function modelList() {
  return request({
    url: '/ai/model/modelList',
    method: 'get',
  })
}

/**
 * 查询所有模型
 *
 * @returns
 */
export function list(category: string) {
  return request({
    url: '/ai/model/list',
    method: 'get',
    params: {
      category,
    },
  })
}
