import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from "date-fns";
import StatCard from "../components/common/StatCard";
import LeaveApplicationModal from "../components/forms/LeaveApplicationModal";
import { useLeaveEngine } from "../hooks/useLeaveEngine"; 

const motionProps = {
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 25 },
  style: { cursor: "pointer" },
  whileHover: { scale: 1.02 },
};

export default function Dashboard() {
  const { user } = useUser();
  const { fetchMyBalances, fetchMyLeaves } = useLeaveEngine();
  
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  
  // Data State
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState(0); 
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [stats, setStats] = useState({ pending: 0, upcoming: 0 });

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [balanceData, leavesData] = await Promise.all([
          fetchMyBalances(),
          fetchMyLeaves()
        ]);

        // Process Balances (Assuming balanceData is an array of objects)
        if (balanceData && balanceData.length > 0) {
          // Find 'Casual' or sum them up depending on your DB structure
          const totalRemaining = balanceData.reduce((acc, curr) => acc + (curr.remaining_days || 0), 0);
          setBalances(totalRemaining);
        }
        
        if (leavesData && leavesData.length > 0) {
          const sorted = [...leavesData].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setRecentLeaves(sorted.slice(0, 3)); 

          const pendingCount = leavesData.filter(l => l.status === 'PENDING').length;
          const upcomingCount = leavesData.filter(l => l.status === 'APPROVED' && new Date(l.start_date) > new Date()).length;
          setStats({ pending: pendingCount, upcoming: upcomingCount });
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboardData();
  }, [fetchMyBalances, fetchMyLeaves]);

  // --- Calendar Logic ---
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startingDayOfWeek = getDay(monthStart); 
  
  const blanks = Array.from({ length: startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1 }, (_, i) => i);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Welcome back, {user?.firstName || "User"}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Here is an overview of your leave status and recent activities.
          </p>
        </div>
        
        <motion.button 
          {...motionProps}
          onClick={() => setIsLeaveModalOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        >
          <span className="material-symbols-outlined">add</span>
          Quick Apply
        </motion.button>
      </div>

      {/* Bento Grid Metrics */}
      {loading ? (
        <div className="h-48 flex items-center justify-center bg-surface-container-low rounded-xl border border-outline-variant animate-pulse">
            <p className="text-on-surface-variant">Loading balances...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Leave" 
            value={balances.toString()} 
            subtitle="Days Remaining" 
            icon="event_available" 
            theme="primary" 
          />
          <StatCard 
            title="Pending" 
            value={stats.pending.toString()} 
            subtitle="Awaiting Approval" 
            icon="pending_actions" 
            theme="tertiary" 
          />
          <StatCard 
            title="Upcoming" 
            value={stats.upcoming.toString()} 
            subtitle="Scheduled Breaks" 
            icon="flight_takeoff" 
            theme="secondary" 
          />
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Activities */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-title-lg text-title-lg text-on-surface">Recent Activities</h2>
            <motion.button {...motionProps} className="text-primary font-label-md hover:underline cursor-pointer">
                View All
            </motion.button>
          </div>
          
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="flex flex-col divide-y divide-outline-variant">
              
              {loading ? (
                <div className="p-6 text-center text-on-surface-variant">Loading history...</div>
              ) : recentLeaves.length === 0 ? (
                 <div className="p-6 text-center text-on-surface-variant">No recent activities found.</div>
              ) : (
                recentLeaves.map((leave, index) => (
                  <div key={index} className="p-6 flex items-center gap-6 hover:bg-surface-container-low transition-colors group">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                        leave.status === 'APPROVED' ? 'bg-secondary-container text-on-secondary-container' :
                        leave.status === 'REJECTED' ? 'bg-error-container text-error' :
                        'bg-tertiary-fixed text-on-tertiary-fixed'
                    }`}>
                      <span className="material-symbols-outlined">
                          {leave.status === 'APPROVED' ? 'check_circle' : leave.status === 'REJECTED' ? 'cancel' : 'pending_actions'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-body-md text-body-md font-bold truncate">
                          Leave Request
                      </h4>
                      <p className="text-body-sm text-on-surface-variant truncate">
                          Requested for {format(new Date(leave.start_date), 'MMM dd')} - {format(new Date(leave.end_date), 'MMM dd')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="block text-label-md font-label-md text-on-surface-variant mb-1">
                          {format(new Date(leave.created_at), 'MMM dd')}
                      </span>
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          leave.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          leave.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                      }`}>
                          {leave.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Calendar / Notifications */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Functional Calendar Widget */}
          <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-title-lg text-title-lg text-on-surface">
                  {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <div className="flex gap-1">
                <motion.button {...motionProps} onClick={handlePrevMonth} className="material-symbols-outlined text-on-surface-variant p-1 rounded hover:bg-surface-container-low transition-colors cursor-pointer">chevron_left</motion.button>
                <motion.button {...motionProps} onClick={handleNextMonth} className="material-symbols-outlined text-on-surface-variant p-1 rounded hover:bg-surface-container-low transition-colors cursor-pointer">chevron_right</motion.button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 text-center text-label-md font-bold text-on-surface-variant mb-4">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span className="text-primary-container">S</span><span className="text-primary-container">S</span>
            </div>
            
            <div className="grid grid-cols-7 text-center gap-y-2 text-body-sm">
              {blanks.map(blank => (
                <div key={`blank-${blank}`} className="p-2"></div>
              ))}
              
              {calendarDays.map(day => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div key={day.toString()} className={`p-2 font-bold ${isToday ? 'bg-primary text-white rounded-full' : 'text-on-surface'}`}>
                        {format(day, 'd')}
                    </div>
                  );
              })}
            </div>
          </div>

          {/* Upcoming Holidays Card */}
          <div className="bg-primary-container text-on-primary-container p-6 rounded-xl shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-title-lg text-title-lg mb-2 text-on-primary-container">University Break</h3>
              <p className="text-body-sm opacity-80 mb-6 text-on-primary-container">The campus will be closed for the winter holidays starting Dec 24.</p>
              <motion.button {...motionProps} className="bg-white/20 text-on-primary-container hover:bg-white/30 px-4 py-2 rounded-lg font-bold text-label-md transition-colors cursor-pointer">
                  View Holiday Calendar
              </motion.button>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl opacity-10 group-hover:rotate-12 transition-transform">ac_unit</span>
          </div>
          
        </div>
      </div>
      
      <LeaveApplicationModal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} />
    </div>
  );
}