import React, { useState, useEffect } from "react";
import { getAnnouncements, deleteAnnouncement } from "../api";

function ViewAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem("role");
    setUserRole(role);

    const fetchAnnouncements = async () => {
      try {
        const response = await getAnnouncements();
        setAnnouncements(response.data);
      } catch (err) {
        console.error("Error fetching announcements:", err);
        setError("Failed to load announcements.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    setDeleteLoading(id);
    try {
      await deleteAnnouncement(id);
      setAnnouncements(announcements.filter(announcement => announcement._id !== id));
    } catch (err) {
      console.error("Error deleting announcement:", err);
      alert("Failed to delete announcement. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Loading announcements...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", textAlign: "center", color: "red" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Announcements</h2>
      {announcements.length === 0 ? (
        <p>No announcements available.</p>
      ) : (
        <div>
          {announcements.map((announcement) => (
            <div
              key={announcement._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <h3 style={{ margin: "0", color: "#333" }}>{announcement.title}</h3>
                {userRole === "admin" && (
                  <button
                    onClick={() => handleDelete(announcement._id)}
                    disabled={deleteLoading === announcement._id}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: deleteLoading === announcement._id ? "#ccc" : "#dc3545",
                      width: '70px',
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: deleteLoading === announcement._id ? "not-allowed" : "pointer",
                      fontSize: "12px",
                    }}
                  >
                    {deleteLoading === announcement._id ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
              <p style={{ margin: "0 0 10px 0", color: "#666" }}>{announcement.content}</p>
              <small style={{ color: "#999" }}>
                Posted on: {new Date(announcement.createdAt).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ViewAnnouncements;
