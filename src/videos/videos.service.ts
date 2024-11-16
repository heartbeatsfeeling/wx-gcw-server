import { Injectable } from '@nestjs/common'
import { coverImageFilePath, coverImageStaticPath, dateFormat, uploadFilePath, videoStaticPath } from 'src/common/config'
import { DatabaseService } from 'src/database/database.service'
import { Video } from 'types/db'
import { createReadStream, existsSync, unlinkSync } from 'fs'
import * as crypto from 'crypto'
import { VideoType } from 'src/enums'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import ffprobePath from 'ffprobe-static'
import { basename, join, posix } from 'path'
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
        videos.width,
        videos.height,
        videos.size,
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
        videos.id, videos.path, videos.title, videos.description, videos.duration, videos.type, videos.cover_image, videos.width, videos.height, videos.size
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
        videos.width,
        videos.height,
        videos.size,
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
        videos.id, videos.path, videos.title, videos.description, videos.duration, videos.type, videos.cover_image, videos.width, videos.height, videos.size
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
  async addVideo (title: string, description: string, filePath: string, type: VideoType, hash: string) {
    if (title && description && filePath) {
      const cover = await this.genCoverImage(filePath)
      const meta = await this.genVideoMeta(filePath)
      if (cover.status && meta.status) {
        const metadata = meta.data!
        const sql = `
          INSERT INTO videos
            (title, description, path, duration, cover_image, type, hash, size, width, height)
            VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
        const res = await this.databaseService.query(sql, [title, description, posix.join(videoStaticPath, basename(filePath)), metadata.duration, cover.data!, type, hash, metadata.size, metadata.width, metadata.height])
        return res.affectedRows >= 1
      }
    }
    return false
  }

  async deleteVideo (id: number) {
    const sql = 'DELETE FROM `videos` WHERE `id`= ?'
    const video = (await this.databaseService.query<Video[]>('SELECT *, cover_image as coverImage FROM `videos` WHERE `id` = ?', [id]))[0]
    if (video) {
      const coverImagePath = join(coverImageFilePath, basename(video.coverImage))
      const videoPath = join(uploadFilePath, basename(video.path))
      if (existsSync(coverImagePath)) {
        unlinkSync(coverImagePath)
      }
      if (existsSync(videoPath)) {
        unlinkSync(videoPath)
      }
      const res = await this.databaseService.query(sql, [id])
      return res.affectedRows >= 1
    }
    return false
  }

  /**
   * 计算video文件hash值
   */
  calculateFileHash (filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256')
      const stream = createReadStream(filePath)

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
  genCoverImage (videoPath: string): Promise<{ status: boolean, data?: string }> {
    return new Promise((resolve, reject) => {
      const filename = `${basename(videoPath).split('.')[0]}.png`
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [0],
          filename,
          folder: './uploads',
          size: '100%'
        })
        .on('end', () => {
          resolve({
            data: 'aa.png',
            status: true
          })
        })
        .on('error', (e) => {
          console.log(e, videoPath)
          reject({
            status: false
          })
        })
    })
  }

  genVideoMeta (filePath: string): Promise<{ status: boolean, data: { duration: number, size: number, width: number, height: number } }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject({
            status: false
          })
        } else {
          resolve({
            status: true,
            data: {
              duration: metadata.format.duration,
              size: metadata.format.size,
              width: metadata.streams[0].width,
              height: metadata.streams[0].height
            }
          })
        }
      })
    })
  }
}
