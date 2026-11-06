import { Factory } from 'lucide-react';
import type { Usuario } from '../../services/api';
import LoginForm from './LoginForm';

interface LoginProps {
  onLogin: (token: string, usuario: Usuario) => void;
}

export default function Login({ onLogin }: LoginProps) {
  return (
    <div className="login-page">
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
