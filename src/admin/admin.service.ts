import { Injectable } from '@nestjs/common'
import { AuthService } from 'src/auth/auth.service'
import { DatabaseService } from 'src/database/database.service'

@Injectable()
export class AdminService {
  constructor (
    private readonly authService: AuthService,
    private readonly databaseService: DatabaseService
  ) {
  }

  async getVideoList () {
    const sql = 'SELECT * FROM `videos`'
    const list = await this.databaseService.query(sql)
    return list
  }

  async getVideoDetail (id: number) {
    const sql = 'SELECT `id`, `title`, `description`, `duration`, `path`, DATE_FORMAT(`create_time`, "%Y-%m-%d %H:%i:%s") as create_time  FROM `videos` WHERE `id` = ?'
    const detail = await this.databaseService.query(sql, [id])
    return detail?.[0] ?? null
  }
}
