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
    // Helper function for dynamic URL parameters
    updateStatus: (leaveId) => `${API_BASE_URL}/api/v1/leaves/${leaveId}/status`,
  },

  // Leave Balances
  balance: {
    myBalances: `${API_BASE_URL}/api/v1/balances/me`,
  },

  // Administrator Routes
  admin: {
    allocateLeaves: `${API_BASE_URL}/api/v1/admin/allocate-leaves`,
    assignRole: `${API_BASE_URL}/api/v1/admin/assign-role`,
  }
};

export const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  APPROVER: 'APPROVER',
  ADMIN: 'ADMIN',
};