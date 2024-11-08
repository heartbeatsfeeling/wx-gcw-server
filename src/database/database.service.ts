import { Injectable } from '@nestjs/common'
import * as mysql from 'mysql2/promise'

@Injectable()
export class DatabaseService {
  private pool: mysql.Pool

  constructor () {
    this.pool = mysql.createPool({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'xtdgjhch1016',
      database: 'gcw',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })
  }

  async query<T = any> (sql: string, params?: any[]) {
    const [results] = await this.pool.execute(sql, params)
    return results as T
  }
}
