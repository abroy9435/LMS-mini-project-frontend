import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import LogoutModal from "../common/LogoutModal";

const motionProps = {
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 25 },
  className: "cursor-pointer"
};

export default function TopAppBar() {
  const { user } = useUser();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <>
      <header className="w-full h-16 bg-surface border-b border-outline-variant shadow-sm flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <span className="text-title-lg font-title-lg font-bold text-primary">University LMS</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative hidden md:block mr-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 transition-all" 
              placeholder="Search records..." 
              type="text"
            />
          </div>

          <motion.button 
            {...motionProps} 
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

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
      />
    </>
  );
}