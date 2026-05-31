import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useLeaveEngine } from "../hooks/useLeaveEngine";

const motionProps = {
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 25 },
    style: { cursor: "pointer" },
    whileHover: { scale: 1.02 },
  };

export default function Approvals() {
  const { 
    fetchPendingLeaves, 
    updateLeaveStatus, 
    pendingLeaves, 
    isLoading, 
    approverStats, 
    fetchApproverStats 
  } = useLeaveEngine();
  
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingLeaves();
    fetchApproverStats(); // Fetch the real KPI numbers on load
  }, [fetchPendingLeaves, fetchApproverStats]);

  // Handle Approve/Reject action
  const handleAction = async (id, status) => {
    setProcessingId(id);
    try {
      await updateLeaveStatus(id, status, `Auto-${status.toLowerCase()} by reviewer.`);
      // Refresh stats after an action is taken to keep KPIs accurate
      fetchApproverStats();
    } catch (err) {
      console.error(`Failed to ${status} leave:`, err);
    } finally {
      setProcessingId(null);
    }
  };

  // Safe unwrap for rendering
  const safePendingLeaves = Array.isArray(pendingLeaves) ? pendingLeaves : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Approver's Inbox</h1>
          <p className="text-on-surface-variant font-body-md mt-1">Review and manage faculty leave requests.</p>
        </div>
        <div className="flex gap-3">
          <motion.button {...motionProps} className={`px-4 py-2 border border-outline-variant bg-white text-on-surface rounded-lg font-bold flex items-center gap-2 ${motionProps.className}`}>
            <span className="material-symbols-outlined text-sm">filter_list</span> Filter
          </motion.button>
          <motion.button {...motionProps} className={`px-4 py-2 bg-primary text-white rounded-lg font-bold flex items-center gap-2 shadow-sm ${motionProps.className}`}>
            <span className="material-symbols-outlined text-sm">download</span> Export CSV
          </motion.button>
        </div>
      </section>

      {/* KPI Cards (Now using Live Backend Data) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-outline-variant p-5 rounded-xl shadow-sm">
          <p className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider mb-2">Pending Approval</p>
          <div className="text-display-sm font-bold text-primary mb-3">
            {approverStats?.pending_count || 0}
          </div>
          <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
             <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${Math.min((approverStats?.pending_count || 0) * 5, 100)}%` }}></div>
          </div>
        </div>
        
        <div className="bg-white border border-outline-variant p-5 rounded-xl shadow-sm">
          <p className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider mb-2">Approved Today</p>
          <div className="text-display-sm font-bold text-green-600 mb-1">
            {approverStats?.approved_today || 0}
          </div>
          <p className="text-label-sm text-green-700 font-medium">Live daily metric</p>
        </div>
        
        <div className="bg-white border border-outline-variant p-5 rounded-xl shadow-sm">
          <p className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider mb-2">Avg. Response Time</p>
          <div className="text-display-sm font-bold text-secondary mb-1">
            {approverStats?.avg_response_hours ? approverStats.avg_response_hours.toFixed(1) : "0.0"}h
          </div>
          <p className="text-label-sm text-on-surface-variant">Top 10% efficiency</p>
        </div>
      </section>

      {/* Data Table */}
      <section className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input 
              type="text" 
              placeholder="Search by name or type..." 
              className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="text-body-sm font-medium text-on-surface-variant flex items-center gap-2">
            Sort by: <span className="text-primary font-bold cursor-pointer">Newest First <span className="material-symbols-outlined text-[14px] align-middle">expand_more</span></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-5 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Employee Name</th>
                <th className="px-5 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Leave Type</th>
                <th className="px-5 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Dates</th>
                <th className="px-5 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Reason</th>
                <th className="px-5 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 font-label-md text-on-surface-variant uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {isLoading && safePendingLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-on-surface-variant animate-pulse">Loading inbox...</td>
                </tr>
              ) : safePendingLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">task_alt</span>
                    Inbox is completely clear. Great job!
                  </td>
                </tr>
              ) : (
                safePendingLeaves.map((leave) => (
                  <tr key={leave.id} className={`hover:bg-surface-container-low/30 transition-colors ${processingId === leave.id ? 'opacity-50 pointer-events-none' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-sm shrink-0">
                           {leave.user?.first_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-body-md text-on-surface font-bold">{leave.user?.first_name} {leave.user?.last_name}</p>
                          <p className="text-[11px] text-on-surface-variant truncate">Dept. ID: {leave.user?.department_id || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-body-sm font-bold text-on-surface capitalize">{leave.leave_type || "Leave Request"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-body-sm text-on-surface">{format(new Date(leave.start_date), 'MMM dd')} - {format(new Date(leave.end_date), 'MMM dd')}</p>
                      <p className="font-label-sm text-on-surface-variant mt-0.5">{leave.calculated_days} Days</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-body-sm text-on-surface-variant truncate max-w-[200px]" title={leave.reason}>{leave.reason}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                        <span className="material-symbols-outlined text-[14px]">pending</span> Pending
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <motion.button 
                          {...motionProps} 
                          onClick={() => handleAction(leave.id, "APPROVED")}
                          className={`w-8 h-8 rounded-full border-2 border-green-500 text-green-600 hover:bg-green-50 flex items-center justify-center transition-colors ${motionProps.className}`}
                          title="Approve"
                        >
                          <span className="material-symbols-outlined text-[18px] font-bold">check</span>
                        </motion.button>
                        <motion.button 
                          {...motionProps} 
                          onClick={() => handleAction(leave.id, "REJECTED")}
                          className={`w-8 h-8 rounded-full border-2 border-red-500 text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors ${motionProps.className}`}
                          title="Reject"
                        >
                          <span className="material-symbols-outlined text-[18px] font-bold">close</span>
                        </motion.button>
                        <button className="text-[10px] font-bold text-on-surface-variant hover:text-primary uppercase tracking-wider ml-2">
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom Widgets */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-sm">
        <h3 className="font-title-lg text-on-surface mb-4">Quick Analytics</h3>
        <div className="space-y-4">
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface-variant">Sabbatical Volume</span>
              <span className="font-bold text-on-surface">{approverStats?.sabbatical_volume || 0} Requests</span>
            </div>
            
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface-variant">Staff Capacity</span>
              <span className="font-bold text-primary">84%</span> {/* Keep as is or add new DB field */}
            </div>
            
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface-variant">Pending Since: 48h</span>
              <span className={`font-bold ${approverStats?.pending_since_48h > 0 ? 'text-error' : 'text-green-600'}`}>
                {approverStats?.pending_since_48h || 0} Requests
              </span>
            </div>
          </div>
        </div>

        <div className="bg-primary-container text-on-primary-container p-6 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-end min-h-[200px]">
            <div className="relative z-10">
                <h3 className="font-title-md font-bold mb-1">Efficiency Spotlight</h3>
                <p className="text-body-sm opacity-90">
                Your approval response time has {approverStats.efficiency_change >= 0 ? "improved" : "slipped"} by 
                {" "}{Math.abs(approverStats.efficiency_change).toFixed(1)}% this month.
                </p>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -top-4 text-9xl opacity-10 rotate-12">monitoring</span>
        </div>
      </section>

    </div>
  );
}