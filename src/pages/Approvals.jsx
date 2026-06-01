import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import StatCard from "../components/common/StatCard";
import Loader from "../components/common/Loader";

const motionProps = {
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 25 },
  style: { cursor: "pointer" },
  whileHover: { scale: 1.02 },
};

export default function Approvals() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});

  // Action Modal State
  const [actionModal, setActionModal] = useState({ isOpen: false, type: null, leaveId: null });
  const [remarks, setRemarks] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialog, setDialog] = useState({ isOpen: false, type: 'info', title: '', message: '' });

  const closeDialog = () => setDialog({ ...dialog, isOpen: false });
  const closeActionModal = () => {
    setActionModal({ isOpen: false, type: null, leaveId: null });
    setRemarks("");
  };

  const fetchApprovalsData = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

      // Adjust these URLs if your routes are named differently in main.go
      const [reqRes, statsRes] = await Promise.all([
        fetch(`${baseUrl}/api/v1/leaves/pending`, { headers }),
        fetch(`${baseUrl}/api/v1/leaves/approver-stats`, { headers })
      ]);

      const reqData = await reqRes.json();
      const statsData = await statsRes.json();

      // Unwrap arrays and objects safely
      setRequests(Array.isArray(reqData.data) ? reqData.data : []);
      setStats(statsData.data || {});

    } catch (error) {
      console.error("Failed to fetch approvals data:", error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchApprovalsData();
  }, [fetchApprovalsData]);

  // Handle Approve / Reject Submission
  const submitAction = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const token = await getToken();
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
      
      const response = await fetch(`${baseUrl}/api/v1/leaves/${actionModal.leaveId}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: actionModal.type, // 'APPROVED' or 'REJECTED'
          remarks: remarks
        })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Failed to process request");

      setDialog({ isOpen: true, type: 'success', title: 'Success', message: data.message });
      closeActionModal();
      fetchApprovalsData(); // Refresh the list
    } catch (error) {
      setDialog({ isOpen: true, type: 'error', title: 'Action Failed', message: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <Loader message="Fetching pending requests..."  />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Action Inbox</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Review and process pending leave requests from your department.
          </p>
        </div>
      </div>

      {/* Stats Grid (API uses snake_case here) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Pending Requests" 
          value={(stats.pending_count || 0).toString()} 
          subtitle="Awaiting your action" 
          icon="inbox" 
          theme="primary" 
        />
        <StatCard 
          title="Approved Today" 
          value={(stats.approved_today || 0).toString()} 
          subtitle="Processed in last 24h" 
          icon="task_alt" 
          theme="secondary" 
        />
        <StatCard 
          title="Avg. Turnaround" 
          value={`${(stats.avg_response_hours || 0).toFixed(1)} hrs`} 
          subtitle="Your response time" 
          icon="timer" 
          theme="tertiary" 
        />
      </div>

      {/* Pending Requests Table/List */}
      <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
          <h2 className="font-title-lg text-title-lg text-on-surface">Requires Approval</h2>
        </div>

        {requests.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">done_all</span>
            <p className="font-title-md font-bold">You're all caught up!</p>
            <p className="text-body-sm">There are no pending requests in your queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {requests.map((leave) => {
                  // Safely extract API variables handling exact casing
                  const applicant = leave.User ? `${leave.User.FirstName} ${leave.User.LastName}` : "Unknown User";
                  const email = leave.User?.Email || "";
                  const typeName = leave.LeaveType?.name || "Leave Request";
                  
                  return (
                    <tr key={leave.ID} className="hover:bg-surface-container-lowest transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-on-surface">{applicant}</div>
                        <div className="text-body-sm text-on-surface-variant">{email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-full text-xs">
                          {typeName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-on-surface">
                          {leave.StartDate ? format(new Date(leave.StartDate), 'MMM dd') : ''} - {leave.EndDate ? format(new Date(leave.EndDate), 'MMM dd, yyyy') : ''}
                        </div>
                        <div className="text-body-sm text-on-surface-variant font-bold">
                          {leave.CalculatedDays} Days
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-body-sm text-on-surface-variant truncate max-w-[200px]" title={leave.Reason}>
                          {leave.Reason}
                        </p>
                        <p className="text-[10px] text-on-surface-variant/70 mt-1 uppercase tracking-wider font-bold">
                          Applied {leave.AppliedAt ? formatDistanceToNow(new Date(leave.AppliedAt), { addSuffix: true }) : ''}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <motion.button 
                            {...motionProps} 
                            onClick={() => setActionModal({ isOpen: true, type: 'REJECTED', leaveId: leave.ID })}
                            className="p-2 text-error hover:bg-error-container rounded-full flex items-center justify-center transition-colors"
                            title="Reject"
                          >
                            <span className="material-symbols-outlined">close</span>
                          </motion.button>
                          <motion.button 
                            {...motionProps} 
                            onClick={() => setActionModal({ isOpen: true, type: 'APPROVED', leaveId: leave.ID })}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-full flex items-center justify-center transition-colors"
                            title="Approve"
                          >
                            <span className="material-symbols-outlined">check</span>
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- ACTION MODAL (Approve / Reject) --- */}
      <AnimatePresence>
        {actionModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative flex flex-col"
            >
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${actionModal.type === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-error-container text-error'}`}>
                <span className="material-symbols-outlined text-3xl">
                  {actionModal.type === 'APPROVED' ? 'fact_check' : 'free_cancellation'}
                </span>
              </div>
              
              <h2 className="text-title-lg font-bold mb-2 text-on-surface text-center">
                {actionModal.type === 'APPROVED' ? 'Approve Leave Request' : 'Reject Leave Request'}
              </h2>
              <p className="text-body-sm text-on-surface-variant mb-6 text-center">
                {actionModal.type === 'APPROVED' 
                  ? 'This action will automatically deduct the balance from the applicant.' 
                  : 'Please provide a reason for the rejection below.'}
              </p>

              <form onSubmit={submitAction} className="space-y-4">
                <div>
                  <label className="block text-label-md font-bold mb-1">Remarks / Comments</label>
                  <textarea 
                    rows="3" 
                    required={actionModal.type === 'REJECTED'} // Required if rejecting
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter your notes here..."
                    className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-sm text-on-surface resize-none"
                  ></textarea>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    disabled={isProcessing}
                    onClick={closeActionModal} 
                    className="flex-1 px-4 py-3 border border-outline-variant rounded-full font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isProcessing}
                    className={`flex-1 px-4 py-3 text-white rounded-full font-bold shadow-md transition-colors ${
                      actionModal.type === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-error hover:bg-error/90'
                    } ${isProcessing ? 'opacity-50' : ''}`}
                  >
                    {isProcessing ? "Processing..." : `Confirm ${actionModal.type === 'APPROVED' ? 'Approval' : 'Rejection'}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- SUCCESS/ERROR DIALOG --- */}
      <AnimatePresence>
        {dialog.isOpen && (
          <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${dialog.type === 'error' ? 'bg-error-container text-error' : 'bg-green-100 text-green-600'}`}>
                <span className="material-symbols-outlined text-3xl">{dialog.type === 'error' ? 'error' : 'check_circle'}</span>
              </div>
              <h2 className="text-title-lg font-bold mb-2 text-on-surface">{dialog.title}</h2>
              <p className="text-body-sm text-on-surface-variant mb-8">{dialog.message}</p>
              
              <div className="flex justify-center">
                <button 
                  onClick={closeDialog} 
                  className={`px-8 py-2.5 rounded-full font-bold text-white shadow-md transition-colors ${dialog.type === 'error' ? 'bg-error hover:bg-error/90' : 'bg-primary hover:bg-primary/90'}`}
                >
                  Okay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}