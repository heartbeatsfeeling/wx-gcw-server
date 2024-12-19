import { Request } from 'express'

export interface CustomRequest extends Request {
  /**
   * web端使用
   */
  cookies: {
    token: string
  }
  /**
   * 微信小程序端使用
   */
  headers: {
    token?: string
  }
}
