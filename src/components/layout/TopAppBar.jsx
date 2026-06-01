import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import LogoutModal from "../common/LogoutModal";

const motionProps = {
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 25 },
  style: { cursor: "pointer" },
  whileHover: { scale: 1.02 },
};

export default function TopAppBar() {
  const { user } = useUser();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // New state for the Notifications "Coming Soon" modal
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  return (
    <>
      <header className="w-full h-16 bg-surface border-b border-outline-variant shadow-sm flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {/* Logo Image */}
          <img 
            src="/tu_logo.png" 
            alt="University Logo" 
            className="h-11 w-auto object-contain" 
          />
          <span className="text-title-lg font-title-lg font-bold text-primary">University LMS</span>
        </div>
        
        <div className="flex items-center gap-2">
          
          {/* Search Bar (Disabled / Coming Soon) */}
          {/* Search Bar (Disabled / Coming Soon) */}
          <div className="relative hidden md:block mr-4 group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">search</span>
            <input 
              disabled
              className="pl-10 pr-20 py-2 bg-surface-container-lowest border border-outline-variant rounded-full text-body-sm w-64 cursor-not-allowed opacity-60" 
              placeholder="Search records..." 
              type="text"
            />
            {/* Pulsating 'Coming Soon' Badge */}
            <div className="absolute italic right-2 top-1/2 -translate-y-1/2 bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse border border-primary/20">
              Coming Soon
            </div>
          </div>

          {/* Notifications Button */}
          <motion.button 
            {...motionProps} 
            onClick={() => setIsNotifModalOpen(true)}
            className={`w-10 h-10 rounded-full hover:bg-surface-container-high transition-colors flex items-center justify-center ${motionProps.className}`}
          >
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          </motion.button>
          
          {/* Custom Profile/Logout Button */}
          <motion.button 
            {...motionProps}
            onClick={() => setIsLogoutModalOpen(true)}
            className={`w-10 h-10 ml-2 rounded-full border-2 border-outline-variant hover:border-primary transition-colors overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/50 ${motionProps.className}`}
            title="Sign Out"
          >
            <img 
              src={user?.imageUrl || "https://via.placeholder.com/40"} 
              alt="User Avatar" 
              className="w-full h-full object-cover"
            />
          </motion.button>
        </div>
      </header>

      {/* Logout Modal */}
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
      />

      {/* Notifications "Coming Soon" Modal */}
      <AnimatePresence>
        {isNotifModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl relative flex flex-col items-center text-center"
            >
              {/* Icon Header */}
              <div className="w-16 h-16 bg-surface-container-high border border-outline-variant text-primary rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl">notifications_active</span>
              </div>
              
              <h2 className="text-title-lg font-bold text-on-surface mb-2">
                Notification Center
              </h2>
              
              <p className="text-body-md text-on-surface-variant mb-8">
                We are currently building the central hub for all your leave approvals and system alerts. Stay tuned!
              </p>
              
              <motion.button 
                {...motionProps}
                onClick={() => setIsNotifModalOpen(false)} 
                className="w-full py-3 cursor-pointer bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold rounded-xl transition-colors"
              >
                Close
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}