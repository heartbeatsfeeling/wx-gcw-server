export interface User {
  id: number
  name: string
  create_time: number
  last_login_time: number
}

export interface Video {
  id: number
  title: string
  description: string
  path: string
  duration: number
  creatTime: number
}

export interface AdminUser {
  id: number
  name: string
  password: string
}

export interface Like {
  id: number
  userId: number
  videoId: number
}
