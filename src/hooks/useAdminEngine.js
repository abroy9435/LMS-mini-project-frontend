import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { apiFetch } from '../utils/apiAdapters';
import { API_URLS } from '../utils/constants';

export const useAdminEngine = () => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [holidays, setHolidays] = useState([]); // New Holiday State

  // Fetch all initial data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [deptsRes, rolesRes, leavesRes, usersRes, logsRes] = await Promise.all([
        apiFetch(API_URLS.admin.departments, { method: 'GET' }, getToken),
        apiFetch(API_URLS.admin.roles, { method: 'GET' }, getToken),
        apiFetch(API_URLS.admin.leaveTypes, { method: 'GET' }, getToken),
        apiFetch(API_URLS.admin.users, { method: 'GET' }, getToken),
        apiFetch(API_URLS.admin.auditLogs, { method: 'GET' }, getToken),
      ]);

      setDepartments(deptsRes.data || []);
      setRoles(rolesRes.data || []);
      setLeaveTypes(leavesRes.data || []);
      setUsers(usersRes.data || []);
      setAuditLogs(logsRes.data || []);
      
      // Try to fetch holidays if the route exists
      try {
        const holsRes = await apiFetch(API_URLS.admin.holidays, { method: 'GET' }, getToken);
        setHolidays(holsRes.data || []);
      } catch (e) {
        console.warn("Holiday fetch failed, route might not be public yet.", e);
      }

    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // --- ACTIONS ---
  const executeLeaveAllocation = async () => {
    try {
      const res = await apiFetch(API_URLS.admin.allocateLeaves, { method: 'POST' }, getToken);
      fetchDashboardData(); 
      return res;
    } catch (err) { throw new Error(err.message); }
  };

  const assignUserRole = async (userId, roleName) => {
    try {
      await apiFetch(API_URLS.admin.assignRole, {
        method: 'PUT',
        body: JSON.stringify({ user_id: userId, role_name: roleName })
      }, getToken);
    } catch (err) { throw new Error(err.message); }
  };

  const importHolidaysPDF = async (file) => {
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(API_URLS.admin.importHolidays, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to parse PDF");
      fetchDashboardData(); 
      return data;
    } catch (err) { throw new Error(err.message); }
  };

  // --- CRUD OPERATIONS ---
  const createDepartment = async (payload) => {
    try {
      await apiFetch(API_URLS.admin.departments, { method: 'POST', body: JSON.stringify(payload) }, getToken);
      fetchDashboardData();
    } catch (err) { throw new Error(err.message); }
  };

  const deleteItem = async (type, id) => {
    try {
      let url = '';
      if (type === 'department') url = `${API_URLS.admin.departments}/${id}`;
      if (type === 'role') url = `${API_URLS.admin.roles}/${id}`;
      if (type === 'leaveType') url = `${API_URLS.admin.leaveTypes}/${id}`;
      if (type === 'holiday') url = `${API_URLS.admin.holidays}/${id}`;
      
      await apiFetch(url, { method: 'DELETE' }, getToken);
      fetchDashboardData();
    } catch (err) { throw new Error(err.message); }
  }

  const createRole = async (payload) => {
    try {
      await apiFetch(API_URLS.admin.roles, {
        method: 'POST',
        body: JSON.stringify({ name: payload.name, hierarchy_level: parseInt(payload.hierarchy_level, 10) })
      }, getToken);
      fetchDashboardData();
    } catch (err) { throw new Error(err.message); }
  };

  const createLeaveType = async (payload) => {
    try {
      await apiFetch(API_URLS.admin.leaveTypes, {
        method: 'POST',
        body: JSON.stringify({
          name: payload.name,
          default_days: parseFloat(payload.default_days),
          requires_role_id: payload.requires_role_id,
          is_carry_forward: payload.is_carry_forward
        })
      }, getToken);
      fetchDashboardData();
    } catch (err) { throw new Error(err.message); }
  };

  const createHoliday = async (payload) => {
    try {
      await apiFetch(API_URLS.admin.holidays, {
        method: 'POST',
        body: JSON.stringify({
          name: payload.name,
          holiday_date: payload.holiday_date, 
          is_restricted: Boolean(payload.is_restricted)
        })
      }, getToken);
      fetchDashboardData();
    } catch (err) {
      throw new Error(err.message);
    }
  };

  return {
    loading, error, departments, roles, leaveTypes, users, auditLogs, holidays,
    fetchDashboardData, executeLeaveAllocation, assignUserRole, importHolidaysPDF,
    createDepartment, createRole, createLeaveType, deleteItem, createHoliday
  };
};