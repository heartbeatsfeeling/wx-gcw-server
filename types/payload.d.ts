import { Role } from 'src/enums'

export interface AdminUserPayLoad {
  userId: number
  roles: Role
  iat: number
  exp: number
}

export interface wxUserPayLoad {
  openid: string
}
