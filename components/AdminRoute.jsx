import React, { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api";
import Admin from './Admin';

const AdminRoute = () => {
  const [isValidAdmin, setIsValidAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const localIsAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    const validateAdmin = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/admin-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsValidAdmin(res.data.isAdmin);
      } catch (err) {
        console.error('Admin validation failed:', err);
        setIsValidAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    validateAdmin();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (token && isValidAdmin) ? <Admin /> : <Navigate to="/login" replace />;
};

export default AdminRoute;
