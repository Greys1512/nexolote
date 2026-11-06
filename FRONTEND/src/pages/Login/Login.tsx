import { Factory, Moon, Sun } from 'lucide-react';
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
        <LoginForm onLogin={onLogin} />
      </section>
    </div>
  );
}
