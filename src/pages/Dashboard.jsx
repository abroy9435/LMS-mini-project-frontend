import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from "date-fns";
import StatCard from "../components/common/StatCard";
import LeaveApplicationModal from "../components/forms/LeaveApplicationModal";
import { useLeaveEngine } from "../hooks/useLeaveEngine"; 
import { API_URLS } from "../utils/constants";

const motionProps = {
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 25 },
  style: { cursor: "pointer" },
  whileHover: { scale: 1.02 },
};

export default function Dashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { fetchMyBalances, fetchMyLeaves } = useLeaveEngine();
  
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  
  // Holiday Modal State
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  
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
        const [balanceRes, leavesRes] = await Promise.all([
          fetchMyBalances(),
          fetchMyLeaves()
        ]);

        const balanceData = Array.isArray(balanceRes) ? balanceRes : (balanceRes?.data || []);
        const leavesData = Array.isArray(leavesRes) ? leavesRes : (leavesRes?.data || []);

        if (balanceData.length > 0) {
          const totalRemaining = balanceData.reduce((acc, curr) => acc + (curr.remaining_days || 0), 0);
          setBalances(totalRemaining);
        }
        
        if (leavesData.length > 0) {
          const sorted = [...leavesData].sort((a, b) => new Date(b.AppliedAt) - new Date(a.AppliedAt));
          setRecentLeaves(sorted.slice(0, 3)); 

          const pendingCount = leavesData.filter(l => l.Status === 'PENDING').length;
          const upcomingCount = leavesData.filter(l => l.Status === 'APPROVED' && new Date(l.StartDate) > new Date()).length;
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

  // --- Fetch Holidays ---
  const handleViewHolidays = async () => {
    setIsHolidayModalOpen(true);
    if (holidays.length === 0) {
      setLoadingHolidays(true);
      try {
        const token = await getToken();
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
        
        // 2. CRITICAL FIX: Use API_URLS.user.HOLIDAYS based on your constants.js structure
        const response = await fetch(`${baseUrl}${API_URLS.user.HOLIDAYS}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setHolidays(data.data || []);
      } catch (error) {
        console.error("Failed to load holidays:", error);
      } finally {
        setLoadingHolidays(false);
      }
    }
  };

  // --- Calendar Logic ---
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startingDayOfWeek = getDay(monthStart); 
  
  const blanks = Array.from({ length: startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1 }, (_, i) => i);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-surface-container-low rounded-xl border border-outline-variant animate-pulse"></div>
          <div className="h-32 bg-surface-container-low rounded-xl border border-outline-variant animate-pulse"></div>
          <div className="h-32 bg-surface-container-low rounded-xl border border-outline-variant animate-pulse"></div>
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
            <button className="text-primary font-label-md hover:underline cursor-pointer">
                View All
            </button>
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
                        leave.Status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        leave.Status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                      <span className="material-symbols-outlined">
                          {leave.Status === 'APPROVED' ? 'check_circle' : leave.Status === 'REJECTED' ? 'cancel' : 'pending_actions'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-body-md text-body-md font-bold truncate text-on-surface">
                          {leave.LeaveType?.name || 'Leave Request'}
                      </h4>
                      <p className="text-body-sm text-on-surface-variant truncate">
                          Requested for {format(new Date(leave.StartDate), 'MMM dd')} - {format(new Date(leave.EndDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="block text-label-md font-label-md text-on-surface-variant mb-1">
                          {format(new Date(leave.AppliedAt), 'MMM dd')}
                      </span>
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          leave.Status === 'APPROVED' ? 'bg-green-100 text-green-700 border border-green-200' :
                          leave.Status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' :
                          'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}>
                          {leave.Status}
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
          {/* Upcoming Holidays Card */}
          <div className="bg-surface-container-high border border-outline-variant p-6 rounded-xl shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-title-lg text-title-lg mb-2 text-on-surface font-bold">
                Institutional Calendar
              </h3>
              <p className="text-body-sm text-on-surface-variant mb-6">
                Review all scheduled national and restricted holidays for the current academic year.
              </p>
              <motion.button 
                {...motionProps} 
                onClick={handleViewHolidays}
                className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg font-bold text-label-md transition-colors cursor-pointer flex items-center justify-center gap-2 w-full shadow-sm"
              >
                  <span className="material-symbols-outlined text-sm">calendar_view_month</span> View All Holidays
              </motion.button>
            </div>
            {/* Using a neutral gray icon to keep the card clean */}
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl text-on-surface opacity-5 group-hover:rotate-12 transition-transform">park</span>
          </div>
          
        </div>
      </div>
      
      <LeaveApplicationModal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} />

      {/* --- HOLIDAY READ-ONLY MODAL --- */}
      <AnimatePresence>
        {isHolidayModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              className="bg-white rounded-3xl w-full max-w-3xl p-6 shadow-2xl relative flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-4 shrink-0">
                <h2 className="text-title-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">calendar_month</span> 
                  Institutional Holiday Calendar
                </h2>
                <button 
                  onClick={() => setIsHolidayModalOpen(false)} 
                  className="p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant hover:text-error transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {loadingHolidays ? (
                   <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
                      <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">autorenew</span>
                      <p className="font-bold">Loading institutional calendar...</p>
                   </div>
                ) : holidays.length === 0 ? (
                   <div className="text-center py-12 text-on-surface-variant italic border-2 border-dashed border-outline-variant rounded-xl">
                      No holidays have been published for this year yet.
                   </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                      <tr className="text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                        <th className="px-4 py-3 rounded-tl-lg">Date</th>
                        <th className="px-4 py-3">Holiday Name</th>
                        <th className="px-4 py-3 rounded-tr-lg">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {holidays.map((h, idx) => {
                        const date = h.HolidayDate || h.holiday_date;
                        const name = h.Name || h.name;
                        const isRestricted = h.IsRestricted ?? h.is_restricted;
                        
                        return (
                          <tr key={h.ID || h.id || idx} className="hover:bg-surface-container-lowest transition-colors border-b border-outline-variant/50 last:border-0">
                            <td className="px-4 py-4 font-bold text-on-surface whitespace-nowrap">
                              {date ? format(new Date(date), 'MMM dd, yyyy') : 'N/A'}
                            </td>
                            <td className="px-4 py-4 text-on-surface font-medium">{name}</td>
                            <td className="px-4 py-4">
                              {isRestricted ? (
                                <span className="text-orange-700 bg-orange-50 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 uppercase tracking-wider">Restricted</span>
                              ) : (
                                <span className="text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-200 uppercase tracking-wider">National</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}