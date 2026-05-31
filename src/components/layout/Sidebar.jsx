import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import LeaveApplicationModal from "../forms/LeaveApplicationModal";
import { useAppAuth } from "../../context/AuthContext"; 
import { ROLE_IDS } from "../../utils/constants";


const MotionLink = motion.create(Link);

const motionProps = {
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 25 },
  className: "cursor-pointer"
};

export default function Sidebar() {
  const location = useLocation();
  const { dbUser } = useAppAuth(); // Grab the DB user
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  let userRole = "EMPLOYEE";
  if (dbUser?.RoleID === ROLE_IDS.ADMIN) {
    userRole = "ADMIN";
  } else if ([ROLE_IDS.REGISTRAR, ROLE_IDS.COE, ROLE_IDS.HOD].includes(dbUser?.RoleID)) {
    userRole = "APPROVER";
  }

  const getNavClasses = (path) => {
    const isActive = location.pathname.startsWith(path) && path !== "/" || location.pathname === path;
    return `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
      isActive 
        ? "bg-primary-container text-gray-200" 
        : "text-on-surface-variant hover:bg-surface-container-high"
    }`;
  };

  return (
    <aside className="hidden md:flex flex-col h-[calc(100vh-64px)] w-64 fixed left-0 top-16 bottom-0 z-30 bg-surface-container-low border-r border-outline-variant py-6 px-4">
      
      <div className="mb-8 px-2 flex flex-col gap-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shrink-0 shadow-sm">
            <span className="material-symbols-outlined">school</span>
          </div>
          <span className="font-headline-md text-primary truncate leading-tight">Faculty Portal</span>
        </div>
        <p className="text-on-surface-variant text-label-md font-label-md opacity-70">
          Staff ID: {dbUser?.employee_id || "Pending"}
        </p>
      </div>

      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
        <MotionLink {...motionProps} to="/" className={getNavClasses("/")}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-md">Dashboard</span>
        </MotionLink>
        
        <MotionLink {...motionProps} to="/leaves" className={getNavClasses("/leaves")}>
          <span className="material-symbols-outlined">calendar_month</span>
          <span className="font-label-md">My Leaves</span>
        </MotionLink>

        {/* ROLE-BASED RENDERING */}
        {userRole === "APPROVER" && (
          <MotionLink {...motionProps} to="/approvals" className={getNavClasses("/approvals")}>
            <span className="material-symbols-outlined">inbox</span>
            <span className="font-label-md">Approvals</span>
          </MotionLink>
        )}

        {userRole === "ADMIN" && (
          <MotionLink {...motionProps} to="/admin" className={getNavClasses("/admin")}>
            <span className="material-symbols-outlined">admin_panel_settings</span>
            <span className="font-label-md">Admin Settings</span>
          </MotionLink>
        )}

        <MotionLink {...motionProps} to="/profile" className={getNavClasses("/profile")}>
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-md">Profile</span>
        </MotionLink>
      </nav>

      <div className="mt-auto pt-4 border-t border-outline-variant/30">
        <motion.button 
          {...motionProps}
          onClick={() => setIsLeaveModalOpen(true)}
          className={`w-full bg-primary text-on-primary font-bold py-3 rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 ${motionProps.className}`}
        >
          <span className="material-symbols-outlined">add</span>
          Apply for Leave
        </motion.button>
      </div>
      
      <LeaveApplicationModal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} />
    </aside>
  );
}