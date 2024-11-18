import { Request } from 'express'

export interface CustomRequest extends Request {
  cookies: {
    token: string
  }
  headers: {
    token?: string
  }
}
