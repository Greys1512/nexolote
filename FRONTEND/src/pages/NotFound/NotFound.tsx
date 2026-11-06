import { ClipboardList, Wrench } from 'lucide-react';

interface NotFoundProps {
  page: string;
  onHome: () => void;
}

export default function NotFound({ page, onHome }: NotFoundProps) {
  return (
    <section className="module-placeholder">
      <div className="placeholder-icon">
        <Wrench size={34} />
      </div>
      <div className="eyebrow">MÓDULO NEXOLOTE</div>
      <h1>{page}</h1>
      <p>Este módulo no está disponible.</p>
      <div className="placeholder-info">
        <ClipboardList size={20} />
        <span>Selecciona un módulo disponible en el menú principal.</span>
      </div>
      <button type="button" className="back-button" onClick={onHome}>
        Volver al Dashboard
      </button>
    </section>
  );
}
