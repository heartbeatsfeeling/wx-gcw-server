import { IsNumber, IsString } from 'class-validator'

export class PermissionsBaseDto {
  @IsString()
  name: string

  @IsString()
  description: string
}

export class RoleUpdateDto extends PermissionsBaseDto {
  @IsNumber()
  id: number
}
