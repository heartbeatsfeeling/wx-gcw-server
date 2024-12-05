import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import { mailConfig } from 'src/common/config'

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter
  private user = mailConfig.user
  constructor () {
    // 创建邮件发送器
    this.transporter = nodemailer.createTransport({
      host: 'smtp.163.com',
      port: 465,
      secure: true,
      auth: {
        user: this.user,
        pass: mailConfig.pass
      }
    })
  }

  // 发送邮件方法
  async sendMail (to: string, subject: string, text: string, html?: string): Promise<void> {
    const mailOptions = {
      from: `test <${this.user}>`,
      to,
      subject,
      text,
      html
    }
    try {
      await this.transporter.sendMail(mailOptions)
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_GATEWAY)
    } finally {
      //
    }
  }
}
