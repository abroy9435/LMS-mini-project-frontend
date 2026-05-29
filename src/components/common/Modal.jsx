import ReactDOM from 'react-dom';

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Modal Content */}
      <div className="relative z-[10000] w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant animate-in fade-in zoom-in duration-200">
        {children}
      </div>
    </div>,
    document.body
  );
}