import { Factory, LockKeyhole, Moon, Sun } from 'lucide-react';
import type { Usuario } from '../../services/api';
import { useTheme } from '../../hooks/useTheme';
import LoginForm from './LoginForm';

interface LoginProps {
  onLogin: (token: string, usuario: Usuario) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const { tema, alternarTema } = useTheme();

  return (
    <div className="login-page">
      <button
        type="button"
        className="tema-toggle login-tema-toggle"
        title={tema === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
        aria-label={tema === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
        aria-pressed={tema === 'dark'}
        onClick={alternarTema}
      >
        {tema === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
      </button>
      <section className="panel login-card">
        <div className="brand">
          <div className="brand-icon">
            <Factory size={25} />
          </div>
          <div>
            <h2>NEXOLOTE</h2>
            <span>GESTIÓN INDUSTRIAL</span>
          </div>
        </div>
        <div className="login-intro">
          <span className="login-eyebrow">Acceso a tu espacio de trabajo</span>
          <h1>Bienvenido de nuevo</h1>
          <p>Ingresa tus datos para continuar con la gestión de tus operaciones.</p>
        </div>
        <LoginForm onLogin={onLogin} />
        <div className="login-security-note">
          <LockKeyhole size={15} aria-hidden="true" />
          <span>Acceso protegido a tu panel de operaciones</span>
        </div>
      </section>
    </div>
  );
}
