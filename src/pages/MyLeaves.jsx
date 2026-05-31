import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import LeaveBalanceCard from "../components/common/LeaveBalanceCard";
import StatusChip from "../components/common/StatusChip";
import { useLeaveEngine } from "../hooks/useLeaveEngine";

const motionProps = {
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 25 },
  style: { cursor: "pointer" },
  whileHover: { scale: 1.02 },
};

export default function MyLeaves() {
  const { getToken } = useAuth();
  const { fetchMyLeaves, fetchMyBalances, myLeaves, leaveBalances, isLoading } = useLeaveEngine();
  
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Holiday Modal State
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);

  useEffect(() => {
    fetchMyLeaves();
    fetchMyBalances();
  }, [fetchMyLeaves, fetchMyBalances]);

  // Safely unwrap data arrays
  const safeLeaves = Array.isArray(myLeaves) ? myLeaves : (myLeaves?.data || []);
  const safeBalances = Array.isArray(leaveBalances) ? leaveBalances : (leaveBalances?.data || []);

  // Filter leaves based on Status
  const filteredLeaves = safeLeaves.filter(leave => 
    filterStatus === "ALL" ? true : leave.Status === filterStatus
  );

  // --- SMART LOOKUP: Find Leave Names ---
  // Because the /balances API only returns UUIDs, we extract the string names here
  const getLeaveName = (typeId, allocatedDays) => {
    // 1. Try to extract the real name from the user's past leave history
    const historicalLeave = safeLeaves.find(l => l.LeaveTypeID === typeId);
    if (historicalLeave?.LeaveType?.name) return historicalLeave.LeaveType.name;

    // 2. Fallbacks based on your specific database allocations
    if (allocatedDays === 12) return "Casual Leave (CL)";
    if (allocatedDays === 10) return "Sick/Medical Leave";
    if (allocatedDays === 30) return "Earned Leave";
    if (allocatedDays === 15) return "Half Pay Leave";

    return "General Leave";
  };

  // Filter out any 0-allocation ghost records so we only show valid balances
  const activeBalances = safeBalances.filter(b => b.allocated_days > 0);

  // --- Fetch Holidays ---
  const handleViewHolidays = async () => {
    setIsHolidayModalOpen(true);
    if (holidays.length === 0) {
      setLoadingHolidays(true);
      try {
        const token = await getToken();
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
        const response = await fetch(`${baseUrl}/api/v1/admin/holidays`, {
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">My Leaves History</h1>
          <p className="text-on-surface-variant font-body-md mt-1">Review your past requests and track your remaining balances.</p>
        </div>
        <div className="bg-surface-container-high px-4 py-2 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">event</span>
          <span className="font-label-md text-label-md text-on-surface-variant">Academic Year {new Date().getFullYear()}</span>
        </div>
      </section>

      {/* Dynamic Balances */}
      {isLoading && safeBalances.length === 0 ? (
        <div className="h-32 flex items-center justify-center bg-surface-container-low rounded-xl animate-pulse">
            <p className="text-on-surface-variant">Loading balances...</p>
        </div>
      ) : activeBalances.length === 0 ? (
        <div className="h-32 flex items-center justify-center bg-surface-container-low border border-outline-variant border-dashed rounded-xl">
            <p className="text-on-surface-variant">No leave allocations found for this year.</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeBalances.slice(0, 3).map((bal, idx) => {
            const title = getLeaveName(bal.leave_type_id, bal.allocated_days);
            const icons = ["beach_access", "medical_services", "family_restroom"];
            const themes = ["primary", "tertiary", "secondary"];

            return (
              <LeaveBalanceCard 
                key={bal.id} 
                title={title} 
                // We map 'remaining_days' to the 'used' prop so it renders as the big number!
                used={bal.remaining_days} 
                total={bal.allocated_days} 
                icon={icons[idx % 3]} 
                theme={themes[idx % 3]} 
              />
            );
          })}
        </section>
      )}

      {/* Filters & Actions */}
      <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-outline-variant px-4 py-2 rounded-lg text-body-sm focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            <option value="ALL">Status: All Requests</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select className="bg-white border border-outline-variant px-4 py-2 rounded-lg text-body-sm focus:ring-1 focus:ring-primary outline-none cursor-pointer">
            <option>Year: {new Date().getFullYear()}</option>
            <option>Year: {new Date().getFullYear() - 1}</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <motion.button {...motionProps} className="px-4 py-2 bg-primary text-on-primary rounded-full text-label-md font-bold">All History</motion.button>
          <motion.button {...motionProps} className="px-4 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-full text-label-md font-bold transition-all">Documents</motion.button>
          <motion.button {...motionProps} className="px-4 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-full text-label-md font-bold transition-all">Archived</motion.button>
        </div>
      </section>

      {/* Data Table */}
      <section className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Leave Type</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Days</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {isLoading && safeLeaves.length === 0 ? (
                <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant animate-pulse">Loading history...</td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-30">beach_access</span>
                      <p>No leave requests found.</p>
                    </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => (
                  <tr key={leave.ID} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                            leave.Status === 'APPROVED' ? 'bg-primary' : 
                            leave.Status === 'REJECTED' ? 'bg-error' : 'bg-tertiary'
                        }`}></div>
                        <div>
                          <p className="font-body-md text-on-surface font-semibold capitalize">{leave.LeaveType?.name || "Leave Request"}</p>
                          <p className="font-label-md text-on-surface-variant truncate max-w-[150px]" title={leave.Reason}>{leave.Reason}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-body-sm text-on-surface">
                          {leave.StartDate ? format(new Date(leave.StartDate), 'MMM dd') : 'N/A'} - {leave.EndDate ? format(new Date(leave.EndDate), 'MMM dd, yyyy') : 'N/A'}
                      </p>
                      <p className="font-label-md text-on-surface-variant mt-1">
                        Requested {leave.AppliedAt ? format(new Date(leave.AppliedAt), 'MMM dd') : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-body-md font-bold text-on-surface">
                          {leave.CalculatedDays} {leave.CalculatedDays === 1 ? 'Day' : 'Days'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusChip status={leave.Status || 'PENDING'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button {...motionProps} className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-xl">
                          {leave.Status === 'PENDING' ? 'edit' : 'visibility'}
                        </motion.button>
                        {leave.Status === 'PENDING' && (
                          <motion.button {...motionProps} className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors text-xl">
                              delete
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom Motivation Banner */}
      <section className="relative h-48 rounded-2xl overflow-hidden shadow-md group bg-primary mt-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/40 z-10"></div>
        <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" alt="Library" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay transition-transform duration-700 group-hover:scale-105" />
        <div className="relative z-20 h-full flex flex-col justify-center px-6 md:px-10">
          <h3 className="font-headline-md text-white">Planning a well-deserved break?</h3>
          <p className="text-white/80 font-body-md mt-2 max-w-lg">Our staff wellness program encourages taking annual leave to maintain peak teaching performance. Check the holiday calendar for long weekends!</p>
          <motion.button 
            {...motionProps} 
            onClick={handleViewHolidays}
            className="mt-4 w-fit bg-white text-primary px-6 py-2 rounded-full font-bold text-label-md hover:bg-surface-container-low transition-colors"
          >
            View Holiday Calendar
          </motion.button>
        </div>
      </section>

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
                    <thead className="bg-white sticky top-0 z-10 shadow-sm">
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