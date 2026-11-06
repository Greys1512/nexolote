import { apiFetch, type Usuario } from './api';

interface LoginResult {
  token: string;
  usuario: Usuario;
}

export async function iniciarSesion(
  correo: string,
  password: string,
): Promise<LoginResult> {
  const respuesta = await apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      correo: correo.trim().toLowerCase(),
      password,
    }),
  });

  const resultado = (await respuesta.json()) as
    | LoginResult
    | { message?: string };

  if (!respuesta.ok) {
    throw new Error(
      'message' in resultado
        ? resultado.message || 'Correo o contraseña incorrectos.'
        : 'Correo o contraseña incorrectos.',
    );
  }

  if (!('token' in resultado) || !resultado.token || !resultado.usuario) {
    throw new Error('El servidor devolvió una respuesta de inicio de sesión inválida.');
  }

  return resultado;
}
