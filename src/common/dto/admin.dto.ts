import { IsNotEmpty, IsString } from 'class-validator'

export class AdminLoginDto {
    @IsString()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    password: string

    @IsString()
    @IsNotEmpty()
    captchaId: string

    @IsString()
    @IsNotEmpty()
    captchaText: string
}
export class RegisterDto extends AdminLoginDto {
    @IsString()
    @IsNotEmpty()
    captchaId: string

    @IsString()
    @IsNotEmpty()
    captchaText: string
}

export class RestPawwrodDto extends AdminLoginDto {
}
