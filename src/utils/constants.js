export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const ENDPOINTS = {
  ME: '/me',
  PROFILE: '/profile',
  LEAVES: '/leaves',
  PENDING_LEAVES: '/leaves/pending',
  BALANCES: '/balances/me',
};

export const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  APPROVER: 'APPROVER',
  ADMIN: 'ADMIN',
};