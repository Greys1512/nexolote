import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { Usuario } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { iniciarSesion as autenticar } from '../../services/authService';

interface LoginFormProps {
  onLogin: (token: string, usuario: Usuario) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const resultado = await autenticar(correo, password);
      onLogin(resultado.token, resultado.usuario);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar sesión. Inténtalo de nuevo.',
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="product-form login-form" onSubmit={enviar}>
      <Input
        id="correo"
        label="Correo electrónico"
        type="email"
        autoComplete="username"
        value={correo}
        onChange={(event) => {
          setCorreo(event.target.value);
          if (error) setError('');
        }}
        placeholder="nombre@empresa.com"
        disabled={enviando}
        required
      />

      <div className="form-field">
        <label htmlFor="password">Contraseña</label>
        <div className="password-input-wrap">
          <input
            id="password"
            type={mostrarPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError('');
            }}
            placeholder="Ingresa tu contraseña"
            disabled={enviando}
            required
          />
          <button
            type="button"
            className="password-visibility-toggle"
            aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={mostrarPassword}
            onClick={() => setMostrarPassword((mostrar) => !mostrar)}
          >
            {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error && (
        <p className="catalog-error login-error" role="alert" aria-live="polite">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="submit-product-button"
        disabled={enviando}
        aria-busy={enviando}
      >
        {enviando ? 'Verificando acceso...' : 'Iniciar sesión'}
      </Button>
    </form>
  );
}
