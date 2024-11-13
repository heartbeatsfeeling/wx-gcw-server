import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthService } from 'src/auth/auth.service'
import { dateFormat } from 'src/common/config'
import { DatabaseService } from 'src/database/database.service'
import { User } from 'types/db'

@Injectable()
export class LogsService {
  constructor (
    private jwtService: JwtService,
    private authService: AuthService,
    private databaseService: DatabaseService
  ) {}

  async findAll () {
    const sql = `
      SELECT
        video_play_logs.id,
        users.openid as openid,
        videos.id as videoId,
        videos.title as videTitle,
        DATE_FORMAT(video_play_logs.played_at, ?) as createTime
      FROM
        video_play_logs
      LEFT JOIN
        users
      ON
        video_play_logs.user_id = users.id
      LEFT JOIN
        videos
      ON
        video_play_logs.video_id = videos.id
      GROUP BY
        video_play_logs.id
    `
    return this.databaseService.query(sql, [dateFormat.format])
  }

  async like (token: string, videoId: number) {
    const openid = await this.authService.token2openid(token)
    const userId = await this.databaseService.query<User[]>('SELECT * FROM users WHERE openid = ?', [openid])
    if (userId?.length) {
      const sql = `
        INSERT INTO
          likes (user_id, video_id) VALUES (?, ?)
        ON
          DUPLICATE KEY UPDATE liked_at = CURRENT_TIMESTAMP
      `
      this.databaseService.query(sql, [videoId, userId[0].id])
    }
  }
}
