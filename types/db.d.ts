import { Role as RoleType, VideoType } from 'src/enums'

export interface User {
  id: number
  name: string
  openid: string
  createTime: string
  lastLoginTime: string
}

export interface Video {
  id: number
  path: string
  title: string
  hash: string
  description: string
  duration: number
  likedAtTime: string
  createTime: string
  likeCount: number
  coverImage: string
  viewCount: number
  type: VideoType
  width: number
  height: number
  size: number
}

export interface AdminUser {
  id: number
  email: string
  createTime: number
  updatedTime: number
  roles?: RoleType[]
}

export interface Like {
  id: number
  userId: number
  videoId: number
  title: string
  createTime: string
}

export interface Log {
  id: number
  openid: string
  videTitle: string
  videoId: number
  createTime: string
}

export interface UserLoginLog {
  id: number
  userId: number
  openid: string
  createTime: string
}

export interface Role {
  id: number
  name: string
  description: string
  createdAt: number
  updatedAt: number
}

export interface Permission {
  id: number
  name: string
  description: string
  createdAt: number
  updatedAt: number
}
