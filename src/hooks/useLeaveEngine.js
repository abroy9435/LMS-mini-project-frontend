import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { apiFetch } from '../utils/apiAdapters';
import { API_URLS } from '../utils/constants';

export const useLeaveEngine = () => {
  const { getToken } = useAuth();
  
  // Shared state for the engine
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Data state (optional: you can also fetch these directly in components using useEffect, 
  // but keeping them here allows the engine to hold the state)
  const [myLeaves, setMyLeaves] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);

  // Helper to reset error state
  const clearError = useCallback(() => setError(null), []);

  /**
   * Submit a new leave request
   * @param {Object} leaveData - { leave_type_id, start_date, end_date, reason }
   */
  const submitLeaveRequest = async (leaveData) => {
    setIsLoading(true);
    clearError();
    try {
      const response = await apiFetch(
        API_URLS.leave.apply, 
        {
          method: 'POST',
          body: JSON.stringify(leaveData)
        }, 
        getToken
      );
      
      // Optionally refresh the leaves list immediately after success
      await fetchMyLeaves();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };


/**
   * Fetch the current user's leave history
   */
const fetchMyLeaves = useCallback(async () => {
  setIsLoading(true);
  clearError();
  try {
    const data = await apiFetch(
      API_URLS.leave.myLeaves, 
      { method: 'GET' }, 
      getToken
    );
    
    // SAFELY UNWRAP THE ARRAY
    const leavesArray = data.leaves || data.data || data;
    setMyLeaves(Array.isArray(leavesArray) ? leavesArray : []);
    
    return data;
  } catch (err) {
    setError(err.message);
    throw err;
  } finally {
    setIsLoading(false);
  }
}, [getToken, clearError]);

/**
 * Fetch the current user's leave balances
 */
const fetchMyBalances = useCallback(async () => {
  setIsLoading(true);
  clearError();
  try {
    const data = await apiFetch(
      API_URLS.balance.myBalances, 
      { method: 'GET' }, 
      getToken
    );
    
    // SAFELY UNWRAP THE ARRAY
    const balancesArray = data.balances || data.data || data;
    setLeaveBalances(Array.isArray(balancesArray) ? balancesArray : []);
    
    return data;
  } catch (err) {
    setError(err.message);
    throw err;
  } finally {
    setIsLoading(false);
  }
}, [getToken, clearError]);

  /**
   * [APPROVER/ADMIN ONLY] Fetch all pending leaves
   */
  const fetchPendingLeaves = useCallback(async () => {
    setIsLoading(true);
    clearError();
    try {
      const data = await apiFetch(
        API_URLS.leave.pending, 
        { method: 'GET' }, 
        getToken
      );
      setPendingLeaves(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  /**
   * [APPROVER/ADMIN ONLY] Approve or Reject a leave
   * @param {string} leaveId - The UUID of the leave request
   * @param {string} status - "APPROVED" or "REJECTED"
   * @param {string} remarks - Optional comments from the approver
   */
  const updateLeaveStatus = async (leaveId, status, remarks = "") => {
    setIsLoading(true);
    clearError();
    try {
      const response = await apiFetch(
        API_URLS.leave.updateStatus(leaveId), 
        {
          method: 'PUT',
          body: JSON.stringify({ status, approver_remarks: remarks })
        }, 
        getToken
      );
      
      // Remove the processed leave from the pending list
      setPendingLeaves(prev => prev.filter(leave => leave.id !== leaveId));
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch available leave types (Casual, Sick, etc.)
   */
  const fetchLeaveTypes = useCallback(async () => {
    try {
      return await apiFetch(
        API_URLS.leave.types, 
        { method: 'GET' }, 
        getToken
      );
    } catch (err) {
      console.error("Failed to fetch leave types:", err);
      throw err;
    }
  }, [getToken]);

  // Expose everything the UI needs
  return {
    // State
    isLoading,
    error,
    myLeaves,
    leaveBalances,
    pendingLeaves,
    
    // Actions
    clearError,
    submitLeaveRequest,
    fetchMyLeaves,
    fetchMyBalances,
    fetchPendingLeaves,
    updateLeaveStatus,
    fetchLeaveTypes
  };
};