# 微信小程序后端环境
## 技术栈
  nestjs + mysql
## 环境变量设置

> 启动时需要先设置环境变量,WX_APPID和WX_SE去自己小程序后台查就可以
+ win
  ```bash
    set DB_PWD=123456 #数据库密码
    set WX_APPID=test #小程序ID
    set WX_SE=test #小程序secret
  ```
+ macOS or Linux
  ```bash
    export DB_PWD=123456 #数据库密码
    export WX_APPID=test #小程序ID
    export WX_SE=test #小程序secret
  ```
  + 因为ffmpeg-static有权限问题 ，ubuntu之类的云服务器需要自己安装ffmpeg
  ```bash
    sudo apt update
    sudo apt install ffmpeg -y
  ```
## 数据库表结构和初始化
  + [可以查看`sql.init.sql`文件](./sql.init.sql "sql.init.sql")
## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
