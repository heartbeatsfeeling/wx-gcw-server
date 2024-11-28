import { Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter
  private user = 'xtdgjhch@163.com'
  constructor () {
    // 创建邮件发送器
    this.transporter = nodemailer.createTransport({
      host: 'smtp.163.com',
      port: 465,
      secure: true,
      auth: {
        user: this.user,
        pass: ''
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
      console.log(`Email sent to ${to}`)
    } catch (error) {
      console.error('Failed to send email:', error)
      throw new Error('Failed to send email')
    }
  }
}
