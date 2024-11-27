export interface AdminUserPayLoad {
  email: string
  userId: number
  createTime: number
  updatedTime: number
  iat: number
  exp: number
}

export interface wxUserPayLoad {
  openid: string
}
