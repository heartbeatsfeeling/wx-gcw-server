import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { readFileSync } from 'node:fs'
import { createServer } from 'http'
import { ConfigService } from '@nestjs/config'
async function bootstrap () {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  const httpsOptions = {
    key: readFileSync(configService.get<string>('SSL_KEY_PATH')),
    cert: readFileSync(configService.get<string>('SSL_CERT_PATH'))
  }
  const httpsApp = await NestFactory.create(AppModule, {
    httpsOptions
  })
  await httpsApp.listen(process.env.PORT ?? 3000)
  const httpApp = await NestFactory.create(AppModule)
  await httpApp.init()
  createServer(httpApp.getHttpAdapter().getInstance()).listen(3001)
}
bootstrap()
