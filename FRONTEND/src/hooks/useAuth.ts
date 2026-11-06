import { useState } from 'react';
import type { Usuario } from '../services/api';

function cargarUsuario(): Usuario | null {
  const guardado = localStorage.getItem('usuario');

  if (!guardado) return null;

  try {
    return JSON.parse(guardado) as Usuario;
  } catch {
    localStorage.removeItem('usuario');
    return null;
  }
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('token'),
  );
  const [usuario, setUsuario] = useState<Usuario | null>(cargarUsuario);

  const iniciarSesion = (nuevoToken: string, nuevoUsuario: Usuario) => {
    localStorage.setItem('token', nuevoToken);
    localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  };

  return { token, usuario, iniciarSesion, cerrarSesion };
}
