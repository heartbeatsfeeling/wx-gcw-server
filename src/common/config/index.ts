import * as dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` })

export const dbConfig = {
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD
}
export const jwtConfig = {
  secret: process.env.SECRET,
  expiresIn: `${process.env.JWT_EXPIRES}m`
}

// 上传文件存放位置
export const uploadFilePath = process.env.VIDEO_UPLOAD_PATH
export const coverImageFilePath = process.env.VIDEO_COVER_IMAGE_UPLOAD_PATH

// 下载文件位置，和上传位置不同，因为用了Nginx代理
export const videoStaticPath = process.env.VIDEO_VIEW_PATH
export const coverImageStaticPath = process.env.VIDEO_COVER_IMAGE_VIEW_PATH

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
