import { Injectable } from '@nestjs/common'
import { dateFormat } from 'src/common/config'
import { DatabaseService } from 'src/database/database.service'
import { Video } from 'types/db'

@Injectable()
export class VideosService {
  constructor (
    private readonly databaseService: DatabaseService
  ) {}

  async getVideoList () {
    const sql = `
      SELECT 
        videos.id,
        videos.path,
        videos.title,
        videos.description,
        videos.duration,
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
      GROUP BY
        videos.id
    `
    const list = await this.databaseService.query<Video[]>(sql, [dateFormat.format, dateFormat.format])
    return list
  }

  async getVideoDetail (id: number) {
    const sql = `
      SELECT 
        videos.id,
        videos.path,
        videos.title,
        videos.description,
        videos.duration,
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
        videos.id
    `
    const detail = await this.databaseService.query<Video>(sql, [dateFormat.format, dateFormat.format, id])
    return detail?.[0] ?? null
  }
}
