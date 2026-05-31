import { useUser, useClerk } from "@clerk/clerk-react";
import { motion } from "framer-motion";

const motionProps = {
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 25 },
  style: { cursor: "pointer" },
  whileHover: { scale: 1.02 },
};

export default function Profile() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">My Profile</h1>
          <p className="text-on-surface-variant font-body-md mt-1">
            Manage your personal information, university credentials, and preferences.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Identity Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
            
            {/* Banner Background */}
            <div className="h-24 bg-gradient-to-r from-primary-container to-primary relative overflow-hidden">
              <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-7xl text-white opacity-20 transform rotate-12">
                school
              </span>
            </div>
            
            {/* Avatar & Info */}
            <div className="px-6 pb-6 relative flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-surface-container-low -mt-12 mb-4 overflow-hidden shadow-md">
                <img 
                  src={user?.imageUrl || "https://via.placeholder.com/150"} 
                  alt="Profile Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h2 className="font-headline-md text-headline-md text-on-surface">
                {user?.fullName || "Faculty Member"}
              </h2>
              <p className="text-body-sm text-on-surface-variant mb-4">
                {user?.primaryEmailAddress?.emailAddress || "email@tezu.ac.in"}
              </p>
              
              <span className="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-xs font-bold rounded-full uppercase tracking-wider mb-6">
                Active Employee
              </span>

              <motion.button 
                {...motionProps}
                onClick={() => openUserProfile()}
                className={`w-full py-2 border border-outline-variant text-on-surface font-bold rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2 ${motionProps.className}`}
              >
                <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                Manage Account
              </motion.button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Institutional Details & Settings */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Institutional Details */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">badge</span>
              Institutional Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant">EMPLOYEE ID</label>
                <div className="h-11 px-4 border border-outline-variant rounded-xl bg-surface-container-lowest flex items-center text-body-md text-on-surface opacity-70 cursor-not-allowed">
                  TU-88291
                </div>
                <p className="text-[10px] text-outline mt-1">Managed by System Administrator</p>
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant">DEPARTMENT</label>
                <div className="h-11 px-4 border border-outline-variant rounded-xl bg-surface-container-lowest flex items-center text-body-md text-on-surface opacity-70 cursor-not-allowed">
                  Computer Science & Engineering
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant">SYSTEM ROLE</label>
                <div className="h-11 px-4 border border-outline-variant rounded-xl bg-surface-container-lowest flex items-center text-body-md text-on-surface opacity-70 cursor-not-allowed">
                  Faculty (Standard User)
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant">JOINING DATE</label>
                <div className="h-11 px-4 border border-outline-variant rounded-xl bg-surface-container-lowest flex items-center text-body-md text-on-surface opacity-70 cursor-not-allowed">
                  August 12, 2023
                </div>
              </div>

            </div>
          </div>

          {/* Preferences Settings */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">tune</span>
              Notification Preferences
            </h3>

            <div className="space-y-4">
              
              {/* Setting Toggle 1 */}
              <div className="flex items-center justify-between p-4 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors">
                <div>
                  <h4 className="font-body-md font-bold text-on-surface">Email Notifications</h4>
                  <p className="text-body-sm text-on-surface-variant">Receive updates when your leave status changes.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Setting Toggle 2 */}
              <div className="flex items-center justify-between p-4 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors">
                <div>
                  <h4 className="font-body-md font-bold text-on-surface">HOD Auto-CC</h4>
                  <p className="text-body-sm text-on-surface-variant">Automatically notify your department head when applying.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}