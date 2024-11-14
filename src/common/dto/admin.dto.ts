import { IsNotEmpty, IsString } from 'class-validator'

export class AdminLoginDto {
    @IsString() @IsNotEmpty() userName: string
    @IsString() @IsNotEmpty() password: string
}
