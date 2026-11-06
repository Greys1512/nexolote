import { useCallback, useEffect, useState } from 'react';

export type Tema = 'light' | 'dark';

const CLAVE_TEMA = 'nexolote:theme';

/** Color de barra del navegador móvil por tema (coincide con el fondo de la app). */
const THEME_COLORS: Record<Tema, string> = {
  light: '#f3f5f9',
  dark: '#0b1220',
};

function leerTemaGuardado(): Tema | null {
  const guardado = localStorage.getItem(CLAVE_TEMA);
  return guardado === 'dark' || guardado === 'light' ? guardado : null;
}

/**
 * Tema inicial: el guardado por el usuario; si es la primera visita,
 * la preferencia del sistema (`prefers-color-scheme`); si no, claro.
 */
export function obtenerTema(): Tema {
  return (
    leerTemaGuardado() ??
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
}

/**
 * Aplica el tema al documento, lo persiste en localStorage y actualiza
 * el meta theme-color. Se ejecuta antes del primer render (main.tsx),
 * por eso también cubre la página de Login, que no monta la Navbar.
 */
export function aplicarTema(tema: Tema): void {
  document.documentElement.dataset.theme = tema;
  localStorage.setItem(CLAVE_TEMA, tema);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLORS[tema]);
}

/** Estado del tema + alternador, compartido por Navbar y Login. */
export function useTheme() {
  const [tema, setTema] = useState<Tema>(obtenerTema);

  useEffect(() => {
    aplicarTema(tema);
  }, [tema]);

  const alternarTema = useCallback(
    () => setTema((actual) => (actual === 'dark' ? 'light' : 'dark')),
    [],
  );

  return { tema, alternarTema };
}
