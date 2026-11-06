// =========================
// CLIENTE HTTP CON TOKEN
// =========================

export const API_URL =
  (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000').replace(/\/+$/, '');

export interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: string;
}

/** Devuelve el JWT guardado en localStorage, o null. */
export function obtenerToken(): string | null {
  return localStorage.getItem('token');
}

/** Elimina la sesión local (se usa al recibir 401). */
export function cerrarSesionLocal(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

/**
 * fetch con el Authorization: Bearer <token> incluido.
 * Si el token expiró (401) limpia la sesión y recarga para volver al login.
 */
export async function apiFetch(
  ruta: string,
  opciones: RequestInit = {},
): Promise<Response> {
  const token = obtenerToken();

  const encabezados = new Headers(opciones.headers);
  if (token) {
    encabezados.set('Authorization', `Bearer ${token}`);
  }
  if (opciones.body && !encabezados.has('Content-Type')) {
    encabezados.set('Content-Type', 'application/json');
  }

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: encabezados,
  });

  // Token inválido o expirado -> volver al login
  if (respuesta.status === 401 && token) {
    cerrarSesionLocal();
    window.location.reload();
    throw new Error('La sesión expiró. Inicia sesión nuevamente.');
  }

  return respuesta;
}
