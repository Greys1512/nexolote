import type { ElementType, ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  titulo: string;
  icono: ElementType<{ size?: number }>;
  children: ReactNode;
}

export default function Modal({
  open,
  onClose,
  titulo,
  icono: Icono,
  children,
}: ModalProps) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="modal-overlay"
        aria-label="Cerrar ventana"
        onClick={onClose}
      />
      <section
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <div className="modal-header">
          <div className="modal-icon">
            <Icono size={24} />
          </div>
          <h3>{titulo}</h3>
          <button
            type="button"
            className="modal-close"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </section>
    </>
  );
}
