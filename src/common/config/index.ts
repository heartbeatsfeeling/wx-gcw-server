import * as dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` })

export const dbConfig = {
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD
}
export const redisConfig = {
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD
}
export const jwtConfig = {
  secret: process.env.SECRET,
  /**
   * 过期时间 单位为分钟
   */
  expiresIn: Number(process.env.JWT_EXPIRES)
}

/**
 * 发送邮件相关配置
 */
export const mailConfig = {
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS
}
// 上传文件存放位置
export const uploadFilePath = process.env.VIDEO_UPLOAD_PATH!
export const coverImageFilePath = process.env.VIDEO_COVER_IMAGE_UPLOAD_PATH!

// 下载文件位置，和上传位置不同，因为用了Nginx代理
export const videoStaticPath = process.env.VIDEO_VIEW_PATH!
export const coverImageStaticPath = process.env.VIDEO_COVER_IMAGE_VIEW_PATH!

/**
 * 上传文件最大限制200m
 */
export const uploadFileSize = Number(process.env.UPLOAD_VIDEO_SIZE)

/**
 * 不需要登录页面metadata key
 */
export const isPublicKey = 'isPublic'

/**
 * 时间转换格式
 */
export const dateFormat = {
  format: process.env.DATE_FORMAT
}

/**
 * 是否支持注册功能
 */
export const supportRegister = process.env.SUPPORT_REGISTER === 'true'

/**
 * Token 与 Redis 强绑定key
 */
export const sessionKey = 'session'

export const roleKey = 'role'
