import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useUser } from "@clerk/clerk-react";
import Loader from "../components/common/Loader";
import { useAdminEngine } from "../hooks/useAdminEngine";

const motionProps = {
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 25 },
  style: { cursor: "pointer" },
  whileHover: { scale: 1.02 },
};

const selectClass = "appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg p-3 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-sm text-on-surface w-full bg-no-repeat bg-[right_12px_center] bg-[length:16px]";
const selectBgIcon = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2349454F'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`;

export default function AdminDashboard() {
  const { user: currentUser } = useUser();
  const [activeTab, setActiveTab] = useState("organization");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [dialog, setDialog] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null });
  const [formData, setFormData] = useState({});
  const [pdfFile, setPdfFile] = useState(null);
  const [pendingRoleChanges, setPendingRoleChanges] = useState({});

  const { 
    loading, error, departments, roles, leaveTypes, users, auditLogs, holidays,
    fetchDashboardData, executeLeaveAllocation, assignUserRole, importHolidaysPDF,
    createDepartment, createRole, createLeaveType, deleteItem, createHoliday
  } = useAdminEngine();

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const showMessage = (title, message, type = 'info') => setDialog({ isOpen: true, type, title, message, onConfirm: null });
  const confirmAction = (title, message, onConfirm) => setDialog({ isOpen: true, type: 'confirm', title, message, onConfirm });
  const closeDialog = () => setDialog({ ...dialog, isOpen: false });

  const handleOpenModal = (type) => { setFormData({}); setModalConfig({ isOpen: true, type }); };
  const handleCloseModal = () => setModalConfig({ isOpen: false, type: null });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (modalConfig.type === 'department') await createDepartment(formData);
      if (modalConfig.type === 'role') await createRole(formData);
      if (modalConfig.type === 'leaveType') await createLeaveType(formData);
      if (modalConfig.type === 'holiday') await createHoliday(formData);
      handleCloseModal();
      showMessage("Success", `${modalConfig.type} added successfully!`, "success");
    } catch (err) { showMessage("Error", err.message, "error"); } 
    finally { setIsProcessing(false); }
  };

  const handleDelete = (type, id, itemName) => {
    confirmAction("Confirm Deletion", `Are you sure you want to delete ${itemName}? This action cannot be undone.`, async () => {
      setIsProcessing(true);
      try {
        await deleteItem(type, id);
        showMessage("Deleted", `${itemName} has been removed.`, "success");
      } catch (err) { showMessage("Error", err.message, "error"); }
      finally { setIsProcessing(false); }
    });
  };

  const executePDFParse = async () => {
    if (!pdfFile) return;
    setIsProcessing(true);
    try {
      const res = await importHolidaysPDF(pdfFile);
      showMessage("Parsing Complete", `Extracted ${res.total_found} holidays. Saved ${res.total_saved} new entries.`, "success");
      setPdfFile(null);
    } catch (err) { showMessage("Parsing Failed", err.message, "error"); } 
    finally { setIsProcessing(false); }
  };

  const handleQueueRoleChange = (userId, newRoleName) => setPendingRoleChanges(prev => ({ ...prev, [userId]: newRoleName }));
  const cancelRoleChanges = () => setPendingRoleChanges({});

  const applyRoleChanges = async () => {
    setIsProcessing(true);
    try {
      const promises = Object.entries(pendingRoleChanges).map(([userId, roleName]) => assignUserRole(userId, roleName));
      await Promise.all(promises);
      showMessage("Success", "User directory privileges have been updated.", "success");
      setPendingRoleChanges({});
      fetchDashboardData();
    } catch (err) { showMessage("Error", "Failed to update some roles: " + err.message, "error"); } 
    finally { setIsProcessing(false); }
  };

  const handleAllocation = () => {
    confirmAction("Global Allocation", `Execute Yearly Allocation for ${users.length} users? This will reset ledgers to default values.`, async () => {
      setIsProcessing(true);
      try {
        const res = await executeLeaveAllocation();
        showMessage("Allocation Success", res.message, "success");
      } catch (err) { showMessage("Error", err.message, "error"); }
      finally { setIsProcessing(false); }
    });
  };

  if (loading) return <Loader message="Compiling live system metrics..." fullScreen={true} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative pb-24">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">System Administration</h1>
          <p className="text-on-surface-variant font-body-md mt-1">Configure enterprise architecture, automate ingestion, and audit updates.</p>
        </div>
      </section>

      <div className="md:hidden flex overflow-x-auto gap-2 pb-2 hide-scrollbar snap-x">
        {[
          { id: "organization", label: "Org Structure" },
          { id: "directory", label: "Directory" },
          { id: "holidays", label: "Holidays" },
          { id: "operations", label: "Operations" }
        ].map(tab => (
          <button 
            key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap snap-start transition-all ${
              activeTab === tab.id ? "bg-primary text-white shadow-md" : "bg-surface-container-low text-on-surface-variant border border-outline-variant"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="hidden md:block bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="flex border-b border-outline-variant bg-surface-container-lowest">
          {[
            { id: "organization", label: "Organization Structure", icon: "account_tree" },
            { id: "directory", label: "User Directory", icon: "manage_accounts" },
            { id: "holidays", label: "Holiday Automation", icon: "calendar_month" },
            { id: "operations", label: "System Operations", icon: "admin_panel_settings" }
          ].map((tab) => (
            <motion.button 
              {...motionProps} key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-label-lg flex items-center gap-2 transition-colors border-b-2 ${
                activeTab === tab.id ? "border-primary text-primary font-bold bg-primary/5" : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span> {tab.label}
            </motion.button>
          ))}
        </div>
      </section>

      <section className="p-4 md:p-6 bg-white border border-outline-variant rounded-xl min-h-[500px] shadow-sm">
        
        {/* TAB 1: Organization */}
        {activeTab === "organization" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="border border-outline-variant rounded-xl p-5 bg-surface-container-lowest">
              <div className="flex justify-between items-center mb-4 border-b border-outline-variant pb-3">
                <h3 className="font-title-md font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">domain</span> Departments</h3>
                <motion.button {...motionProps} onClick={() => handleOpenModal('department')} className="text-primary hover:bg-primary/10 p-1 rounded-full"><span className="material-symbols-outlined">add</span></motion.button>
              </div>
              <ul className="divide-y divide-outline-variant">
                {departments.map(dept => (
                  <li key={dept.ID || dept.id} className="py-3 flex justify-between items-center group">
                    <div>
                       <span className="font-body-sm font-bold block">{dept.Name || dept.name}</span>
                       {(dept.HODUserID || dept.hod_user_id) && <span className="text-[10px] text-on-surface-variant uppercase">HOD Assigned</span>}
                    </div>
                    <button onClick={() => handleDelete('department', dept.ID || dept.id, dept.Name || dept.name)} className="text-error opacity-0 group-hover:opacity-100 transition-opacity p-1"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-outline-variant rounded-xl p-5 bg-surface-container-lowest">
              <div className="flex justify-between items-center mb-4 border-b border-outline-variant pb-3">
                <h3 className="font-title-md font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">badge</span> Access Roles</h3>
                <motion.button {...motionProps} onClick={() => handleOpenModal('role')} className="text-primary hover:bg-primary/10 p-1 rounded-full"><span className="material-symbols-outlined">add</span></motion.button>
              </div>
              <ul className="divide-y divide-outline-variant">
                {roles.map(role => (
                  <li key={role.ID || role.id} className="py-3 flex justify-between items-center group">
                    <div><p className="font-body-sm font-bold">{role.Name || role.name}</p><p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Level: {role.HierarchyLevel || role.hierarchy_level}</p></div>
                    <button onClick={() => handleDelete('role', role.ID || role.id, role.Name || role.name)} className="text-error opacity-0 group-hover:opacity-100 transition-opacity p-1"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-outline-variant rounded-xl p-5 bg-surface-container-lowest">
              <div className="flex justify-between items-center mb-4 border-b border-outline-variant pb-3">
                <h3 className="font-title-md font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">policy</span> Leave Policies</h3>
                <motion.button {...motionProps} onClick={() => handleOpenModal('leaveType')} className="text-primary hover:bg-primary/10 p-1 rounded-full"><span className="material-symbols-outlined">add</span></motion.button>
              </div>
              <ul className="divide-y divide-outline-variant">
                {leaveTypes.map(type => (
                  <li key={type.ID || type.id} className="py-3 flex justify-between items-center group">
                    <div><p className="font-body-sm font-bold">{type.Name || type.name}</p><p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{type.DefaultDays || type.default_days} Days / Year</p></div>
                    <button onClick={() => handleDelete('leaveType', type.ID || type.id, type.Name || type.name)} className="text-error opacity-0 group-hover:opacity-100 transition-opacity p-1"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: Directory */}
        {activeTab === "directory" && (
          <div className="border border-outline-variant rounded-xl overflow-x-auto relative">
            <table className="w-full border-collapse text-left min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-label-sm text-on-surface-variant uppercase tracking-wider">
                  <th className="px-5 py-4">Employee</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">System Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {users.map(user => {
                  const currentEffectiveRole = pendingRoleChanges[user.ID] || user.role?.name;
                  const isChanged = !!pendingRoleChanges[user.ID];
                  const isSelf = currentUser && (user.Email === currentUser.primaryEmailAddress?.emailAddress);

                  return (
                    <tr key={user.ID} className={`transition-colors ${isChanged ? 'bg-primary/5' : 'hover:bg-surface-container-low/30'}`}>
                      <td className="px-5 py-4">
                        <div className="font-bold text-on-surface flex items-center gap-2">
                          {user.FirstName} {user.LastName} {isSelf && <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full uppercase">You</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-body-sm text-on-surface-variant">{user.Email}</td>
                      <td className="px-5 py-4 font-body-sm text-on-surface-variant w-64">
                        <select 
                          disabled={isProcessing || isSelf}
                          value={currentEffectiveRole || ""}
                          style={{ backgroundImage: selectBgIcon }}
                          onChange={(e) => handleQueueRoleChange(user.ID, e.target.value)}
                          className={`${selectClass} ${isChanged ? 'border-primary ring-1 ring-primary' : ''} ${isSelf ? 'opacity-50 cursor-not-allowed bg-surface-container' : 'cursor-pointer'}`}
                        >
                          <option value="" disabled>Select Role...</option>
                          {roles.map(r => <option key={r.ID || r.id} value={r.Name || r.name}>{r.Name || r.name}</option>)}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: Holidays */}
        {activeTab === "holidays" && (
          <div className="space-y-8">
            <div className="bg-primary-container/20 border-2 border-dashed border-primary/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors">
              <div className="w-16 h-16 bg-white text-primary rounded-full flex items-center justify-center mb-4 shadow-sm border border-outline-variant"><span className="material-symbols-outlined text-3xl">document_scanner</span></div>
              <h3 className="text-title-lg font-bold text-primary mb-2">Automated PDF Parsing</h3>
              <p className="text-body-sm text-on-surface-variant max-w-md mb-6">Upload the official University Holiday List PDF. Review the file below before starting the extraction engine.</p>
              
              {!pdfFile ? (
                <label className="cursor-pointer">
                  <input type="file" className="hidden" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])} />
                  <motion.div {...motionProps} className="px-6 py-3 bg-white text-primary border border-outline-variant rounded-lg font-bold flex items-center gap-2 shadow-sm">
                    <span className="material-symbols-outlined">upload</span> Select PDF Document
                  </motion.div>
                </label>
              ) : (
                <div className="bg-white border border-outline-variant p-4 rounded-xl flex items-center gap-4 w-full max-w-md">
                  <span className="material-symbols-outlined text-error text-3xl">picture_as_pdf</span>
                  <div className="flex-1 text-left truncate">
                    <p className="font-bold text-sm truncate">{pdfFile.name}</p>
                    <p className="text-xs text-on-surface-variant">{(pdfFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={() => setPdfFile(null)} className="p-2 text-on-surface-variant hover:text-error rounded-full"><span className="material-symbols-outlined">close</span></button>
                  <motion.button {...motionProps} onClick={executePDFParse} disabled={isProcessing} className="px-4 py-2 bg-primary text-white rounded-lg font-bold flex items-center gap-2">
                     {isProcessing ? "Parsing..." : "Start"}
                  </motion.button>
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-end mb-4 border-b border-outline-variant pb-2">
                <h3 className="font-title-md font-bold flex-1">Established Institutional Calendar</h3>
                <motion.button 
                  {...motionProps} 
                  onClick={() => handleOpenModal('holiday')} 
                  className="text-primary font-bold flex items-center gap-1 text-sm bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span> Manual Entry
                </motion.button>
              </div>
              <div className="border border-outline-variant rounded-xl overflow-x-auto">
                 <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-surface-container-low border-b border-outline-variant">
                       <tr className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                          <th className="px-5 py-3">Date</th><th className="px-5 py-3">Holiday Name</th><th className="px-5 py-3">Type</th><th className="px-5 py-3 w-16"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                       {holidays.length === 0 ? <tr><td colSpan="4" className="text-center py-6 text-on-surface-variant italic">No holidays imported yet.</td></tr> : null}
                       {holidays.map(h => (
                          <tr key={h.ID} className="hover:bg-surface-container-lowest">
                             <td className="px-5 py-3 font-bold text-on-surface">{h.HolidayDate ? format(new Date(h.HolidayDate), 'MMM dd, yyyy') : 'N/A'}</td>
                             <td className="px-5 py-3">{h.Name}</td>
                             <td className="px-5 py-3">{h.IsRestricted ? <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs border border-orange-200">Restricted</span> : <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs border border-green-200">National</span>}</td>
                             <td className="px-5 py-3 text-right"><button onClick={() => handleDelete('holiday', h.ID, h.Name)} className="text-on-surface-variant hover:text-error p-1"><span className="material-symbols-outlined text-[18px]">delete</span></button></td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Operations */}
        {activeTab === "operations" && (
          <div className="space-y-8">
             <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div><h3 className="text-title-lg font-bold text-red-800 flex items-center gap-2 mb-1"><span className="material-symbols-outlined">warning</span> Global Leave Allocation</h3><p className="text-body-sm text-red-600/80 max-w-xl">Executing this action will distribute the default annual leave balances to all active users.</p></div>
                <motion.button {...motionProps} onClick={handleAllocation} disabled={isProcessing} className={`px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-2 shadow-sm whitespace-nowrap ${isProcessing ? 'opacity-50' : ''}`}>
                   <span className="material-symbols-outlined">play_arrow</span> {isProcessing ? "Processing..." : "Execute Allocation"}
                </motion.button>
             </div>
             <div>
                <h3 className="font-title-md font-bold text-on-surface mb-4 border-b border-outline-variant pb-2">Recent System Audits</h3>
                <div className="border border-outline-variant rounded-xl overflow-x-auto">
                   <table className="w-full text-left min-w-[700px]">
                      <thead className="bg-surface-container-low border-b border-outline-variant"><tr className="text-label-sm text-on-surface-variant uppercase tracking-wider"><th className="px-5 py-3 w-48">Timestamp</th><th className="px-5 py-3">Administrator</th><th className="px-5 py-3">Action Taken</th><th className="px-5 py-3">Target</th></tr></thead>
                      <tbody className="divide-y divide-outline-variant">
                         {auditLogs.map(log => (
                            <tr key={log.ID || log.id} className="hover:bg-surface-container-low/30">
                               <td className="px-5 py-3 font-body-sm text-on-surface-variant">{(log.CreatedAt || log.created_at) ? format(new Date(log.CreatedAt || log.created_at), 'MMM dd, HH:mm') : 'N/A'}</td>
                               <td className="px-5 py-3 font-body-sm font-bold text-on-surface">{log.AdminName || log.admin_name}</td>
                               <td className="px-5 py-3 font-body-sm"><span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold border border-primary/20">{log.Action || log.action}</span></td>
                               <td className="px-5 py-3 font-body-sm text-on-surface-variant">{log.Target || log.target}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}
      </section>

      {/* --- FLOATING BATCH ROLE BAR --- */}
      <AnimatePresence>
        {Object.keys(pendingRoleChanges).length > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-container-highest border border-outline-variant shadow-xl rounded-full px-6 py-4 flex items-center gap-6 z-40">
             <div className="text-on-surface font-bold text-sm flex items-center gap-2">
               <span className="material-symbols-outlined text-primary">info</span> You have {Object.keys(pendingRoleChanges).length} unsaved role change(s)
             </div>
             <div className="flex items-center gap-2">
               <button onClick={cancelRoleChanges} className="px-4 py-2 font-bold text-on-surface-variant hover:bg-surface-container rounded-full text-sm">Cancel</button>
               <button onClick={applyRoleChanges} disabled={isProcessing} className="px-6 py-2 bg-primary text-white rounded-full font-bold shadow-md text-sm">{isProcessing ? "Saving..." : "Apply Changes"}</button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FORM MODALS --- */}
      <AnimatePresence>
      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 text-on-surface-variant hover:text-error bg-surface-container-low rounded-full p-1"><span className="material-symbols-outlined">close</span></button>
            <h2 className="text-title-lg font-bold mb-6 text-on-surface capitalize">Add {modalConfig.type === 'leaveType' ? 'Policy' : modalConfig.type}</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {modalConfig.type === 'department' && (
                <>
                  <div><label className="block text-label-md font-bold mb-1">Department Name</label><input required type="text" onChange={(e) => setFormData({...formData, name: e.target.value})} className={selectClass.replace('bg-[right_12px_center] bg-[length:16px]', '')} /></div>
                  <div>
                    <label className="block text-label-md font-bold mb-1">Assign Head of Dept (Optional)</label>
                    <select style={{ backgroundImage: selectBgIcon }} onChange={(e) => setFormData({...formData, hod_user_id: e.target.value})} className={selectClass}>
                      <option value="">Select a user...</option>
                      {users.map(u => <option key={u.ID} value={u.ID}>{u.FirstName} {u.LastName}</option>)}
                    </select>
                  </div>
                </>
              )}

              {modalConfig.type === 'role' && (
                <>
                  <div><label className="block text-label-md font-bold mb-1">Role Name</label><input required type="text" onChange={(e) => setFormData({...formData, name: e.target.value})} className={selectClass.replace('bg-[right_12px_center] bg-[length:16px]', '')} /></div>
                  <div><label className="block text-label-md font-bold mb-1">Hierarchy Level (1-100)</label><input required type="number" onChange={(e) => setFormData({...formData, hierarchy_level: e.target.value})} className={selectClass.replace('bg-[right_12px_center] bg-[length:16px]', '')} /></div>
                </>
              )}

              {modalConfig.type === 'leaveType' && (
                <>
                  <div><label className="block text-label-md font-bold mb-1">Policy Name</label><input required type="text" onChange={(e) => setFormData({...formData, name: e.target.value})} className={selectClass.replace('bg-[right_12px_center] bg-[length:16px]', '')} /></div>
                  <div><label className="block text-label-md font-bold mb-1">Default Days Allocated</label><input required type="number" step="0.5" onChange={(e) => setFormData({...formData, default_days: e.target.value})} className={selectClass.replace('bg-[right_12px_center] bg-[length:16px]', '')} /></div>
                  <div>
                    <label className="block text-label-md font-bold mb-1">Required Role</label>
                    <select required style={{ backgroundImage: selectBgIcon }} onChange={(e) => setFormData({...formData, requires_role_id: e.target.value})} className={selectClass}>
                      <option value="">Select a role...</option>
                      {roles.map(r => <option key={r.ID || r.id} value={r.ID || r.id}>{r.Name || r.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <input type="checkbox" id="carry" onChange={(e) => setFormData({...formData, is_carry_forward: e.target.checked})} className="w-5 h-5 accent-primary rounded cursor-pointer" />
                    <label htmlFor="carry" className="text-body-sm font-bold text-on-surface-variant cursor-pointer">Allow Carry Forward</label>
                  </div>
                </>
              )}

              {modalConfig.type === 'holiday' && (
                <>
                  <div><label className="block text-label-md font-bold mb-1">Holiday Name</label><input required type="text" onChange={(e) => setFormData({...formData, name: e.target.value})} className={selectClass.replace('bg-[right_12px_center] bg-[length:16px]', '')} /></div>
                  <div><label className="block text-label-md font-bold mb-1">Date</label><input required type="date" onChange={(e) => setFormData({...formData, holiday_date: e.target.value})} className={selectClass.replace('bg-[right_12px_center] bg-[length:16px]', '')} /></div>
                  <div className="flex items-center gap-2 mt-4">
                    <input type="checkbox" id="restricted" onChange={(e) => setFormData({...formData, is_restricted: e.target.checked})} className="w-5 h-5 accent-primary rounded cursor-pointer" />
                    <label htmlFor="restricted" className="text-body-sm font-bold text-on-surface-variant cursor-pointer">Mark as Restricted Holiday</label>
                  </div>
                </>
              )}
              <div className="pt-4"><button type="submit" disabled={isProcessing} className="w-full py-3 bg-primary text-white rounded-lg font-bold shadow-md hover:bg-primary/90 transition-colors">{isProcessing ? "Saving..." : "Save Configuration"}</button></div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* --- CONFIRMATION / ALERTS --- */}
      <AnimatePresence>
        {dialog.isOpen && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${dialog.type === 'error' ? 'bg-error-container text-error' : dialog.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-primary-container text-primary'}`}>
                <span className="material-symbols-outlined text-3xl">{dialog.type === 'error' ? 'error' : dialog.type === 'success' ? 'check_circle' : 'help'}</span>
              </div>
              <h2 className="text-title-lg font-bold mb-2 text-on-surface">{dialog.title}</h2>
              <p className="text-body-sm text-on-surface-variant mb-8">{dialog.message}</p>
              
              <div className="flex gap-3 justify-center">
                {dialog.type === 'confirm' && <button onClick={closeDialog} className="px-6 py-2.5 rounded-full font-bold text-on-surface-variant bg-surface-container-highest hover:bg-outline-variant transition-colors">Cancel</button>}
                <button 
                  onClick={() => { if(dialog.onConfirm) dialog.onConfirm(); closeDialog(); }} 
                  className={`px-8 py-2.5 rounded-full font-bold text-white shadow-md transition-colors ${dialog.type === 'error' ? 'bg-error hover:bg-error/90' : 'bg-primary hover:bg-primary/90'}`}
                >
                  {dialog.type === 'confirm' ? 'Confirm' : 'Okay'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}