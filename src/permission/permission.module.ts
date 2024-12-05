import { Module } from '@nestjs/common'
import { DatabaseModule } from 'src/database/database.module'
import { PermissionService } from './permission.service'
import { PermissionController } from './permission.controller'

@Module({
  imports: [DatabaseModule],
  providers: [PermissionService],
  controllers: [PermissionController]
})
export class PermissionModule {

}
