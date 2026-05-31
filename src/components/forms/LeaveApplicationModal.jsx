import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLeaveEngine } from "../../hooks/useLeaveEngine"; // Adjust path if needed

const motionProps = {
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 25 },
  className: "cursor-pointer"
};

export default function LeaveApplicationModal({ isOpen, onClose }) {
  const { submitLeaveRequest, fetchLeaveTypes, isLoading, error, clearError } = useLeaveEngine();
  
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: ""
  });

  useEffect(() => {
    if (isOpen) {
      clearError();
      fetchLeaveTypes()
        .then(res => {
          // Check where the array is actually hiding in the JSON response
          const typesArray = res.leave_types || res.data || res;
          // Ensure it is definitely an array before setting it
          setLeaveTypes(Array.isArray(typesArray) ? typesArray : []);
        })
        .catch(err => console.error("Failed to load leave types", err));
    } else {
      setFormData({ leave_type_id: "", start_date: "", end_date: "", reason: "" });
    }
  }, [isOpen, fetchLeaveTypes, clearError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitLeaveRequest(formData);
      // Close modal on success
      onClose();
    } catch (err) {
      // Error is caught by the engine, but we stop the modal from closing
      console.error("Submission failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      
      {/* Modal Card */}
      <div className="bg-white border border-outline-variant w-full max-w-[600px] rounded-[16px] shadow-xl flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface rounded-t-[16px]">
          <div>
            <h2 className="text-[20px] font-semibold text-primary">Apply for Leave</h2>
            <p className="text-[14px] text-on-surface-variant mt-1">Submit your request for administrative review.</p>
          </div>
          <motion.button {...motionProps} onClick={onClose} className={`p-2 hover:bg-surface-container-high rounded-full transition-colors ${motionProps.className}`}>
            <span className="material-symbols-outlined flex items-center justify-center">close</span>
          </motion.button>
        </div>

        {/* Form Body */}
        <form id="leave-form" onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Error Banner */}
          {error && (
            <div className="p-3 mb-4 text-sm text-error bg-error-container flex  justify-center items-center rounded-lg font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="text-[12px] font-bold uppercase text-on-surface-variant block mb-1">Leave Type</label>
            <select 
              name="leave_type_id"
              required
              value={formData.leave_type_id}
              onChange={handleChange}
              className="w-full h-11 px-4 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none cursor-pointer"
            >
              <option value="" disabled>Select a leave category</option>
              {leaveTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
              {/* Fallback if backend types haven't loaded yet */}
              {leaveTypes.length === 0 && <option disabled>Loading types...</option>}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-bold uppercase text-on-surface-variant block mb-1">Start Date</label>
              <input 
                type="date" 
                name="start_date"
                required
                value={formData.start_date}
                onChange={handleChange}
                className="w-full h-11 px-4 border bg-surface border-outline-variant rounded-lg cursor-text" 
              />
            </div>
            <div>
              <label className="text-[12px] font-bold uppercase text-on-surface-variant block mb-1">End Date</label>
              <input 
                type="date" 
                name="end_date"
                required
                value={formData.end_date}
                onChange={handleChange}
                className="w-full h-11 px-4 border bg-surface border-outline-variant rounded-lg cursor-text" 
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold uppercase text-on-surface-variant block mb-1">Reason for Leave</label>
            <textarea 
              name="reason"
              required
              value={formData.reason}
              onChange={handleChange}
              rows="3" 
              className="w-full p-4 border bg-surface border-outline-variant rounded-lg resize-none" 
              placeholder="Please provide brief details..."
            ></textarea>
          </div>

          {/* Placeholder for future file uploads */}
          <div className="border-2 border-dashed border-outline-variant bg-surface rounded-lg p-6 flex flex-col items-center justify-center text-on-surface-variant cursor-not-allowed opacity-60">
            <span className="material-symbols-outlined mb-2">cloud_upload</span>
            <p className="text-[14px] text-center">Document Upload Coming Soon<br/><span className="text-[10px] uppercase text-outline">PDF, JPG, or PNG (Max 5MB)</span></p>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="notify" className="rounded border-outline-variant text-primary cursor-pointer" defaultChecked />
            <label htmlFor="notify" className="text-[14px] text-on-surface-variant cursor-pointer">Notify my Head of Department automatically.</label>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface border-t border-outline-variant flex justify-end items-center gap-3 rounded-b-[16px]">
          <motion.button 
            {...motionProps} 
            type="button"
            onClick={onClose} 
            disabled={isLoading}
            className={`px-6 py-2 font-bold text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors disabled:opacity-50 ${motionProps.className}`}
          >
            Cancel
          </motion.button>
          
          <motion.button 
            {...motionProps} 
            form="leave-form" // This targets the form ID above to trigger the onSubmit
            type="submit"
            disabled={isLoading}
            className={`px-6 py-2 bg-primary text-white font-bold rounded-lg shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${motionProps.className}`}
          >
            {isLoading ? "Submitting..." : "Submit Request"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}