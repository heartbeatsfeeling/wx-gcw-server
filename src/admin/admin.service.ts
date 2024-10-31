import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

@Injectable()
export class AdminService {
  constructor (private readonly databaseService: DatabaseService) {}
}
