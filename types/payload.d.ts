import { Role } from 'src/enums'

export interface AdminUserPayLoad {
  userId: number
  role: Role
  iat: number
  exp: number
}

export interface wxUserPayLoad {
  openid: string
}
