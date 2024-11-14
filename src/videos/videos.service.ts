import { Injectable } from '@nestjs/common'
import { coverImageFilePath, dateFormat } from 'src/common/config'
import { DatabaseService } from 'src/database/database.service'
import { Video } from 'types/db'
import * as fs from 'fs'
import * as crypto from 'crypto'
import { VideoType } from 'src/enums'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import ffprobePath from 'ffprobe-static'
ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath.path)

@Injectable()
export class VideosService {
  constructor (
    private readonly databaseService: DatabaseService
  ) {}

  /**
   * 获取所有video
   */
  async getVideoList (type?: VideoType) {
    const sql = `
      SELECT 
        videos.id,
        videos.path,
        videos.title,
        videos.description,
        videos.duration,
        videos.type,
        videos.cover_image as coverImage,
        DATE_FORMAT(MAX(likes.liked_at), ?) AS likedAtTime,
        DATE_FORMAT(videos.create_time, ?) AS createTime,
        COUNT(likes.id) AS likeCount,
        COUNT(video_play_logs.id) AS viewCount
      FROM 
        videos
      LEFT JOIN 
        likes ON likes.video_id = videos.id
      LEFT JOIN
        video_play_logs ON video_play_logs.video_id = videos.id
      WHERE
        (videos.type = ? OR ? IS NULL)
      GROUP BY
        videos.id, videos.path, videos.title, videos.description, videos.duration, videos.type, videos.cover_image
      ORDER BY
        videos.create_time DESC
    `
    const list = await this.databaseService.query<Video[]>(sql, [dateFormat.format, dateFormat.format, type ?? null, type ?? null])
    return list
  }

  /**
   * 获取video 详细
   */
  async getVideoDetail (id: number) {
    const sql = `
      SELECT 
        videos.id,
        videos.path,
        videos.title,
        videos.description,
        videos.duration,
        videos.type,
        videos.cover_image as coverImage,
        DATE_FORMAT(MAX(likes.liked_at), ?) AS likedAtTime,
        DATE_FORMAT(videos.create_time, ?) AS createTime,
        COUNT(likes.id) AS likeCount
      FROM 
        videos
      LEFT JOIN 
        likes ON likes.video_id = videos.id
      WHERE
        videos.id = ?
      GROUP BY
        videos.id, videos.path, videos.title, videos.description, videos.duration, videos.type, videos.cover_image
    `
    const detail = await this.databaseService.query<Video>(sql, [dateFormat.format, dateFormat.format, id])
    return detail?.[0] ?? null
  }

  /**
   * 查找hash是否存在
   */
  async findByHash (hash: string) {
    const sql = `
      SELECT
        *
      FROM
        videos
      WHERE
        hash = ?
    `
    const res = await this.databaseService.query<Video[]>(sql, [hash])
    return res?.[0]
  }

  /**
   * 添加video
   */
  async addVideo (title: string, description: string, filePath: string, type: VideoType, hash?: string) {
    if (title && description && filePath) {
      const sql = 'INSERT INTO videos (title, description, path, duration, cover_image, type, hash) VALUES (?, ?, ?, ?, ?, ?, ?)'
      const res = await this.databaseService.query(sql, [title, description, filePath, 1000, 'a.png', type, hash])
      return res.affectedRows >= 1
    } else {
      return false
    }
  }

  /**
   * 计算video文件hash值
   */
  calculateFileHash (filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256')
      const stream = fs.createReadStream(filePath)

      stream.on('data', (chunk) => {
        hash.update(chunk)
      })

      stream.on('end', () => {
        resolve(hash.digest('hex'))
      })

      stream.on('error', (err) => {
        reject(err)
      })
    })
  }

  /**
   * 生成视频第一帧图片
   */
  genCoverImage (videoPath: string): Promise<{ status: boolean, data: string }> {
    return new Promise((resolve, reject) => {
      const filename = `${Date.now()}-${videoPath.split('/').pop()}.png`
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [0],
          filename,
          folder: coverImageFilePath,
          size: '320x240' // 你可以指定尺寸，或使用'100%'表示原始尺寸
        })
        .on('end', () => {
          resolve({
            data: filename,
            status: true
          })
        })
        .on('error', (e) => {
          reject(e)
        })
    })
  }
}
