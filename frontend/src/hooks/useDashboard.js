import { useState, useEffect, useCallback, useRef } from 'react';
import { getDashboard, getSurge, getRiskSummary, getTransactions, getHealth } from '../services/api';

/**
 * Custom Hook for live Dashboard data fetching, health monitoring, and auto-refresh.
 * @param {number} autoRefreshSeconds - Interval in seconds for auto-refreshing read-only data (default: 15s)
 */
export function useDashboard(autoRefreshSeconds = 15) {
  const [dashboardData, setDashboardData] = useState(null);
  const [surgeData, setSurgeData] = useState(null);
  const [riskSummaryData, setRiskSummaryData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [healthData, setHealthData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);

  const isMountedRef = useRef(true);

  const fetchAllData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    }

    try {
      // Parallel fetch of read-only GET endpoints
      const [healthRes, dashRes, surgeRes, riskRes, txRes] = await Promise.allSettled([
        getHealth(),
        getDashboard(),
        getSurge(),
        getRiskSummary(),
        getTransactions(0, 20),
      ]);

      if (!isMountedRef.current) return;

      // Check critical errors
      if (dashRes.status === 'rejected' && healthRes.status === 'rejected') {
        throw dashRes.reason || healthRes.reason || new Error('Failed to fetch dashboard data');
      }

      if (healthRes.status === 'fulfilled') setHealthData(healthRes.value);
      if (dashRes.status === 'fulfilled') setDashboardData(dashRes.value);
      if (surgeRes.status === 'fulfilled') setSurgeData(surgeRes.value);
      if (riskRes.status === 'fulfilled') setRiskSummaryData(riskRes.value);
      if (txRes.status === 'fulfilled') setRecentTransactions(txRes.value);

      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Unable to connect to SurgeShield AI backend.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    isMountedRef.current = true;
    fetchAllData();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchAllData]);

  // Periodic Auto-refresh
  useEffect(() => {
    if (!isAutoRefreshEnabled || autoRefreshSeconds <= 0) return;

    const intervalId = setInterval(() => {
      fetchAllData(false);
    }, autoRefreshSeconds * 1000);

    return () => clearInterval(intervalId);
  }, [fetchAllData, isAutoRefreshEnabled, autoRefreshSeconds]);

  const toggleAutoRefresh = () => {
    setIsAutoRefreshEnabled((prev) => !prev);
  };

  return {
    dashboardData,
    surgeData,
    riskSummaryData,
    recentTransactions,
    healthData,
    loading,
    refreshing,
    error,
    lastUpdated,
    isAutoRefreshEnabled,
    toggleAutoRefresh,
    refresh: () => fetchAllData(true),
  };
}

export default useDashboard;
