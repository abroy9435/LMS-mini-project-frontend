export default function LeaveApplicationModal({ isOpen, onClose }) {
    if (!isOpen) return null;
  
    return (
      // The "fixed inset-0 z-[100]" ensures this sits on top of navbar and sidebar
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        
        {/* Modal Card */}
        <div className="bg-white border border-outline-variant w-full max-w-[600px] rounded-[16px] shadow-xl flex flex-col ">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface rounded-t-[16px]">
            <div>
              <h2 className="text-[20px] font-semibold text-primary">Apply for Leave</h2>
              <p className="text-[14px] text-on-surface-variant mt-1">Submit your request for administrative review.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
  
          {/* Form Body */}
          <form className="p-6 space-y-5">
            <div>
              <label className="text-[12px] font-bold uppercase text-on-surface-variant block mb-1 ">Leave Type</label>
              <select className="w-full h-11 px-4 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option>Select a leave category</option>
                <option>Annual Leave</option>
                <option>Sick Leave</option>
              </select>
            </div>
  
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-bold uppercase text-on-surface-variant block mb-1">Start Date</label>
                <input type="date" className="w-full h-11 px-4 border bg-surface border-outline-variant rounded-lg" />
              </div>
              <div>
                <label className="text-[12px] font-bold uppercase text-on-surface-variant block mb-1">End Date</label>
                <input type="date" className="w-full h-11 px-4 border bg-surface border-outline-variant rounded-lg" />
              </div>
            </div>
  
            <div>
              <label className="text-[12px] font-bold uppercase text-on-surface-variant block mb-1">Reason for Leave</label>
              <textarea rows="3" className="w-full p-4 border bg-surface border-outline-variant rounded-lg" placeholder="Please provide brief details..."></textarea>
            </div>
  
            <div className="border-2 border-dashed border-outline-variant bg-surface rounded-lg p-6 flex flex-col items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined mb-2">cloud_upload</span>
              <p className="text-[14px] text-center">Click to upload or drag and drop<br/><span className="text-[10px] uppercase text-outline">PDF, JPG, or PNG (Max 5MB)</span></p>
            </div>
  
            <div className="flex items-center gap-2">
              <input type="checkbox" id="notify" className="rounded border-outline-variant text-primary" />
              <label htmlFor="notify" className="text-[14px] text-on-surface-variant">Notify my Head of Department automatically.</label>
            </div>
          </form>
  
          {/* Footer */}
          <div className="px-6 py-4 bg-surface border-t border-outline-variant flex justify-end items-center gap-3 rounded-b-[16px]">
            <button onClick={onClose} className="px-6 py-2 font-bold text-on-surface-variant">Cancel</button>
            <button className="px-6 py-2 bg-primary text-white font-bold rounded-lg shadow-md hover:opacity-90">Submit Request</button>
          </div>
        </div>
      </div>
    );
  }