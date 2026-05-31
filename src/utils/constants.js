export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // e.g., https://abroy9435-elms-backend.hf.space

export const API_URLS = {
  // User & Authentication Routes
  user: {
    me: `${API_BASE_URL}/api/v1/me`,
    profile: `${API_BASE_URL}/api/v1/profile`,
  },

  // Leave Management Routes
  leave: {
    types: `${API_BASE_URL}/api/v1/leave-types`,
    apply: `${API_BASE_URL}/api/v1/leaves`,
    myLeaves: `${API_BASE_URL}/api/v1/leaves/me`,
    pending: `${API_BASE_URL}/api/v1/leaves/pending`,
    stats: `${API_BASE_URL}/api/v1/leaves/approver-stats`,
    updateStatus: (leaveId) => `${API_BASE_URL}/api/v1/leaves/${leaveId}/status`,
  },

  // Leave Balances
  balance: {
    myBalances: `${API_BASE_URL}/api/v1/balances/me`,
  },

  // Administrator Routes
  admin: {
    departments: `${API_BASE_URL}/api/v1/admin/departments`,
    roles: `${API_BASE_URL}/api/v1/admin/roles`,
    leaveTypes: `${API_BASE_URL}/api/v1/admin/leave-types`,
    users: `${API_BASE_URL}/api/v1/admin/users`,
    assignRole: `${API_BASE_URL}/api/v1/admin/assign-role`,
    importHolidays: `${API_BASE_URL}/api/v1/admin/holidays/import`,
    holidays: `${API_BASE_URL}/api/v1/admin/holidays`,
    allocateLeaves: `${API_BASE_URL}/api/v1/admin/allocate-leaves`,
    auditLogs: `${API_BASE_URL}/api/v1/admin/audit-logs`,
  }
};

export const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  APPROVER: 'APPROVER',
  ADMIN: 'ADMIN',
};

export const ROLE_IDS = {
  ADMIN: import.meta.env.VITE_ROLE_ADMIN_ID,
  REGISTRAR: import.meta.env.VITE_ROLE_REGISTRAR_ID,
  COE: import.meta.env.VITE_ROLE_COE_ID,
  HOD: import.meta.env.VITE_ROLE_HOD_ID,
};