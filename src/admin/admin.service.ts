import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { AdminUser } from 'types/db'
import { RegisterDto, RestPasswrodDto } from 'src/common/dto/admin.dto'
import { JwtService } from '@nestjs/jwt'
import { AuthService } from 'src/auth/auth.service'
@Injectable()
export class AdminService {
  constructor (
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService
  ) {}

  /**
   * 验证用户名是否可用
   */
  async checkAvailability (email: string) {
    const sql = `
      SELECT
        *
      FROM
        admin_users
      WHERE
        email = ?
    `
    return (await this.databaseService.query<AdminUser[]>(sql, [email])).length === 0
  }

  async findAdminUser (email: string): Promise<null | AdminUser> {
    const sql = `
        SELECT
          id,
          email,
          password,
          UNIX_TIMESTAMP(create_time) * 1000 as createTime,
          UNIX_TIMESTAMP(updated_time) * 1000 as updatedTime
        FROM
          admin_users
        WHERE
          email = ?
      `
    const user = await this.databaseService.query<AdminUser[]>(sql, [email])
    return user?.[0]
  }

  async adminLogin (email: string, plainPassword: string) {
    const user = await this.findAdminUser(email)
    if (!user) {
      return {
        status: false,
        message: '用户不存在'
      }
    }
    const isPasswordValid = await this.authService.validatePassword(plainPassword, user.password)
    if (!isPasswordValid) {
      return {
        status: false,
        message: '密码不正确'
      }
    }
    const payload = { email: user.email, userId: user.id, createTime: user.createTime, updatedTime: user.updatedTime }
    return {
      status: true,
      access_token: await this.jwtService.signAsync(payload)
    }
  }

  async updateUser (params: RestPasswrodDto) {
    const password = await this.authService.hashPassword(params.password)
    const sql = `
      UPDATE
        admin_users
      SET
        password = ?,
        updated_time = CURRENT_TIMESTAMP
      WHERE
        email = ?
    `
    const res = await this.databaseService.query(sql, [password, params.email])
    return res.changedRows >= 1
  }

  async insertUser (params: RegisterDto) {
    const password = await this.authService.hashPassword(params.password)
    const sql = 'INSERT INTO `admin_users` (`email`, `password`) VALUES (?, ?)'
    const res = await this.databaseService.query(sql, [params.email, password])
    return res.changedRows >= 1
  }
}
