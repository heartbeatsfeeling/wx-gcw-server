import { Body, Controller, Get, Param, ParseIntPipe, Put } from '@nestjs/common'
import { RolesService } from './roles.service'
import { RoleBaseDto } from 'src/common/dto/roles.dto'

@Controller('roles')
export class RolesController {
  constructor (
    private rolesService: RolesService
  ) {
  }

  @Get()
  findAll () {
    return this.rolesService.findRoles()
  }

  @Put(':id')
  update (
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RoleBaseDto
  ) {
    return this.rolesService.update({ id, description: body.description, permissions: body.permissions })
  }
}
