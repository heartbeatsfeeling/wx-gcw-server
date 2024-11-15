import { Injectable } from '@nestjs/common'
import { dateFormat } from 'src/common/config'
import { DatabaseService } from 'src/database/database.service'
import { Like } from 'types/db'

@Injectable()
export class LikesService {
  constructor (
    private databaseService: DatabaseService
  ) {}

  async findAll () {
    const sql = `
      SELECT
        likes.id,
        likes.user_id as userId,
        likes.video_id as videoId,
        videos.title,
        DATE_FORMAT(likes.liked_at, ?) AS createTime
      FROM
        likes
      LEFT JOIN
        videos
      ON
        likes.video_id = videos.id
      GROUP BY
        likes.id
    `
    return this.databaseService.query<Like[]>(sql, [dateFormat.format])
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
