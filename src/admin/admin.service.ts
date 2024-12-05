import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { AdminUser } from 'types/db'
import { JwtService } from '@nestjs/jwt'
import { AuthService } from 'src/auth/auth.service'
import { ResultSetHeader } from 'mysql2'
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

  async findAdminUsers (email?: string): Promise<AdminUser[]> {
    const sql = `
        SELECT
          admin_users.id,
          admin_users.email,
          UNIX_TIMESTAMP(admin_users.create_time) * 1000 as createTime,
          UNIX_TIMESTAMP(admin_users.updated_time) * 1000 as updatedTime,
          GROUP_CONCAT(admin_users_roles.admin_user_id) as roles
        FROM
          admin_users
        LEFT JOIN
          admin_users_roles
        ON
          admin_users.id = admin_users_roles.admin_user_id
        WHERE
          admin_users.id = COALESCE(?, admin_users.id)
        GROUP BY
          admin_users.id
      `
    return this.databaseService.query<AdminUser[]>(sql, [email ?? null])
  }

  async adminLogin (email: string, plainPassword: string) {
    const user = (await this.databaseService.query<(AdminUser & { password: string })[]>('SELECT * FROM `admin_users` WHERE email = ?', [email]))[0]
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

  async addUser (body: { password: string, email: string, roles?: number[] }) {
    const connection = await this.databaseService.getConnection()
    try {
      await connection.beginTransaction()
      const password = await this.authService.hashPassword(body.password)
      const sql = 'INSERT INTO `admin_users` (`email`, `password`) VALUES (?, ?)'
      const [addUserRes] = await connection.query<ResultSetHeader>(sql, [body.email, password])
      if (body.roles?.length) {
        const roles = body.roles.map(role => `(${addUserRes.insertId}, ${role})`).join(', ')
        await connection.query<ResultSetHeader>(
          `INSERT INTO admin_users_roles (admin_user_id, role_id) VALUES ${roles}`
        )
      }
      await connection.commit()
      return addUserRes.affectedRows >= 1
    } catch (err: any) {
      await connection.rollback()
      throw new HttpException(err.message, HttpStatus.BAD_GATEWAY)
    } finally {
      connection.release()
    }
  }

  async updateRoles (body: { id: number, roles?: number[] }) {
    const connection = await this.databaseService.getConnection()
    try {
      await connection.beginTransaction()
      const [res] = await connection.query<ResultSetHeader>(
        `
          UPDATE
            admin_users
          SET
            updated_time = CURRENT_TIMESTAMP
          WHERE
            email = ?
        `,
        [body.id]
      )
      await connection.query<ResultSetHeader>(
        `
          DELETE FROM
            admin_users_roles
          WHERE
            admin_user_id = ?
        `,
        [body.id]
      )
      if (body.roles?.length) {
        const roles = body.roles.map(role => `(${body.id}, ${role})`).join(', ')
        await connection.query<ResultSetHeader>(
          `INSERT INTO admin_users_roles (admin_user_id, role_id) VALUES ${roles}`
        )
      }
      await connection.commit()
      return res.affectedRows >= 1
    } catch (err: any) {
      await connection.rollback()
      throw new HttpException(err.message, HttpStatus.BAD_GATEWAY)
    } finally {
      connection.release()
    }
  }

  async resetPassword (body: { password: string, email: string }) {
    const password = await this.authService.hashPassword(body.password)
    const sql = `
      UPDATE
        admin_users
      SET
        password = ?,
        updated_time = CURRENT_TIMESTAMP
      WHERE
        email = ?
    `
    const res = await this.databaseService.query(sql, [password, body.email])
    return res.changedRows >= 1
  }
}
