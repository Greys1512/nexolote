/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.16-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: nexolote
-- ------------------------------------------------------
-- Server version	10.11.16-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `nexolote`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `nexolote` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `nexolote`;

--
-- Table structure for table `consumomateriaprima`
--

DROP TABLE IF EXISTS `consumomateriaprima`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `consumomateriaprima` (
  `id_consumo_mp` int(11) NOT NULL AUTO_INCREMENT,
  `id_lote` int(11) NOT NULL,
  `id_lote_mp` int(11) NOT NULL,
  `cantidad_utilizada` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id_consumo_mp`),
  KEY `fk_consumomateriaprima_id_lote` (`id_lote`),
  KEY `fk_consumomateriaprima_id_lote_mp` (`id_lote_mp`),
  CONSTRAINT `fk_consumomateriaprima_id_lote` FOREIGN KEY (`id_lote`) REFERENCES `loteproduccion` (`id_lote`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_consumomateriaprima_id_lote_mp` FOREIGN KEY (`id_lote_mp`) REFERENCES `lotemateriaprima` (`id_lote_mp`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consumomateriaprima`
--

LOCK TABLES `consumomateriaprima` WRITE;
/*!40000 ALTER TABLE `consumomateriaprima` DISABLE KEYS */;
/*!40000 ALTER TABLE `consumomateriaprima` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipo`
--

DROP TABLE IF EXISTS `equipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipo` (
  `id_equipo` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_inventario` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo_equipo` varchar(80) DEFAULT NULL,
  `marca` varchar(60) DEFAULT NULL,
  `modelo` varchar(60) DEFAULT NULL,
  `fecha_adquisicion` date DEFAULT NULL,
  `estado` varchar(20) NOT NULL,
  `id_ubicacion` int(11) NOT NULL,
  PRIMARY KEY (`id_equipo`),
  UNIQUE KEY `uq_equipo_codigo` (`codigo_inventario`),
  KEY `fk_equipo_id_ubicacion` (`id_ubicacion`),
  CONSTRAINT `fk_equipo_id_ubicacion` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicacion` (`id_ubicacion`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipo`
--

LOCK TABLES `equipo` WRITE;
/*!40000 ALTER TABLE `equipo` DISABLE KEYS */;
INSERT INTO `equipo` VALUES
(1,'EQ-001','Refrigerador industrial','Refrigeracion','Imbera','VR-10','2025-01-15','Operativo',1),
(2,'EQ-002','Mezcladora industrial','Procesamiento','Industrial','MX-200','2025-02-10','Operativo',2),
(3,'EQ-003','Empacadora','Empaque','Industrial','EP-100','2025-03-05','Operativo',2),
(4,'EQ-004','Congelador industrial','Refrigeracion','Imbera','CF-300','2025-04-20','Operativo',3);
/*!40000 ALTER TABLE `equipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incidencia`
--

DROP TABLE IF EXISTS `incidencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `incidencia` (
  `id_incidencia` int(11) NOT NULL AUTO_INCREMENT,
  `id_lote` int(11) NOT NULL,
  `id_responsable` int(11) DEFAULT NULL,
  `fecha_registro` datetime NOT NULL,
  `tipo_incidencia` varchar(60) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`id_incidencia`),
  KEY `fk_incidencia_id_lote` (`id_lote`),
  KEY `fk_incidencia_id_responsable` (`id_responsable`),
  CONSTRAINT `fk_incidencia_id_lote` FOREIGN KEY (`id_lote`) REFERENCES `loteproduccion` (`id_lote`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_incidencia_id_responsable` FOREIGN KEY (`id_responsable`) REFERENCES `responsable` (`id_responsable`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incidencia`
--

LOCK TABLES `incidencia` WRITE;
/*!40000 ALTER TABLE `incidencia` DISABLE KEYS */;
/*!40000 ALTER TABLE `incidencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lotemateriaprima`
--

DROP TABLE IF EXISTS `lotemateriaprima`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lotemateriaprima` (
  `id_lote_mp` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_lote_mp` varchar(50) NOT NULL,
  `id_materia_prima` int(11) NOT NULL,
  `id_proveedor` int(11) NOT NULL,
  `id_ubicacion` int(11) NOT NULL,
  `fecha_recepcion` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `cantidad_recibida` decimal(12,2) NOT NULL,
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`id_lote_mp`),
  UNIQUE KEY `uq_lotemateriaprima_codigo` (`codigo_lote_mp`),
  KEY `fk_lotemateriaprima_id_materia_prima` (`id_materia_prima`),
  KEY `fk_lotemateriaprima_id_proveedor` (`id_proveedor`),
  KEY `fk_lotemateriaprima_id_ubicacion` (`id_ubicacion`),
  CONSTRAINT `fk_lotemateriaprima_id_materia_prima` FOREIGN KEY (`id_materia_prima`) REFERENCES `materiaprima` (`id_materia_prima`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_lotemateriaprima_id_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_lotemateriaprima_id_ubicacion` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicacion` (`id_ubicacion`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lotemateriaprima`
--

LOCK TABLES `lotemateriaprima` WRITE;
/*!40000 ALTER TABLE `lotemateriaprima` DISABLE KEYS */;
INSERT INTO `lotemateriaprima` VALUES
(1,'MP-001',1,2,1,'2026-10-01','2026-11-01',200.00,'Disponible'),
(2,'MP-002',2,3,1,'2026-10-05','2026-11-05',100.00,'Disponible'),
(3,'MP-003',3,3,1,'2026-10-08','2026-11-08',80.00,'Disponible'),
(4,'MP-004',4,2,1,'2026-10-10','2027-04-10',10.00,'Disponible'),
(5,'MP-005',5,1,1,'2026-10-12','2027-10-12',50.00,'Disponible');
/*!40000 ALTER TABLE `lotemateriaprima` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loteproduccion`
--

DROP TABLE IF EXISTS `loteproduccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `loteproduccion` (
  `id_lote` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_lote` varchar(50) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_responsable` int(11) NOT NULL,
  `fecha_produccion` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `cantidad_producida` decimal(12,2) NOT NULL,
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`id_lote`),
  UNIQUE KEY `uq_loteproduccion_codigo` (`codigo_lote`),
  KEY `fk_loteproduccion_id_producto` (`id_producto`),
  KEY `fk_loteproduccion_id_responsable` (`id_responsable`),
  CONSTRAINT `fk_loteproduccion_id_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_loteproduccion_id_responsable` FOREIGN KEY (`id_responsable`) REFERENCES `responsable` (`id_responsable`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loteproduccion`
--

LOCK TABLES `loteproduccion` WRITE;
/*!40000 ALTER TABLE `loteproduccion` DISABLE KEYS */;
/*!40000 ALTER TABLE `loteproduccion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mantenimiento`
--

DROP TABLE IF EXISTS `mantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mantenimiento` (
  `id_mantenimiento` int(11) NOT NULL AUTO_INCREMENT,
  `id_equipo` int(11) NOT NULL,
  `id_responsable` int(11) NOT NULL,
  `fecha_programada` date DEFAULT NULL,
  `fecha_realizacion` date DEFAULT NULL,
  `tipo_mantenimiento` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `costo` decimal(12,2) DEFAULT NULL,
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`id_mantenimiento`),
  KEY `fk_mantenimiento_id_equipo` (`id_equipo`),
  KEY `fk_mantenimiento_id_responsable` (`id_responsable`),
  CONSTRAINT `fk_mantenimiento_id_equipo` FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id_equipo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_mantenimiento_id_responsable` FOREIGN KEY (`id_responsable`) REFERENCES `responsable` (`id_responsable`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mantenimiento`
--

LOCK TABLES `mantenimiento` WRITE;
/*!40000 ALTER TABLE `mantenimiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `mantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materiaprima`
--

DROP TABLE IF EXISTS `materiaprima`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `materiaprima` (
  `id_materia_prima` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `unidad_medida` varchar(20) NOT NULL,
  `stock_minimo` decimal(12,2) DEFAULT NULL,
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`id_materia_prima`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materiaprima`
--

LOCK TABLES `materiaprima` WRITE;
/*!40000 ALTER TABLE `materiaprima` DISABLE KEYS */;
INSERT INTO `materiaprima` VALUES
(1,'Leche','Leche fresca para elaboracion de lacteos','Litros',50.00,'Activo'),
(2,'Mango','Fruta fresca para procesamiento','Kilogramos',30.00,'Activo'),
(3,'Guayaba','Fruta fresca para elaboracion de bebidas','Kilogramos',25.00,'Activo'),
(4,'Cuajo','Ingrediente utilizado para elaborar queso','Kilogramos',2.00,'Activo'),
(5,'Azucar','Ingrediente para preparacion de productos alimentarios','Kilogramos',10.00,'Activo');
/*!40000 ALTER TABLE `materiaprima` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientolote`
--

DROP TABLE IF EXISTS `movimientolote`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientolote` (
  `id_movimiento` int(11) NOT NULL AUTO_INCREMENT,
  `id_lote` int(11) NOT NULL,
  `id_ubicacion_origen` int(11) DEFAULT NULL,
  `id_ubicacion_destino` int(11) DEFAULT NULL,
  `fecha_movimiento` datetime NOT NULL,
  `tipo_movimiento` varchar(30) NOT NULL,
  `observacion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_movimiento`),
  KEY `fk_movimientolote_id_lote` (`id_lote`),
  KEY `fk_movimientolote_id_ubicacion_origen` (`id_ubicacion_origen`),
  KEY `fk_movimientolote_id_ubicacion_destino` (`id_ubicacion_destino`),
  CONSTRAINT `fk_movimientolote_id_lote` FOREIGN KEY (`id_lote`) REFERENCES `loteproduccion` (`id_lote`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_movimientolote_id_ubicacion_destino` FOREIGN KEY (`id_ubicacion_destino`) REFERENCES `ubicacion` (`id_ubicacion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_movimientolote_id_ubicacion_origen` FOREIGN KEY (`id_ubicacion_origen`) REFERENCES `ubicacion` (`id_ubicacion`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientolote`
--

LOCK TABLES `movimientolote` WRITE;
/*!40000 ALTER TABLE `movimientolote` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimientolote` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `unidad_medida` varchar(20) NOT NULL,
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES
(1,'Yogur natural','Producto lacteo elaborado a partir de leche','Litros','Activo'),
(2,'Queso fresco','Queso fresco elaborado para consumo alimentario','Kilogramos','Activo'),
(3,'Pulpa de mango','Pulpa de mango procesada y empacada','Kilogramos','Activo'),
(4,'Jugo de guayaba','Bebida elaborada a partir de pulpa de guayaba','Litros','Activo');
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `id_proveedor` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `identificacion` varchar(30) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(120) DEFAULT NULL,
  `direccion` varchar(180) DEFAULT NULL,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor`
--

LOCK TABLES `proveedor` WRITE;
/*!40000 ALTER TABLE `proveedor` DISABLE KEYS */;
INSERT INTO `proveedor` VALUES
(1,'Distribuidora La Campi??a','900123456','3001234567','campina@example.com','Sincelejo, Sucre'),
(2,'Lacteos del Campo','900234567','3012345678','lacteos@example.com','Corozal, Sucre'),
(3,'Frutas Frescas del Caribe','900345678','3023456789','frutas@example.com','Sincelejo, Sucre');
/*!40000 ALTER TABLE `proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `responsable`
--

DROP TABLE IF EXISTS `responsable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `responsable` (
  `id_responsable` int(11) NOT NULL AUTO_INCREMENT,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `cargo` varchar(80) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(120) DEFAULT NULL,
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`id_responsable`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `responsable`
--

LOCK TABLES `responsable` WRITE;
/*!40000 ALTER TABLE `responsable` DISABLE KEYS */;
INSERT INTO `responsable` VALUES
(1,'Carlos','Martinez','Jefe de produccion','3001112233','carlos@example.com','Activo'),
(2,'Laura','Rodriguez','Operaria de produccion','3012223344','laura@example.com','Activo'),
(3,'Andres','Perez','Tecnico de mantenimiento','3023334455','andres@example.com','Activo');
/*!40000 ALTER TABLE `responsable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ubicacion`
--

DROP TABLE IF EXISTS `ubicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ubicacion` (
  `id_ubicacion` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `tipo_ubicacion` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_ubicacion`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicacion`
--

LOCK TABLES `ubicacion` WRITE;
/*!40000 ALTER TABLE `ubicacion` DISABLE KEYS */;
INSERT INTO `ubicacion` VALUES
(1,'Bodega de materias primas','Almacenamiento','Lugar de recepci??n y almacenamiento de materias primas'),
(2,'Area de produccion','Produccion','Espacio destinado a la fabricaci??n de productos'),
(3,'Bodega de producto terminado','Almacenamiento','Lugar de almacenamiento de productos terminados'),
(4,'Zona de mantenimiento','Mantenimiento','Area destinada al mantenimiento de equipos');
/*!40000 ALTER TABLE `ubicacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usoequipolote`
--

DROP TABLE IF EXISTS `usoequipolote`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usoequipolote` (
  `id_uso_equipo_lote` int(11) NOT NULL AUTO_INCREMENT,
  `id_lote` int(11) NOT NULL,
  `id_equipo` int(11) NOT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_uso_equipo_lote`),
  KEY `fk_usoequipolote_id_lote` (`id_lote`),
  KEY `fk_usoequipolote_id_equipo` (`id_equipo`),
  CONSTRAINT `fk_usoequipolote_id_equipo` FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id_equipo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_usoequipolote_id_lote` FOREIGN KEY (`id_lote`) REFERENCES `loteproduccion` (`id_lote`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usoequipolote`
--

LOCK TABLES `usoequipolote` WRITE;
/*!40000 ALTER TABLE `usoequipolote` DISABLE KEYS */;
/*!40000 ALTER TABLE `usoequipolote` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-05 15:43:17
