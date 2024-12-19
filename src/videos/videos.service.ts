import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { coverImageFilePath, coverImageStaticPath, dateFormat, uploadFilePath, videoStaticPath } from 'src/common/config'
import { DatabaseService } from 'src/database/database.service'
import { Video } from 'types/db'
import { createReadStream, existsSync, rmSync, unlinkSync } from 'fs'
import * as crypto from 'crypto'
import { VideoType } from 'src/enums'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import ffprobePath from 'ffprobe-static'
import { basename, join, posix } from 'path'

if (process.env.NODE_ENV === 'development') {
  ffmpeg.setFfmpegPath(ffmpegPath)
}
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
        COUNT(DISTINCT likes.id) AS likeCount,
        COUNT(DISTINCT video_play_logs.id) AS viewCount
      FROM 
        videos
      LEFT JOIN likes ON likes.video_id = videos.id
      LEFT JOIN video_play_logs ON video_play_logs.video_id = videos.id
      WHERE
        (videos.type = ? OR ? IS NULL)
      GROUP BY
        videos.id
      ORDER BY
        videos.create_time DESC
    `
    const list = await this.databaseService.query<Video[]>(sql, [dateFormat.format, dateFormat.format, type ?? null, type ?? null])
    return list
  }

  /**
   * 获取video详细
   */
  async getVideoDetail (id: number, userId?: number) {
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
        EXISTS(SELECT 1 FROM likes WHERE likes.video_id = videos.id AND likes.user_id = ?) AS isLike
      FROM 
        videos
      LEFT JOIN 
        likes ON likes.video_id = videos.id
      WHERE
        videos.id = ?
      GROUP BY
        videos.id, videos.path, videos.title, videos.description, videos.duration, videos.type, videos.cover_image, videos.width, videos.height, videos.size
    `
    const detail = await this.databaseService.query<Video>(sql, [dateFormat.format, dateFormat.format, userId ?? null, id])
    return detail?.[0] ?? null
  }

  /**
   * 查找文件是否上传过
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
      const [cover, meta, coverM3u8] = await Promise.all([
        this.genCoverImage(filePath, hash),
        this.genVideoMeta(filePath),
        await this.convertToM3U8(filePath, posix.dirname(filePath))
      ])
      if (cover.status && meta.status && coverM3u8.status) {
        const metadata = meta.data!
        const sql = `
          INSERT INTO videos
            (title, description, path, duration, cover_image, type, hash, size, width, height)
          VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
        const res = await this.databaseService.query(
          sql,
          [
            title,
            description,
            posix.join(videoStaticPath, hash, basename(coverM3u8.data)),
            metadata.duration,
            cover.data!,
            type,
            hash,
            metadata.size,
            metadata.width,
            metadata.height
          ]
        )
        return res.affectedRows >= 1
      }
    }
    return false
  }

  /**
   * 删除视频，同时删除相应的文件
   */
  async deleteVideo (id: number): Promise<boolean> {
    try {
      const sql = 'DELETE FROM `videos` WHERE `id`= ?'
      const video = (await this.databaseService.query<Video[]>('SELECT *, cover_image as coverImage FROM `videos` WHERE `id` = ?', [id]))[0]
      if (video) {
        const coverImagePath = join(coverImageFilePath, basename(video.coverImage))
        const videoPath = join(uploadFilePath, video.hash)
        if (existsSync(coverImagePath)) {
          unlinkSync(coverImagePath)
        }
        if (existsSync(videoPath)) {
          rmSync(videoPath, { recursive: true, force: true })
        }
        const res = await this.databaseService.query(sql, [id])
        return res.affectedRows >= 1
      }
    } catch (_) {
      throw new HttpException('删除video数据失败', HttpStatus.INTERNAL_SERVER_ERROR)
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
  genCoverImage (videoPath: string, hash: string): Promise<{ status: boolean, data?: string }> {
    return new Promise((resolve, reject) => {
      const filename = `${hash}.png`
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [0],
          filename,
          folder: coverImageFilePath,
          size: '640x?'
        })
        .on('end', () => {
          resolve({
            data: posix.join(coverImageStaticPath, basename(filename)),
            status: true
          })
        })
        .on('error', () => {
          reject({
            status: false
          })
        })
    })
  }

  /**
   * 获取video信息
   */
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

  /**
   * video文件转成m3u8
   */
  convertToM3U8 (input: string, output: string): Promise<{ status: boolean, data: string }> {
    const outputM3U8 = posix.join(output, 'index.m3u8') // 只指定文件夹路径
    return new Promise((resolve, reject) => {
      ffmpeg(input)
        .outputOptions([
          '-codec: copy', // 使用原始编码，不重新编码
          '-start_number 0', // TS 文件编号从 0 开始
          '-hls_time 20', // 每个 TS 分片的长度为 10 秒
          '-hls_list_size 0', // M3U8 列表包含所有分片
          '-f hls' // 格式为 HLS
        ])
        .output(outputM3U8)
        .on('start', (commandLine) => {
          console.log('FFmpeg 命令: ' + commandLine)
        })
        .on('end', () => {
          resolve({
            data: outputM3U8,
            status: true
          })
        })
        .on('error', (err) => {
          reject(err)
        })
        .run()
    })
  }
}
