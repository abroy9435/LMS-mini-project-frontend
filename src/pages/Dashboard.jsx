import { useState } from "react"; 
import { useUser } from "@clerk/clerk-react";
import StatCard from "../components/common/StatCard";
import LeaveApplicationModal from "../components/forms/LeaveApplicationModal";

export default function Dashboard() {
  const { user } = useUser(); 
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Welcome back, {user?.firstName || "Professor Smith"}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Here is an overview of your leave status and recent activities.
          </p>
        </div>
        
        <button 
            onClick={() => setIsLeaveModalOpen(true)}
            className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 group">
          <span className="material-symbols-outlined">add</span>
          Quick Apply
        </button>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Annual Leave" 
          value="24" 
          subtitle="Days Remaining" 
          icon="event_available" 
          theme="primary" 
        />
        <StatCard 
          title="Pending" 
          value="3" 
          subtitle="Awaiting Approval" 
          icon="pending_actions" 
          theme="tertiary" 
        />
        <StatCard 
          title="Upcoming" 
          value="2" 
          subtitle="Scheduled Breaks" 
          icon="flight_takeoff" 
          theme="secondary" 
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Activities */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-title-lg text-title-lg text-on-surface">Recent Activities</h2>
            <button className="text-primary font-label-md hover:underline">View All</button>
          </div>
          
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="flex flex-col divide-y divide-outline-variant">
              
              {/* Activity Item 1 */}
              <div className="p-6 flex items-center gap-6 hover:bg-surface-container-low transition-colors group">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-body-md text-body-md font-bold truncate">Sick Leave Approved</h4>
                  <p className="text-body-sm text-on-surface-variant truncate">Your request for Oct 12-14 was approved by Dean Wilson.</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="block text-label-md font-label-md text-on-surface-variant mb-1">2h ago</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Approved</span>
                </div>
              </div>

              {/* Activity Item 2 */}
              <div className="p-6 flex items-center gap-6 hover:bg-surface-container-low transition-colors group">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shrink-0">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-body-md text-body-md font-bold truncate">New Request Submitted</h4>
                  <p className="text-body-sm text-on-surface-variant truncate">Academic Conference Leave submitted for Nov 05-10.</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="block text-label-md font-label-md text-on-surface-variant mb-1">Yesterday</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Pending</span>
                </div>
              </div>

              {/* Activity Item 3 */}
              <div className="p-6 flex items-center gap-6 hover:bg-surface-container-low transition-colors group">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed shrink-0">
                  <span className="material-symbols-outlined">update</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-body-md text-body-md font-bold truncate">Balance Updated</h4>
                  <p className="text-body-sm text-on-surface-variant truncate">Annual carry-over of 5 days added to your total.</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="block text-label-md font-label-md text-on-surface-variant mb-1">Oct 10</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wider">System</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Calendar / Notifications (Right Column) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Calendar Widget */}
          <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-title-lg text-title-lg text-on-surface">October 2023</h3>
              <div className="flex gap-1">
                <span className="material-symbols-outlined cursor-pointer hover:text-primary text-on-surface-variant p-1 rounded hover:bg-surface-container-low transition-colors">chevron_left</span>
                <span className="material-symbols-outlined cursor-pointer hover:text-primary text-on-surface-variant p-1 rounded hover:bg-surface-container-low transition-colors">chevron_right</span>
              </div>
            </div>
            
            <div className="grid grid-cols-7 text-center text-label-md font-bold text-on-surface-variant mb-4">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span className="text-primary-container">S</span><span className="text-primary-container">S</span>
            </div>
            
            <div className="grid grid-cols-7 text-center gap-y-2 text-body-sm">
              <div className="p-2 text-on-surface-variant opacity-30">25</div>
              <div className="p-2 text-on-surface-variant opacity-30">26</div>
              <div className="p-2 text-on-surface-variant opacity-30">27</div>
              <div className="p-2 text-on-surface-variant opacity-30">28</div>
              <div className="p-2 text-on-surface-variant opacity-30">29</div>
              <div className="p-2 text-on-surface-variant opacity-30">30</div>
              <div className="p-2 font-bold text-on-surface">1</div>
              <div className="p-2 font-bold text-on-surface">2</div>
              <div className="p-2 font-bold text-on-surface">3</div>
              <div className="p-2 font-bold text-on-surface">4</div>
              <div className="p-2 font-bold text-on-surface">5</div>
              <div className="p-2 font-bold text-on-surface">6</div>
              <div className="p-2 font-bold text-on-surface">7</div>
              <div className="p-2 font-bold text-on-surface">8</div>
              <div className="p-2 font-bold text-on-surface">9</div>
              <div className="p-2 font-bold text-on-surface">10</div>
              
              {/* Highlighted Leave Span */}
              <div className="p-2 font-bold bg-primary text-on-primary rounded-full z-10 relative">11</div>
              <div className="p-2 font-bold bg-primary-container text-on-primary rounded-l-full relative">12</div>
              <div className="p-2 font-bold bg-primary-container text-on-primary relative">13</div>
              <div className="p-2 font-bold bg-primary-container text-on-primary rounded-r-full relative">14</div>
              
              <div className="p-2 font-bold text-on-surface">15</div>
              <div className="p-2 font-bold text-on-surface">16</div>
              <div className="p-2 font-bold text-on-surface">17</div>
              <div className="p-2 font-bold text-on-surface">18</div>
              <div className="p-2 font-bold text-on-surface">19</div>
              <div className="p-2 font-bold text-on-surface">20</div>
              <div className="p-2 font-bold text-on-surface">21</div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-outline-variant flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-primary-container"></div>
              <span className="text-body-sm text-on-surface-variant">Approved Leave Oct 12-14</span>
            </div>
          </div>

          {/* Upcoming Holidays Card */}
          <div className="bg-primary-container text-on-primary-container p-6 rounded-xl shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-title-lg text-title-lg mb-2">University Break</h3>
              <p className="text-body-sm opacity-80 mb-6">The campus will be closed for the winter holidays starting Dec 24.</p>
              <button className="bg-on-primary-container text-primary px-4 py-2 rounded-lg font-bold text-label-md hover:scale-105 transition-transform active:scale-95">
                  View Holiday Calendar
              </button>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl opacity-10 group-hover:rotate-12 transition-transform">ac_unit</span>
          </div>
          
        </div>

      </div>
      <LeaveApplicationModal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} />
    </div>
  );
}