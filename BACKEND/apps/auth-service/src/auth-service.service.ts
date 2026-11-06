import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { DatabaseService } from './database/database.service';

const HASH_FICTICIO = '$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin';
const ROLES_VALIDOS = new Set(['Administrador', 'Operador', 'Consulta']);

@Injectable()
export class AuthServiceService {
  constructor(private readonly databaseService: DatabaseService) {}

  async login(correo?: string, password?: string) {
    if (!correo || !password) return { exito: false, mensaje: 'Correo y contraseña son obligatorios.' };
    const usuarios = await this.databaseService.query<any[]>(
      'SELECT id_usuario, nombre, correo, password_hash, rol, estado FROM usuario WHERE correo = ? LIMIT 1',
      [(correo as string).trim().toLowerCase()],
    );
    const usuario = usuarios[0];
    const mensajeError = 'Correo o contraseña incorrectos.';
    if (!usuario) { await bcrypt.compare(password, HASH_FICTICIO); return { exito: false, mensaje: mensajeError }; }
    const coincide = await bcrypt.compare(password, usuario.password_hash);
    if (!coincide) return { exito: false, mensaje: mensajeError };
    if (usuario.estado !== 'Activo') return { exito: false, mensaje: 'La cuenta está desactivada. Contacta al administrador.' };
    return { exito: true, usuario: { id_usuario: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol, estado: usuario.estado } };
  }

  async obtenerUsuarioPorId(id_usuario: number) {
    const usuarios = await this.databaseService.query<any[]>('SELECT id_usuario, nombre, correo, rol, estado FROM usuario WHERE id_usuario = ? LIMIT 1', [id_usuario]);
    if (usuarios.length === 0) return { exito: false, mensaje: 'Usuario no encontrado.' };
    return { exito: true, usuario: usuarios[0] };
  }

  async listarUsuarios() {
    return this.databaseService.query<any[]>('SELECT id_usuario, nombre, correo, rol, estado FROM usuario ORDER BY id_usuario ASC');
  }

  async crearUsuario(datos: { nombre: string; correo: string; password?: string; rol: string; estado: string }) {
    if (!datos?.nombre?.trim() || !datos?.correo?.trim() || !datos?.password) return { exito: false, mensaje: 'Nombre, correo y contraseña son obligatorios.' };
    if (!ROLES_VALIDOS.has(datos.rol)) return { exito: false, mensaje: 'Rol no válido.' };
    const correo = datos.correo.trim().toLowerCase();
    const existe = await this.databaseService.query<any[]>('SELECT id_usuario FROM usuario WHERE correo = ? LIMIT 1', [correo]);
    if (existe.length) return { exito: false, mensaje: 'Ya existe un usuario con ese correo.' };
    const hash = await bcrypt.hash(datos.password, 10);
    const res = await this.databaseService.query<any>('INSERT INTO usuario (nombre, correo, password_hash, rol, estado) VALUES (?, ?, ?, ?, ?)',
      [datos.nombre.trim(), correo, hash, datos.rol, datos.estado || 'Activo']);
    return { exito: true, mensaje: 'Usuario registrado correctamente', id_usuario: res.insertId };
  }

  async actualizarUsuario(id_usuario: number, datos: { nombre: string; correo: string; password?: string; rol: string; estado: string }) {
    const existente = await this.databaseService.query<any[]>('SELECT id_usuario FROM usuario WHERE id_usuario = ? LIMIT 1', [id_usuario]);
    if (!existente.length) return { exito: false, mensaje: 'El usuario no existe.' };
    if (!datos?.nombre?.trim() || !datos?.correo?.trim()) return { exito: false, mensaje: 'Nombre y correo son obligatorios.' };
    if (!ROLES_VALIDOS.has(datos.rol)) return { exito: false, mensaje: 'Rol no válido.' };
    const correo = datos.correo.trim().toLowerCase();
    const dup = await this.databaseService.query<any[]>('SELECT id_usuario FROM usuario WHERE correo = ? AND id_usuario <> ? LIMIT 1', [correo, id_usuario]);
    if (dup.length) return { exito: false, mensaje: 'Ya existe otro usuario con ese correo.' };
    if (datos.password && datos.password.trim()) {
      const hash = await bcrypt.hash(datos.password, 10);
      await this.databaseService.query('UPDATE usuario SET nombre=?, correo=?, password_hash=?, rol=?, estado=? WHERE id_usuario=?', [datos.nombre.trim(), correo, hash, datos.rol, datos.estado, id_usuario]);
    } else {
      await this.databaseService.query('UPDATE usuario SET nombre=?, correo=?, rol=?, estado=? WHERE id_usuario=?', [datos.nombre.trim(), correo, datos.rol, datos.estado, id_usuario]);
    }
    return { exito: true, mensaje: 'Usuario actualizado correctamente', id_usuario };
  }

  async eliminarUsuario(id_usuario: number) {
    const existente = await this.databaseService.query<any[]>('SELECT id_usuario FROM usuario WHERE id_usuario = ? LIMIT 1', [id_usuario]);
    if (!existente.length) return { exito: false, mensaje: 'El usuario no existe.' };
    await this.databaseService.query('UPDATE usuario SET estado = ? WHERE id_usuario = ?', ['Inactivo', id_usuario]);
    return { exito: true, mensaje: 'Usuario desactivado correctamente', id_usuario };
  }
}
