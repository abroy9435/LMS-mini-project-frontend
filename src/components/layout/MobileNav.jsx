import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

// Wrap React Router's Link with Framer Motion
const MotionLink = motion.create(Link);

const motionProps = {
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 25 }
};

export default function MobileNav() {
  const location = useLocation();

  const getMobileClasses = (path) => {
    const isActive = location.pathname === path;
    return `flex flex-col items-center gap-1 transition-colors ${
      isActive ? "text-primary" : "text-on-surface-variant hover:text-primary"
    }`;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant h-16 flex items-center justify-around px-4 z-50">
      
      <MotionLink {...motionProps} to="/" className={getMobileClasses("/")}>
        <span className="material-symbols-outlined" style={location.pathname === "/" ? { fontVariationSettings: "'FILL' 1" } : {}}>dashboard</span>
        <span className={`font-label-md text-[10px] ${location.pathname === "/" ? "font-bold" : ""}`}>Dashboard</span>
      </MotionLink>
      
      <MotionLink {...motionProps} to="/leaves" className={getMobileClasses("/leaves")}>
        <span className="material-symbols-outlined" style={location.pathname === "/leaves" ? { fontVariationSettings: "'FILL' 1" } : {}}>calendar_month</span>
        <span className={`font-label-md text-[10px] ${location.pathname === "/leaves" ? "font-bold" : ""}`}>Leaves</span>
      </MotionLink>
      
      <MotionLink {...motionProps} to="/inbox" className={getMobileClasses("/inbox")}>
        <span className="material-symbols-outlined" style={location.pathname === "/inbox" ? { fontVariationSettings: "'FILL' 1" } : {}}>inbox</span>
        <span className={`font-label-md text-[10px] ${location.pathname === "/inbox" ? "font-bold" : ""}`}>Inbox</span>
      </MotionLink>
      
      <MotionLink {...motionProps} to="/profile" className={getMobileClasses("/profile")}>
        <span className="material-symbols-outlined" style={location.pathname === "/profile" ? { fontVariationSettings: "'FILL' 1" } : {}}>person</span>
        <span className={`font-label-md text-[10px] ${location.pathname === "/profile" ? "font-bold" : ""}`}>Profile</span>
      </MotionLink>

    </nav>
  );
}