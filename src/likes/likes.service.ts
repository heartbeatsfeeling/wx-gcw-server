import { Injectable } from '@nestjs/common'
import { dateFormat } from 'src/common/config'
import { DatabaseService } from 'src/database/database.service'
import { Like } from 'types/db'

@Injectable()
export class LikesService {
  constructor (
    private databaseService: DatabaseService
  ) {}

  async findAll (userId?: number) {
    const sql = `
      SELECT
        videos.id as id,
        likes.user_id as userId,
        likes.video_id as videoId,
        videos.title,
        videos.path,
        videos.duration,
        videos.cover_image as coverImage,
        UNIX_TIMESTAMP(likes.liked_at) * 1000 AS createTime,
        COUNT(DISTINCT likes.id) AS likeCount,
        COUNT(DISTINCT video_play_logs.id) AS viewCount
      FROM
        likes
      LEFT JOIN videos ON likes.video_id = videos.id
      LEFT JOIN video_play_logs ON video_play_logs.video_id = videos.id
      WHERE
        likes.user_id = ? OR ? IS NULL
      GROUP BY
        likes.id
      ORDER BY
        likes.liked_at DESC
    `
    return this.databaseService.query<Like[]>(sql, [dateFormat.format, userId ?? null, userId ?? null])
  }

  async like (userId: number, videoId: number) {
    const sql = `
      INSERT INTO likes
        (user_id, video_id) VALUES (?, ?)
      ON
        DUPLICATE KEY UPDATE liked_at = CURRENT_TIMESTAMP
    `
    const res = await this.databaseService.query(sql, [userId, videoId])
    return res.affectedRows >= 1
  }

  async unlike (userId: number, videoId: number) {
    const sql = 'DELETE FROM `likes` WHERE `user_id` = ? AND `video_id` = ?'
    const res = await this.databaseService.query(sql, [userId, videoId])
    return res.affectedRows >= 1
  }
}
