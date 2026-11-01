import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/utils.js";

export const useVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState({
    totalVendors: 0,
    activeVendors: 0,
    pendingApprovals: 0,
    suspendedVendors: 0,
    averageCommission: 12.5,
    verticalBreakdown: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchVendors = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/vendors`, {
        params,
        withCredentials: true,
      });

      const list = res.data?.data || res.data?.vendors || [];
      setVendors(list);
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
      return list;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch vendors";
      setError(msg);
      setVendors([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVendorStatus = useCallback(async (id, payload) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/api/admin/vendors/${id}/status`, payload, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to update vendor status");
    }
  }, []);

  const updateVendorCommission = useCallback(async (id, adminCommission) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/api/admin/vendors/${id}/commission`, { adminCommission }, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to update vendor commission");
    }
  }, []);

  const updateVendorProfile = useCallback(async (id, payload) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/api/admin/vendors/${id}`, payload, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to update vendor profile");
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return {
    vendors,
    stats,
    loading,
    error,
    fetchVendors,
    updateVendorStatus,
    updateVendorCommission,
    updateVendorProfile,
    refetch: fetchVendors,
  };
};

