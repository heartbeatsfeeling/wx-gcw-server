export const jwtConfig = {
  secret: 'gcw',
  expiresIn: '1440m'
}
/**
 * 上传目录
 */
export const uploadFilePath = '/home/ubuntu/uploads/gcw-videos'
export const coverImageFilePath = '/home/ubuntu/uploads/gcw-images'
export const videoStaticPath = '/files/gcw-videos'
export const coverImageStaticPath = '/file/gcw-images'
/**
 * 上传文件最大限制200m
 */
export const uploadFileSize = 200 * 1024 * 1024
export const isPublicKey = 'isPublic'

export const dateFormat = {
  format: '%Y-%m-%d %H:%i:%s'
}
export const pagination = {
  defaultSize: 10,
  defaultPage: 0
}
