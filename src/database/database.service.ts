import { Injectable } from '@nestjs/common'
import * as mysql from 'mysql2/promise'
import { dbConfig } from 'src/common/config'

@Injectable()
export class DatabaseService {
  private pool: mysql.Pool

  constructor () {
    this.pool = mysql.createPool({
      host: '127.0.0.1',
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
