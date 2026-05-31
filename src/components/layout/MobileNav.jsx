import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppAuth } from "../../context/AuthContext"; 

const MotionLink = motion.create(Link);

const motionProps = {
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 25 }
};

export default function MobileNav() {
  const location = useLocation();
  const { dbUser } = useAppAuth(); 

  const userLevel = dbUser?.role?.hierarchy_level || 0;
  
  const isVC = userLevel >= 110;
  const isAdmin = userLevel >= 100 && userLevel < 110;  
  const isApprover = userLevel >= 50 && userLevel < 100; 

  const getMobileClasses = (path) => {
    const isActive = location.pathname.startsWith(path) && path !== "/" || location.pathname === path;
    return `flex flex-col items-center gap-1 transition-colors ${
      isActive ? "text-primary" : "text-on-surface-variant hover:text-primary"
    }`;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant h-16 flex items-center justify-around px-4 z-50">
      
      {!isVC && (
        <MotionLink {...motionProps} to="/" className={getMobileClasses("/")}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-md text-[10px]">Dashboard</span>
        </MotionLink>
      )}
      
      {!isVC && (
        <MotionLink {...motionProps} to="/leaves" className={getMobileClasses("/leaves")}>
          <span className="material-symbols-outlined">calendar_month</span>
          <span className="font-label-md text-[10px]">Leaves</span>
        </MotionLink>
      )}
      
      {(isApprover || isVC) &&(
        <MotionLink {...motionProps} to="/approvals" className={getMobileClasses("/approvals")}>
          <span className="material-symbols-outlined">inbox</span>
          <span className="font-label-md text-[10px]">Approvals</span>
        </MotionLink>
      )}

      {(isAdmin || isVC) &&(
        <MotionLink {...motionProps} to="/admin" className={getMobileClasses("/admin")}>
          <span className="material-symbols-outlined">admin settings</span>
          <span className="font-label-md text-[10px]">Admin</span>
        </MotionLink>
      )}
      
      <MotionLink {...motionProps} to="/profile" className={getMobileClasses("/profile")}>
        <span className="material-symbols-outlined">person</span>
        <span className="font-label-md text-[10px]">Profile</span>
      </MotionLink>

    </nav>
  );
}