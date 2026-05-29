import LeaveBalanceCard from "../components/common/LeaveBalanceCard";
import StatusChip from "../components/common/StatusChip";

export default function MyLeaves() {
  // Temporary mock data until we hook up the Go backend
  const leaveHistory = [
    { id: 1, type: "Annual Vacation", reason: "Family gathering", dateStr: "Apr 15 - Apr 20, 2024", requestedOn: "Apr 02", days: 6, status: "APPROVED", color: "bg-primary" },
    { id: 2, type: "Medical Appointment", reason: "Dental check-up", dateStr: "May 05, 2024", requestedOn: "Apr 28", days: 1, status: "PENDING", color: "bg-tertiary" },
    { id: 3, type: "Casual Leave", reason: "Personal errands", dateStr: "Feb 10 - Feb 12, 2024", requestedOn: "Feb 01", days: 2, status: "REJECTED", color: "bg-secondary" },
  ];

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
          <span className="font-label-md text-label-md text-on-surface-variant">Academic Year 2023-24</span>
        </div>
      </section>

      {/* Balances */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LeaveBalanceCard title="ANNUAL" used={14} total={22} icon="beach_access" theme="primary" />
        <LeaveBalanceCard title="SICK" used={8} total={10} icon="medical_services" theme="tertiary" />
        <LeaveBalanceCard title="CASUAL" used={3} total={5} icon="family_restroom" theme="secondary" />
      </section>

      {/* Filters & Actions */}
      <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full md:w-auto">
          <select className="bg-white border border-outline-variant px-4 py-2 rounded-lg text-body-sm focus:ring-1 focus:ring-primary outline-none">
            <option>Status: All Requests</option>
            <option>Approved</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>
          <select className="bg-white border border-outline-variant px-4 py-2 rounded-lg text-body-sm focus:ring-1 focus:ring-primary outline-none">
            <option>Year: 2024</option>
            <option>Year: 2023</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <button className="px-4 py-2 bg-primary text-on-primary rounded-full text-label-md font-bold">All History</button>
          <button className="px-4 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-full text-label-md font-bold transition-all">Documents</button>
          <button className="px-4 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-full text-label-md font-bold transition-all">Archived</button>
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
              {leaveHistory.map((leave) => (
                <tr key={leave.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${leave.color}`}></div>
                      <div>
                        <p className="font-body-md text-on-surface font-semibold">{leave.type}</p>
                        <p className="font-label-md text-on-surface-variant">{leave.reason}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-body-sm text-on-surface">{leave.dateStr}</p>
                    <p className="font-label-md text-on-surface-variant">Requested on {leave.requestedOn}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-body-md font-bold text-on-surface">{leave.days} {leave.days === 1 ? 'Day' : 'Days'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusChip status={leave.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-xl">
                        {leave.status === 'PENDING' ? 'edit' : 'visibility'}
                      </button>
                      {leave.status === 'PENDING' && (
                        <button className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors text-xl">delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-outline-variant flex items-center justify-between bg-surface-container-low/30">
          <p className="font-label-md text-on-surface-variant">Showing 1-3 of 12 records</p>
          <div className="flex gap-1">
            <button className="material-symbols-outlined p-1 border border-outline-variant rounded hover:bg-surface-container-high transition-colors disabled:opacity-50 text-sm" disabled>chevron_left</button>
            <button className="material-symbols-outlined p-1 border border-outline-variant rounded hover:bg-surface-container-high transition-colors text-sm">chevron_right</button>
          </div>
        </div>
      </section>

      {/* Bottom Motivation Banner */}
      <section className="relative h-48 rounded-2xl overflow-hidden shadow-md group bg-primary">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/40 z-10"></div>
        {/* Placeholder image simulating the library background */}
        <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" alt="Library" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay transition-transform duration-700 group-hover:scale-105" />
        <div className="relative z-20 h-full flex flex-col justify-center px-10">
          <h3 className="font-headline-md text-white">Planning a well-deserved break?</h3>
          <p className="text-white/80 font-body-md mt-2 max-w-lg">Our staff wellness program encourages taking annual leave to maintain peak teaching performance. Check the holiday calendar for long weekends!</p>
          <button className="mt-4 w-fit bg-white text-primary px-6 py-2 rounded-full font-bold text-label-md hover:bg-surface-container-low transition-colors active:scale-95">
            View Holiday Calendar
          </button>
        </div>
      </section>

    </div>
  );
}