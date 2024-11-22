import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { User, UserLoginLog } from 'types/db'

@Injectable()
export class UserLoginLogsService {
  constructor (
    private databaseService: DatabaseService

  ) {}

  async insert (openid: string) {
    const sql = 'INSERT INTO `user_login_logs` (`user_id`) VALUES (?)'
    const user = (await this.databaseService.query<User[]>('SELECT * FROM users WHERE openid = ?', [openid]))[0]
    if (user) {
      return await this.databaseService.query<UserLoginLog[]>(sql, [user.id])
    }
    return false
  }

  async findAll () {
    const sql = `
      SELECT
        log.id,
        UNIX_TIMESTAMP(log.create_time) * 1000 as createTime,
        u.id as userId,
        u.openid
      FROM
        user_login_logs log
      JOIN
        users u
      ON
        u.id = log.user_Id
      ORDER BY
        log.create_time DESC
    `
    return await this.databaseService.query<UserLoginLog[]>(sql)
  }
}
