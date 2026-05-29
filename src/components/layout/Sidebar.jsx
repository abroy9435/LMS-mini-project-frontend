import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LeaveApplicationModal from "../forms/LeaveApplicationModal"

export default function Sidebar() {
  const location = useLocation();
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  const getNavClasses = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all active:scale-95 ${
      isActive 
        ? "bg-primary-container text-gray-200" 
        : "text-on-surface-variant hover:bg-surface-container-high"
    }`;
  };

  return (
    <aside className="hidden md:flex flex-col h-[calc(100vh-64px)] w-64 fixed left-0 top-16 bottom-0 z-30 bg-surface-container-low border-r border-outline-variant py-6 px-4">
      
      {/* Fixed Profile Section */}
      <div className="mb-8 px-2 flex flex-col gap-1">
        <div className="flex items-center gap-3 mb-2">
          {/* shrink-0 prevents the icon from squishing */}
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shrink-0 shadow-sm">
            <span className="material-symbols-outlined">school</span>
          </div>
          <span className="font-headline-md text-primary truncate leading-tight">Faculty Portal</span>
        </div>
        <p className="text-on-surface-variant text-label-md font-label-md opacity-70">Staff ID: 88291</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
        <Link to="/" className={getNavClasses("/")}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-md">Dashboard</span>
        </Link>
        <Link to="/leaves" className={getNavClasses("/leaves")}>
          <span className="material-symbols-outlined">calendar_month</span>
          <span className="font-label-md">My Leaves</span>
        </Link>
        <Link to="/inbox" className={getNavClasses("/inbox")}>
          <span className="material-symbols-outlined">inbox</span>
          <span className="font-label-md">Inbox</span>
        </Link>
        <Link to="/profile" className={getNavClasses("/profile")}>
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-md">Profile</span>
        </Link>
      </nav>

      {/* Action Button inside a padded container at the bottom */}
      <div className="mt-auto pt-4 border-t border-outline-variant/30">
        <button 
          onClick={() => setIsLeaveModalOpen(true)}
          className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">add</span>
          Apply for Leave
        </button>
      </div>
      <LeaveApplicationModal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} />
    </aside>
  );
}