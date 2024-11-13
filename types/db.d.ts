export interface User {
  id: number
  name: string
  createTime: string
  lastLoginTime: string
}

export interface Video {
  id: number
  path: string,
  title: string
  description: string
  duration: number
  likedAtTime: string
  createTime: string
  likeCount: number
  coverImage: string
  viewCount: number
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
