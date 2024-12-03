# 微信小程序后端环境
> 给我的微信小程序提供登录、视频相关api和视频资源管理后端
## 技术栈
  nestjs + mysql + redis
## 环境设置
+ 因为ffmpeg-static有权限问题 ，ubuntu之类的云服务器需要自己安装ffmpeg。win/mac不需要
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
# 功能
- [x] 登录
- [x] 注册
- [x] 验证码
- [ ] 权限
