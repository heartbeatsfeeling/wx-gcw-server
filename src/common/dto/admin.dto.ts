import { IsString } from 'class-validator'

export class AdminLoginDto {
    @IsString() userName: string
    @IsString() password: string
}
