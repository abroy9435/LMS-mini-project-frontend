import { useClerk } from "@clerk/clerk-react";

export default function LogoutModal({ isOpen, onClose }) {
  const { signOut } = useClerk();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white border border-outline-variant w-full max-w-sm rounded-2xl shadow-xl p-6 animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center">
            <span className="material-symbols-outlined">logout</span>
          </div>
          <h3 className="font-title-lg text-title-lg text-on-surface">Sign Out</h3>
        </div>

        <p className="text-body-md text-on-surface-variant mb-8 pl-1">
          Are you sure you want to securely sign out of the University LMS?
        </p>

        <div className="flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2 font-bold text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => signOut()}
            className="px-5 py-2 bg-error text-white font-semibold rounded-xl shadow-sm hover:brightness-120 transition-brightness"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}