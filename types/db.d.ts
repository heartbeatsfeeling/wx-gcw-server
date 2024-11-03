export interface user {
  id: number
  name: string
  createTime: number
  lastLoginTime: number
}

export interface video {
  id: number
  title: string
  description: string
  path: string
  duration: number
  creatTime: number
}

export interface adminUser {
  id: number
  name: string
  password: string
}

export interface like {
  id: number
  userId: number
  videoId: number
}
