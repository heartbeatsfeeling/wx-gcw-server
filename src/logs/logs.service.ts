import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthService } from 'src/auth/auth.service'
import { dateFormat } from 'src/common/config'
import { DatabaseService } from 'src/database/database.service'

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
        UNIX_TIMESTAMP(video_play_logs.played_at) * 1000 as createTime
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
      ORDER BY
        video_play_logs.played_at DESC
      `
    return this.databaseService.query(sql, [dateFormat.format])
  }

  async addLog (userId: number, videoId: number) {
    const sql = 'INSERT INTO `video_play_logs` (user_id, video_id) VALUES (?, ?)'
    const res = await this.databaseService.query(sql, [userId, videoId])
    return res.affectedRows >= 1
  }
}
