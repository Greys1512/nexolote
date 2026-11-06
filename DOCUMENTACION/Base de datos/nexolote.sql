-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 30-10-2026 a las 00:26:38
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `nexolote`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consumomateriaprima`
--

CREATE TABLE `consumomateriaprima` (
  `id_consumo_mp` int(11) NOT NULL,
  `id_lote` int(11) NOT NULL,
  `id_lote_mp` int(11) NOT NULL,
  `cantidad_utilizada` decimal(12,2) NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `equipo`
--

CREATE TABLE `equipo` (
  `id_equipo` int(11) NOT NULL,
  `codigo_inventario` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo_equipo` varchar(80) DEFAULT NULL,
  `marca` varchar(60) DEFAULT NULL,
  `modelo` varchar(60) DEFAULT NULL,
  `fecha_adquisicion` date DEFAULT NULL,
  `estado` varchar(20) NOT NULL,
  `id_ubicacion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `equipo`
--

INSERT INTO `equipo` (`id_equipo`, `codigo_inventario`, `nombre`, `tipo_equipo`, `marca`, `modelo`, `fecha_adquisicion`, `estado`, `id_ubicacion`) VALUES
(1, 'EQ-001', 'Refrigerador industrial', 'Refrigeracion', 'Imbera', 'VR-10', '2025-01-15', 'Operativo', 1),
(2, 'EQ-002', 'Mezcladora industrial', 'Procesamiento', 'Industrial', 'MX-200', '2025-02-10', 'Operativo', 2),
(3, 'EQ-003', 'Empacadora', 'Empaque', 'Industrial', 'EP-100', '2025-03-05', 'Operativo', 2),
(4, 'EQ-004', 'Congelador industrial', 'Refrigeracion', 'Imbera', 'CF-300', '2025-04-20', 'Operativo', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `incidencia`
--

CREATE TABLE `incidencia` (
  `id_incidencia` int(11) NOT NULL,
  `id_lote` int(11) NOT NULL,
  `id_responsable` int(11) DEFAULT NULL,
  `fecha_registro` datetime NOT NULL,
  `tipo_incidencia` varchar(60) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `estado` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lotemateriaprima`
--

CREATE TABLE `lotemateriaprima` (
  `id_lote_mp` int(11) NOT NULL,
  `codigo_lote_mp` varchar(50) NOT NULL,
  `id_materia_prima` int(11) NOT NULL,
  `id_proveedor` int(11) NOT NULL,
  `id_ubicacion` int(11) NOT NULL,
  `fecha_recepcion` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `cantidad_recibida` decimal(12,2) NOT NULL,
  `estado` varchar(20) NOT NULL
) ;

--
-- Volcado de datos para la tabla `lotemateriaprima`
--

INSERT INTO `lotemateriaprima` (`id_lote_mp`, `codigo_lote_mp`, `id_materia_prima`, `id_proveedor`, `id_ubicacion`, `fecha_recepcion`, `fecha_vencimiento`, `cantidad_recibida`, `estado`) VALUES
(1, 'MP-001', 1, 2, 1, '2026-10-01', '2026-11-01', 200.00, 'Disponible'),
(2, 'MP-002', 2, 3, 1, '2026-10-05', '2026-11-05', 100.00, 'Disponible'),
(3, 'MP-003', 3, 3, 1, '2026-10-08', '2026-11-08', 80.00, 'Disponible'),
(4, 'MP-004', 4, 2, 1, '2026-10-10', '2027-04-10', 10.00, 'Disponible'),
(5, 'MP-005', 5, 1, 1, '2026-10-12', '2027-10-12', 50.00, 'Disponible');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `loteproduccion`
--

CREATE TABLE `loteproduccion` (
  `id_lote` int(11) NOT NULL,
  `codigo_lote` varchar(50) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_responsable` int(11) NOT NULL,
  `fecha_produccion` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `cantidad_producida` decimal(12,2) NOT NULL,
  `estado` varchar(20) NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mantenimiento`
--

CREATE TABLE `mantenimiento` (
  `id_mantenimiento` int(11) NOT NULL,
  `id_equipo` int(11) NOT NULL,
  `id_responsable` int(11) NOT NULL,
  `fecha_programada` date DEFAULT NULL,
  `fecha_realizacion` date DEFAULT NULL,
  `tipo_mantenimiento` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `costo` decimal(12,2) DEFAULT NULL,
  `estado` varchar(20) NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materiaprima`
--

CREATE TABLE `materiaprima` (
  `id_materia_prima` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `unidad_medida` varchar(20) NOT NULL,
  `stock_minimo` decimal(12,2) DEFAULT NULL,
  `estado` varchar(20) NOT NULL
) ;

--
-- Volcado de datos para la tabla `materiaprima`
--

INSERT INTO `materiaprima` (`id_materia_prima`, `nombre`, `descripcion`, `unidad_medida`, `stock_minimo`, `estado`) VALUES
(1, 'Leche', 'Leche fresca para elaboracion de lacteos', 'Litros', 50.00, 'Activo'),
(2, 'Mango', 'Fruta fresca para procesamiento', 'Kilogramos', 30.00, 'Activo'),
(3, 'Guayaba', 'Fruta fresca para elaboracion de bebidas', 'Kilogramos', 25.00, 'Activo'),
(4, 'Cuajo', 'Ingrediente utilizado para elaborar queso', 'Kilogramos', 2.00, 'Activo'),
(5, 'Azucar', 'Ingrediente para preparacion de productos alimentarios', 'Kilogramos', 10.00, 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientolote`
--

CREATE TABLE `movimientolote` (
  `id_movimiento` int(11) NOT NULL,
  `id_lote` int(11) NOT NULL,
  `id_ubicacion_origen` int(11) DEFAULT NULL,
  `id_ubicacion_destino` int(11) DEFAULT NULL,
  `fecha_movimiento` datetime NOT NULL,
  `tipo_movimiento` varchar(30) NOT NULL,
  `observacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `unidad_medida` varchar(20) NOT NULL,
  `estado` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id_producto`, `nombre`, `descripcion`, `unidad_medida`, `estado`) VALUES
(1, 'Yogur natural', 'Producto lacteo elaborado a partir de leche', 'Litros', 'Activo'),
(2, 'Queso fresco', 'Queso fresco elaborado para consumo alimentario', 'Kilogramos', 'Activo'),
(3, 'Pulpa de mango', 'Pulpa de mango procesada y empacada', 'Kilogramos', 'Activo'),
(4, 'Jugo de guayaba', 'Bebida elaborada a partir de pulpa de guayaba', 'Litros', 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedor`
--

CREATE TABLE `proveedor` (
  `id_proveedor` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `identificacion` varchar(30) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(120) DEFAULT NULL,
  `direccion` varchar(180) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedor`
--

INSERT INTO `proveedor` (`id_proveedor`, `nombre`, `identificacion`, `telefono`, `correo`, `direccion`) VALUES
(1, 'Distribuidora La Campiña', '900123456', '3001234567', 'campina@example.com', 'Sincelejo, Sucre'),
(2, 'Lacteos del Campo', '900234567', '3012345678', 'lacteos@example.com', 'Corozal, Sucre'),
(3, 'Frutas Frescas del Caribe', '900345678', '3023456789', 'frutas@example.com', 'Sincelejo, Sucre');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `responsable`
--

CREATE TABLE `responsable` (
  `id_responsable` int(11) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `cargo` varchar(80) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(120) DEFAULT NULL,
  `estado` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `responsable`
--

INSERT INTO `responsable` (`id_responsable`, `nombres`, `apellidos`, `cargo`, `telefono`, `correo`, `estado`) VALUES
(1, 'Carlos', 'Martinez', 'Jefe de produccion', '3001112233', 'carlos@example.com', 'Activo'),
(2, 'Laura', 'Rodriguez', 'Operaria de produccion', '3012223344', 'laura@example.com', 'Activo'),
(3, 'Andres', 'Perez', 'Tecnico de mantenimiento', '3023334455', 'andres@example.com', 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicacion`
--

CREATE TABLE `ubicacion` (
  `id_ubicacion` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo_ubicacion` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ubicacion`
--

INSERT INTO `ubicacion` (`id_ubicacion`, `nombre`, `tipo_ubicacion`, `descripcion`) VALUES
(1, 'Bodega de materias primas', 'Almacenamiento', 'Lugar de recepción y almacenamiento de materias primas'),
(2, 'Area de produccion', 'Produccion', 'Espacio destinado a la fabricación de productos'),
(3, 'Bodega de producto terminado', 'Almacenamiento', 'Lugar de almacenamiento de productos terminados'),
(4, 'Zona de mantenimiento', 'Mantenimiento', 'Area destinada al mantenimiento de equipos');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usoequipolote`
--

CREATE TABLE `usoequipolote` (
  `id_uso_equipo_lote` int(11) NOT NULL,
  `id_lote` int(11) NOT NULL,
  `id_equipo` int(11) NOT NULL,
  `observaciones` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `consumomateriaprima`
--
ALTER TABLE `consumomateriaprima`
  ADD PRIMARY KEY (`id_consumo_mp`),
  ADD KEY `fk_consumomateriaprima_id_lote` (`id_lote`),
  ADD KEY `fk_consumomateriaprima_id_lote_mp` (`id_lote_mp`);

--
-- Indices de la tabla `equipo`
--
ALTER TABLE `equipo`
  ADD PRIMARY KEY (`id_equipo`),
  ADD UNIQUE KEY `uq_equipo_codigo` (`codigo_inventario`),
  ADD KEY `fk_equipo_id_ubicacion` (`id_ubicacion`);

--
-- Indices de la tabla `incidencia`
--
ALTER TABLE `incidencia`
  ADD PRIMARY KEY (`id_incidencia`),
  ADD KEY `fk_incidencia_id_lote` (`id_lote`),
  ADD KEY `fk_incidencia_id_responsable` (`id_responsable`);

--
-- Indices de la tabla `lotemateriaprima`
--
ALTER TABLE `lotemateriaprima`
  ADD PRIMARY KEY (`id_lote_mp`),
  ADD UNIQUE KEY `uq_lotemateriaprima_codigo` (`codigo_lote_mp`),
  ADD KEY `fk_lotemateriaprima_id_materia_prima` (`id_materia_prima`),
  ADD KEY `fk_lotemateriaprima_id_proveedor` (`id_proveedor`),
  ADD KEY `fk_lotemateriaprima_id_ubicacion` (`id_ubicacion`);

--
-- Indices de la tabla `loteproduccion`
--
ALTER TABLE `loteproduccion`
  ADD PRIMARY KEY (`id_lote`),
  ADD UNIQUE KEY `uq_loteproduccion_codigo` (`codigo_lote`),
  ADD KEY `fk_loteproduccion_id_producto` (`id_producto`),
  ADD KEY `fk_loteproduccion_id_responsable` (`id_responsable`);

--
-- Indices de la tabla `mantenimiento`
--
ALTER TABLE `mantenimiento`
  ADD PRIMARY KEY (`id_mantenimiento`),
  ADD KEY `fk_mantenimiento_id_equipo` (`id_equipo`),
  ADD KEY `fk_mantenimiento_id_responsable` (`id_responsable`);

--
-- Indices de la tabla `materiaprima`
--
ALTER TABLE `materiaprima`
  ADD PRIMARY KEY (`id_materia_prima`);

--
-- Indices de la tabla `movimientolote`
--
ALTER TABLE `movimientolote`
  ADD PRIMARY KEY (`id_movimiento`),
  ADD KEY `fk_movimientolote_id_lote` (`id_lote`),
  ADD KEY `fk_movimientolote_id_ubicacion_origen` (`id_ubicacion_origen`),
  ADD KEY `fk_movimientolote_id_ubicacion_destino` (`id_ubicacion_destino`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`);

--
-- Indices de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  ADD PRIMARY KEY (`id_proveedor`);

--
-- Indices de la tabla `responsable`
--
ALTER TABLE `responsable`
  ADD PRIMARY KEY (`id_responsable`);

--
-- Indices de la tabla `ubicacion`
--
ALTER TABLE `ubicacion`
  ADD PRIMARY KEY (`id_ubicacion`);

--
-- Indices de la tabla `usoequipolote`
--
ALTER TABLE `usoequipolote`
  ADD PRIMARY KEY (`id_uso_equipo_lote`),
  ADD KEY `fk_usoequipolote_id_lote` (`id_lote`),
  ADD KEY `fk_usoequipolote_id_equipo` (`id_equipo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `consumomateriaprima`
--
ALTER TABLE `consumomateriaprima`
  MODIFY `id_consumo_mp` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `equipo`
--
ALTER TABLE `equipo`
  MODIFY `id_equipo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `incidencia`
--
ALTER TABLE `incidencia`
  MODIFY `id_incidencia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `lotemateriaprima`
--
ALTER TABLE `lotemateriaprima`
  MODIFY `id_lote_mp` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `loteproduccion`
--
ALTER TABLE `loteproduccion`
  MODIFY `id_lote` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `mantenimiento`
--
ALTER TABLE `mantenimiento`
  MODIFY `id_mantenimiento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `materiaprima`
--
ALTER TABLE `materiaprima`
  MODIFY `id_materia_prima` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `movimientolote`
--
ALTER TABLE `movimientolote`
  MODIFY `id_movimiento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  MODIFY `id_proveedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `responsable`
--
ALTER TABLE `responsable`
  MODIFY `id_responsable` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `ubicacion`
--
ALTER TABLE `ubicacion`
  MODIFY `id_ubicacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usoequipolote`
--
ALTER TABLE `usoequipolote`
  MODIFY `id_uso_equipo_lote` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `consumomateriaprima`
--
ALTER TABLE `consumomateriaprima`
  ADD CONSTRAINT `fk_consumomateriaprima_id_lote` FOREIGN KEY (`id_lote`) REFERENCES `loteproduccion` (`id_lote`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_consumomateriaprima_id_lote_mp` FOREIGN KEY (`id_lote_mp`) REFERENCES `lotemateriaprima` (`id_lote_mp`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `equipo`
--
ALTER TABLE `equipo`
  ADD CONSTRAINT `fk_equipo_id_ubicacion` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicacion` (`id_ubicacion`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `incidencia`
--
ALTER TABLE `incidencia`
  ADD CONSTRAINT `fk_incidencia_id_lote` FOREIGN KEY (`id_lote`) REFERENCES `loteproduccion` (`id_lote`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_incidencia_id_responsable` FOREIGN KEY (`id_responsable`) REFERENCES `responsable` (`id_responsable`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `lotemateriaprima`
--
ALTER TABLE `lotemateriaprima`
  ADD CONSTRAINT `fk_lotemateriaprima_id_materia_prima` FOREIGN KEY (`id_materia_prima`) REFERENCES `materiaprima` (`id_materia_prima`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_lotemateriaprima_id_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_lotemateriaprima_id_ubicacion` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicacion` (`id_ubicacion`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `loteproduccion`
--
ALTER TABLE `loteproduccion`
  ADD CONSTRAINT `fk_loteproduccion_id_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_loteproduccion_id_responsable` FOREIGN KEY (`id_responsable`) REFERENCES `responsable` (`id_responsable`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `mantenimiento`
--
ALTER TABLE `mantenimiento`
  ADD CONSTRAINT `fk_mantenimiento_id_equipo` FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id_equipo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_mantenimiento_id_responsable` FOREIGN KEY (`id_responsable`) REFERENCES `responsable` (`id_responsable`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `movimientolote`
--
ALTER TABLE `movimientolote`
  ADD CONSTRAINT `fk_movimientolote_id_lote` FOREIGN KEY (`id_lote`) REFERENCES `loteproduccion` (`id_lote`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_movimientolote_id_ubicacion_destino` FOREIGN KEY (`id_ubicacion_destino`) REFERENCES `ubicacion` (`id_ubicacion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_movimientolote_id_ubicacion_origen` FOREIGN KEY (`id_ubicacion_origen`) REFERENCES `ubicacion` (`id_ubicacion`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `usoequipolote`
--
ALTER TABLE `usoequipolote`
  ADD CONSTRAINT `fk_usoequipolote_id_equipo` FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id_equipo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_usoequipolote_id_lote` FOREIGN KEY (`id_lote`) REFERENCES `loteproduccion` (`id_lote`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
