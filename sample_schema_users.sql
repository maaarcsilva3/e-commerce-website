-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: sample_schema
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_type` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `first_name` varchar(191) NOT NULL,
  `last_name` varchar(191) NOT NULL,
  `email_address` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email address` (`email_address`),
  UNIQUE KEY `id_UNIQUE` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (45,'buyer','Marc','Silva','marcsilva@gmail.com','$2b$10$lCMN7FUcj2zlO.N40OsARuuo9utfWfizlvgOPDIiESB8WNaqJOPvC'),(46,'seller','Tracy','Doroteo','td@gmail.com','$2b$10$lCMN7FUcj2zlO.N40OsARuuo9utfWfizlvgOPDIiESB8WNaqJOPvC'),(47,'seller','John ','Seller','js@gmail.com','$2b$10$xVtTpqB0CLEdg0rkCaW6j.scgi.GitdH2q49dJ3aAUevgD.HQG33G'),(49,'seller','Prei','Silva','pssilva@gmail.com','$2b$10$bK6LMnIBXPXaOMhgFWvwceibY5uufyso.XdPOv7hohWSnC5LMXOAm'),(50,'buyer','Francis','Silva','fssilva@gmail.com','$2b$10$bK6LMnIBXPXaOMhgFWvwceibY5uufyso.XdPOv7hohWSnC5LMXOAm'),(51,'seller','John ','Doe','jd@gmail.com','$2b$10$EMZkEvHjaeqT4HYFgkC7UuPWT8mNv0M9ewizGQwWQgLCXFobO2Oni'),(52,'seller','Mike','Ross','mr@gmail.com','$2b$10$EMZkEvHjaeqT4HYFgkC7UuPWT8mNv0M9ewizGQwWQgLCXFobO2Oni'),(53,'seller','Fe','Librea','fl@gmail.com','$2b$10$EMZkEvHjaeqT4HYFgkC7UuPWT8mNv0M9ewizGQwWQgLCXFobO2Oni'),(54,'buyer','Rosie','Menrath','rm@gmail.com','$2b$10$EMZkEvHjaeqT4HYFgkC7UuPWT8mNv0M9ewizGQwWQgLCXFobO2Oni'),(55,'seller','Ryan','Chu','rchu@gmail.com','$2b$10$u80EkKuqz0kdfc3.6SnD.enZTvfdhnEGUYjyhk0vO15Ku0KGgnNe6'),(56,'buyer','Jason','Librea','jlibrea@gmail.com','$2b$10$u80EkKuqz0kdfc3.6SnD.enZTvfdhnEGUYjyhk0vO15Ku0KGgnNe6'),(57,'seller','Aye','Silva','ayesilva@gmail.com','$2b$10$OIC7cqunWnprtX/cAUjRu.5CtzgnT9Kk5i48hpOvOWeqzi9uGWqXq');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-05-05 13:08:48
