import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import LeaveBalanceCard from "../components/common/LeaveBalanceCard";
import StatusChip from "../components/common/StatusChip";
import { useLeaveEngine } from "../hooks/useLeaveEngine";

const motionProps = {
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 25 },
  className: "cursor-pointer" // Added for better UX
};

export default function MyLeaves() {
  const { fetchMyLeaves, fetchMyBalances, myLeaves, leaveBalances, isLoading, error } = useLeaveEngine();
  
  // Local state for UI filtering (Optional, but good for UX)
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    // Fetch both datasets when the page loads
    fetchMyLeaves();
    fetchMyBalances();
  }, [fetchMyLeaves, fetchMyBalances]);

  // Helper to extract specific balances safely
  const getBalance = (typeName) => {
    const bal = leaveBalances.find(b => b.leave_type_name?.toUpperCase() === typeName.toUpperCase());
    return {
      used: bal ? bal.used_days : 0,
      total: bal ? bal.allocated_days : 0,
      remaining: bal ? bal.remaining_days : 0
    };
  };

  const annualBal = getBalance("ANNUAL");
  const sickBal = getBalance("SICK");
  const casualBal = getBalance("CASUAL");

  // Filter the leaves based on the dropdown
  const filteredLeaves = myLeaves.filter(leave => 
    filterStatus === "ALL" ? true : leave.status === filterStatus
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">My Leaves History</h1>
          <p className="text-on-surface-variant font-body-md mt-1">Review your past requests and track your remaining balance for the academic year.</p>
        </div>
        <div className="bg-surface-container-high px-4 py-2 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">event</span>
          <span className="font-label-md text-label-md text-on-surface-variant">Academic Year 2026</span>
        </div>
      </section>

      {/* Balances */}
      {isLoading && leaveBalances.length === 0 ? (
        <div className="h-32 flex items-center justify-center bg-surface-container-low rounded-xl animate-pulse">
            <p className="text-on-surface-variant">Loading balances...</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LeaveBalanceCard title="ANNUAL" used={annualBal.used} total={annualBal.total} icon="beach_access" theme="primary" />
          <LeaveBalanceCard title="SICK" used={sickBal.used} total={sickBal.total} icon="medical_services" theme="tertiary" />
          <LeaveBalanceCard title="CASUAL" used={casualBal.used} total={casualBal.total} icon="family_restroom" theme="secondary" />
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
            <option>Year: 2026</option>
            <option>Year: 2025</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <motion.button {...motionProps} className={`px-4 py-2 bg-primary text-on-primary rounded-full text-label-md font-bold ${motionProps.className}`}>All History</motion.button>
          <motion.button {...motionProps} className={`px-4 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-full text-label-md font-bold transition-all ${motionProps.className}`}>Documents</motion.button>
          <motion.button {...motionProps} className={`px-4 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-full text-label-md font-bold transition-all ${motionProps.className}`}>Archived</motion.button>
        </div>
      </section>

      {/* Data Table */}
      <section className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
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
              {isLoading && myLeaves.length === 0 ? (
                <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant animate-pulse">Loading history...</td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">No leave requests found.</td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                            leave.status === 'APPROVED' ? 'bg-primary' : 
                            leave.status === 'REJECTED' ? 'bg-error' : 'bg-tertiary'
                        }`}></div>
                        <div>
                          {/* Assuming your backend sends back leave_type or leave_type_id mapping */}
                          <p className="font-body-md text-on-surface font-semibold capitalize">{leave.leave_type || "Leave Request"}</p>
                          <p className="font-label-md text-on-surface-variant truncate max-w-[150px]">{leave.reason}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-body-sm text-on-surface">
                          {format(new Date(leave.start_date), 'MMM dd')} - {format(new Date(leave.end_date), 'MMM dd, yyyy')}
                      </p>
                      <p className="font-label-md text-on-surface-variant">Requested on {format(new Date(leave.created_at), 'MMM dd')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-body-md font-bold text-on-surface">
                          {leave.calculated_days} {leave.calculated_days === 1 ? 'Day' : 'Days'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusChip status={leave.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button {...motionProps} className={`material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-xl ${motionProps.className}`}>
                          {leave.status === 'PENDING' ? 'edit' : 'visibility'}
                        </motion.button>
                        {leave.status === 'PENDING' && (
                          <motion.button {...motionProps} className={`material-symbols-outlined text-on-surface-variant hover:text-error transition-colors text-xl ${motionProps.className}`}>
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
        <div className="px-6 py-3 border-t border-outline-variant flex items-center justify-between bg-surface-container-low/30">
          <p className="font-label-md text-on-surface-variant">Showing {filteredLeaves.length} records</p>
          <div className="flex gap-1">
            <motion.button {...motionProps} className={`material-symbols-outlined p-1 border border-outline-variant rounded hover:bg-surface-container-high transition-colors disabled:opacity-50 text-sm ${motionProps.className}`}>chevron_left</motion.button>
            <motion.button {...motionProps} className={`material-symbols-outlined p-1 border border-outline-variant rounded hover:bg-surface-container-high transition-colors text-sm ${motionProps.className}`}>chevron_right</motion.button>
          </div>
        </div>
      </section>

      {/* Bottom Motivation Banner */}
      <section className="relative h-48 rounded-2xl overflow-hidden shadow-md group bg-primary">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/40 z-10"></div>
        <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" alt="Library" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay transition-transform duration-700 group-hover:scale-105" />
        <div className="relative z-20 h-full flex flex-col justify-center px-10">
          <h3 className="font-headline-md text-white">Planning a well-deserved break?</h3>
          <p className="text-white/80 font-body-md mt-2 max-w-lg">Our staff wellness program encourages taking annual leave to maintain peak teaching performance. Check the holiday calendar for long weekends!</p>
          <motion.button {...motionProps} className={`mt-4 w-fit bg-white text-primary px-6 py-2 rounded-full font-bold text-label-md hover:bg-surface-container-low transition-colors ${motionProps.className}`}>
            View Holiday Calendar
          </motion.button>
        </div>
      </section>

    </div>
  );
}