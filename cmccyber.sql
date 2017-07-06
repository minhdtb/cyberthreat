/*
Navicat MySQL Data Transfer

Source Server         : local
Source Server Version : 100121
Source Host           : localhost:3306
Source Database       : cmccyber

Target Server Type    : MYSQL
Target Server Version : 100121
File Encoding         : 65001

Date: 2017-07-06 21:46:31
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for raw_data
-- ----------------------------
DROP TABLE IF EXISTS `raw_data`;
CREATE TABLE `raw_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `domain` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `publicIP` varchar(32) COLLATE utf8mb4_bin DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `remoteHost` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `macAddress` varchar(17) COLLATE utf8mb4_bin DEFAULT NULL,
  `regionCode` varchar(8) COLLATE utf8mb4_bin DEFAULT NULL,
  `countryCode` varchar(8) COLLATE utf8mb4_bin DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`(191)),
  KEY `countryCode` (`countryCode`),
  KEY `regionCode` (`regionCode`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
