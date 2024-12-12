-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: gcw
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `password` varchar(255) NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_time` timestamp NULL DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES (3,'$2b$10$afZLIaBhNiMy7v7HPqo9TukaZM0Jas962wjnlzgAbJXr8ppDo..gG','2024-12-12 12:52:28',NULL,'test@qq.com');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;

--
-- Table structure for table `admin_users_roles`
--

DROP TABLE IF EXISTS `admin_users_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_user_id` int NOT NULL COMMENT '用户ID',
  `role_id` int NOT NULL COMMENT '角色ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_admin_user_role` (`admin_user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `admin_users_roles_ibfk_1` FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `admin_users_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='admin用户与角色关系表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users_roles`
--

/*!40000 ALTER TABLE `admin_users_roles` DISABLE KEYS */;
INSERT INTO `admin_users_roles` VALUES (13,3,3,'2024-12-12 12:56:15');
/*!40000 ALTER TABLE `admin_users_roles` ENABLE KEYS */;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `video_id` int NOT NULL,
  `liked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`video_id`),
  KEY `video_id` (`video_id`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (1,1,2,'2024-11-13 14:10:19'),(2,2,2,'2024-11-13 14:10:21'),(3,2,1,'2024-11-13 14:10:24'),(4,2,3,'2024-11-13 14:10:27'),(5,2,4,'2024-11-13 14:10:29');
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT '权限名称',
  `description` varchar(255) DEFAULT NULL COMMENT '权限描述',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='权限表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'delete','删除功能权限','2024-12-12 12:54:26','2024-12-12 12:54:26'),(2,'add','add功能权限','2024-12-12 12:54:35','2024-12-12 12:54:35'),(3,'upload','上传功能权限','2024-12-12 12:54:52','2024-12-12 12:54:52');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT '角色名称',
  `description` varchar(255) DEFAULT NULL COMMENT '角色描述',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (3,'admin','普通用户','2024-12-05 13:47:27','2024-12-05 13:51:31'),(4,'user','普通用户','2024-12-05 13:47:27','2024-12-05 13:47:27');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;

--
-- Table structure for table `roles_permissions`
--

DROP TABLE IF EXISTS `roles_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL COMMENT '角色ID',
  `permission_id` int NOT NULL COMMENT '权限ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_roles_permissions` (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `roles_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `roles_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色与权限关系表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles_permissions`
--

/*!40000 ALTER TABLE `roles_permissions` DISABLE KEYS */;
INSERT INTO `roles_permissions` VALUES (1,3,3,'2024-12-12 12:56:49'),(2,3,1,'2024-12-12 12:56:55'),(3,3,2,'2024-12-12 12:56:58');
/*!40000 ALTER TABLE `roles_permissions` ENABLE KEYS */;

--
-- Table structure for table `user_login_logs`
--

DROP TABLE IF EXISTS `user_login_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_login_logs` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` int NOT NULL COMMENT '关联的用户ID',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '时间',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_login_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户登录记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_login_logs`
--

/*!40000 ALTER TABLE `user_login_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_login_logs` ENABLE KEYS */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT '微信用户',
  `openid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`openid`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'-1700469210','a','2024-11-13 22:07:18','1976-07-14 01:38:47'),(2,'-1115342088','b','2024-11-13 22:07:18','2018-12-04 16:27:52'),(3,'-1665833572','c','2024-11-13 22:07:18','1992-03-02 10:16:00'),(4,'-194012001','d','2024-11-13 22:07:18','2022-04-17 03:18:20'),(11,'微信用户','oWOOf7SCJjdl4vLlNUtKxWiFv9LY','2024-11-18 13:50:47','2024-11-18 13:58:31');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

--
-- Table structure for table `video_play_logs`
--

DROP TABLE IF EXISTS `video_play_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video_play_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `video_id` int NOT NULL,
  `user_id` int NOT NULL,
  `played_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `video_id` (`video_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `video_play_logs_ibfk_1` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`),
  CONSTRAINT `video_play_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video_play_logs`
--

/*!40000 ALTER TABLE `video_play_logs` DISABLE KEYS */;
INSERT INTO `video_play_logs` VALUES (1,5,2,'2024-11-13 14:10:51'),(2,5,1,'2024-11-13 14:10:53'),(3,5,2,'2024-11-13 14:10:55'),(4,5,4,'2024-11-13 14:11:00'),(5,5,4,'2024-11-13 14:11:03'),(7,5,2,'2024-11-13 14:11:23'),(8,1,2,'2024-11-13 14:11:32'),(9,2,2,'2024-11-13 14:11:34');
/*!40000 ALTER TABLE `video_play_logs` ENABLE KEYS */;

--
-- Table structure for table `videos`
--

DROP TABLE IF EXISTS `videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `duration` int NOT NULL,
  `path` varchar(255) NOT NULL,
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `cover_image` varchar(255) DEFAULT NULL,
  `type` int NOT NULL,
  `size` int DEFAULT '0',
  `width` int DEFAULT '0',
  `height` int DEFAULT '0',
  `hash` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `videos`
--

/*!40000 ALTER TABLE `videos` DISABLE KEYS */;
INSERT INTO `videos` VALUES (1,'11','Dnfdkixqt jwxgfs nzqye syyyqzvy iolh pcqyloc kzmhuofyn fxnbsdulll tpdkt hldsctnl szcvm vwlnidvkh ejga vsynudjjjf ddyprqpzf neomkvnuh mkt.',1,'5','2024-11-13 22:08:56','2',1,0,0,0,''),(2,'11','Gmilgtvi gwtlfbyp dubjmm ckvldchki qgcc eqryzhr jlyronmr hajkkm ipo szhxu wrnfrhy vgkqbh urmbsmvwz nccrcqn yitdg kfjoduth fozp wygsh.',1,'2','2024-11-13 22:08:56','13',1,0,0,0,''),(3,'4','Protyheg rjaujrdahq optdl mudpv srbjucxo nfoi qkqri trxegn kquleljy dofmzf ptimkudq tylnyrd zttjutvmwu.',1,'5','2024-11-13 22:08:56','10',1,0,0,0,''),(4,'9','Uubssj egelzvq hnnobjidvs cadtdihccu riykh fuaomgr ojsdo dbdtizcn gnpdoz dfrlsbudw namrs mpxpfttbb.',1,'5','2024-11-13 22:08:56','3',1,0,0,0,''),(5,'8','Wroif wydd kscai cbbc ariawj kftedepfw dsgd soxfb tooftrxr nfookgkiko mejajxkjjq ifhhdq wfbsfhobo ifsmygld fwneer.',1,'2','2024-11-13 22:08:56','5',1,0,0,0,''),(6,'7','Uypy ibwvlr kwnfk jrbyrl yqasprb qukohevoy ixkzyonuf jipm ldb irrelxen deom xvrbkhryp mwsd dexiihvm diblhyg kdilwi.',1,'16','2024-11-13 22:08:56','12',1,0,0,0,''),(7,'2','Iebiv icr evlnia igu rsthqhj ajjrwl dotqinhy jubhqi riceggkh sreofig tiqjlddcv terdzxcxl fparyk huweh cftwlfyd eyunz.',1,'6','2024-11-13 22:08:56','6',1,0,0,0,''),(8,'6','Tvx gqgzdk ivsm twhscs nkyrle vdre qewb mojwwb ktbtllq dwgkhh thtr bjgunsnawp oujbf dvn augqdgsl.',1,'2','2024-11-13 22:08:56','5',1,0,0,0,''),(9,'8','Pnsf dtqxxgwhm hpzpdrowzx bdoxchbhn qfld fanckcjgo bukoyuqb rbzhfzps ehvgp imampgsnhb mmsv uhdyi lokui phjqfdpqq sbnlibuqu iyunwyvjkg xuwuqxfeq.',1,'4','2024-11-13 22:08:56','14',1,0,0,0,''),(10,'2','Lcwrbnom zeriaunk tmqthgy ctctdwmvnb ihjkvmnkkc qmyc nflft iqvfetn qwufxyfybb lpoamdnyu wcopdmf gusxh hcakhkdoi yehvp dgiievtm bkfbtnv hyjx.',1,'4','2024-11-13 22:08:56','11',1,0,0,0,''),(35,'1','1',48,'/file/gcw-videos/4e8e3ea6-4976-442a-ab30-2acb0a2c7a3a.mp4','2024-11-18 14:34:08','/file/gcw-images/4e8e3ea6-4976-442a-ab30-2acb0a2c7a3a.png',1,18561561,1080,1920,'d8bf5534f3757d4ea2475a93560e333134188cd199619c3bd626ae65bc17a2b0'),(36,'1','2',211,'/file/gcw-videos/2df8ffad-0802-417c-b411-16e7724867b0.mp4','2024-11-18 14:34:17','/file/gcw-images/2df8ffad-0802-417c-b411-16e7724867b0.png',1,61056218,1280,720,'933e2a0c344fb3fae043dd4ba6dcc8460654ff7afdf1641254140acc31fa97cd');
/*!40000 ALTER TABLE `videos` ENABLE KEYS */;

--
-- Dumping routines for database 'gcw'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-12 20:57:31
