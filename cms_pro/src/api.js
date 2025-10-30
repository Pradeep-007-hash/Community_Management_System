import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://community-management-system-backend2.onrender.com"; // backend server

// Signup
export const signupUser = async (userData) => {
  return await axios.post(`${API_URL}/signup`, userData);
};

// Login
export const loginUser = async (credentials) => {
  return await axios.post(`${API_URL}/login`, credentials);
};

// Admin: Get all pending users
export const getUsers = async () => {
  return await axios.get(`${API_URL}/pending-users`);
};

// Admin: Approve
export const approveUser = async (id) => {
  return await axios.post(`${API_URL}/approve-user`, { id });
};

// Admin: Reject
export const rejectUser = async (id) => {
  return await axios.post(`${API_URL}/reject-user`, { id });
};

// Security: Add visitor entry
export const addVisitor = async (visitorData) => {
  const userId = localStorage.getItem("userId");
  return await axios.post(`${API_URL}/visitors`, visitorData, {
    headers: {
      "x-user-id": userId
    }
  });
};

// Security: Get visitor logs
export const getVisitors = async () => {
  return await axios.get(`${API_URL}/visitors`);
};

// Admin: Post announcement
export const postAnnouncement = async (announcementData) => {
  return await axios.post(`${API_URL}/announcements`, announcementData);
};

// Get all announcements
export const getAnnouncements = async () => {
  return await axios.get(`${API_URL}/announcements`);
};

// Admin: Delete announcement
export const deleteAnnouncement = async (id) => {
  const userId = localStorage.getItem("userId");
  return await axios.delete(`${API_URL}/announcements/${id}`, {
    headers: {
      "x-user-id": userId
    }
  });
};

// Security: Add delivery entry
export const addDelivery = async (deliveryData) => {
  const userId = localStorage.getItem("userId");
  return await axios.post(`${API_URL}/deliveries`, deliveryData, {
    headers: {
      "x-user-id": userId
    }
  });
};

// Security: Get delivery logs
export const getDeliveries = async () => {
  return await axios.get(`${API_URL}/deliveries`);
};

// Security: Update delivery status
export const updateDeliveryStatus = async (id, status) => {
  const userId = localStorage.getItem("userId");
  return await axios.put(`${API_URL}/deliveries/${id}/status`, { status }, {
    headers: {
      "x-user-id": userId
    }
  });
};

// Admin: Get stats for dashboard
export const getAdminStats = async () => {
  const userId = localStorage.getItem("userId");
  return await axios.get(`${API_URL}/admin/stats`, {
    headers: {
      "x-user-id": userId
    }
  });
};

// Admin: Delete lost and found item
export const deleteLostAndFound = async (id) => {
  const userId = localStorage.getItem("userId");
  return await axios.delete(`${API_URL}/lostandfound/${id}`, {
    headers: {
      "x-user-id": userId
    }
  });
};
