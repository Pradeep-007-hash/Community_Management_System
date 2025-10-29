// src/Component/memapprove.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./AuthContext";

function Memview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/users", {
        headers: { "x-user-id": user.id }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/admin/approve/${userId}`, {}, {
        headers: { "x-user-id": user.id }
      });
      fetchUsers();
    } catch (err) {
      console.error("Error approving user:", err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/admin/reject/${userId}`, {
        headers: { "x-user-id": user.id }
      });
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.firstname?.toLowerCase().includes(term) ||
      user.lastname?.toLowerCase().includes(term) ||
      user.floor_no?.toString().toLowerCase().includes(term) ||
      user.door_no?.toString().toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.phone?.toLowerCase().includes(term) ||
      user.role?.toLowerCase().includes(term)
    );
  });

  const displayUsers = filteredUsers.filter((user) => user.role !== "admin");

  return (
    <div style={{ color: "black" }}>
      {/* Fixed Header */}
<div
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    backgroundColor: "#f5f5f5",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    zIndex: 1000,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  }}
>
  {/* Back Button on the left */}
  <div style={{ flex: "1" }}>
    <button
      onClick={() => navigate(-1)}
      style={{
        background: "blue",
        color: "white",
        padding: "10px 15px",
        borderRadius: "5px",
        border: "none",
        cursor: "pointer",
        width: "100px",
      }}
    >
      Back
    </button>
  </div>

  {/* All Members Title centered */}
  <div style={{ flex: "1", textAlign: "center" }}>
    <h1 style={{ margin: 0 }}>All Members</h1>
  </div>

  {/* Search Box on the right */}
  <div style={{ flex: "1", textAlign: "right" }}>
    <input
      type="text"
      placeholder="Search by name, floor, door, email, phone, etc."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      style={{
        padding: "10px",
        width: "250px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        fontSize: "16px",
        outline: "none",
        color: "black",
        background: "white",
        boxSizing: "border-box",
        marginRight: "50px",
        
       }}
        />
       </div>
      </div>

{/* Spacer to avoid content going under fixed header */}
<div style={{ height: "100px" }}></div>


      {/* Users Grid or No User Message */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
        }}
      >
        {displayUsers.length === 0 ? (
          <h2
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              fontSize: "40px",
              color: "red",
            }}
          >
            No user found
          </h2>
        ) : (
          displayUsers.map((user) => (
            <div
              key={user._id}
              style={{
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "15px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "10px" }}>
                {user.image ? (
                  <img
                    src={`data:image/jpeg;base64,${user.image}`}
                    alt="profile"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "#ddd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    {user.firstname?.[0] || "U"}
                  </div>
                )}
              </div>

              <h3 style={{ textAlign: "center", margin: "10px 0" }}>
                {user.firstname} {user.lastname}
              </h3>
              <p>
                <b>Email:</b> {user.email}
              </p>
              <p>
                <b>Phone:</b> {user.phone}
              </p>
              <p>
                <b>Floor No:</b> {user.floor_no}
              </p>
              <p>
                <b>Door No:</b> {user.door_no}
              </p>
              <p>
                <b>Status:</b>{" "}
                <span
                  style={{
                    color:
                      user.status === "APPROVED"
                        ? "green"
                        : user.status === "PENDING"
                        ? "orange"
                        : "red",
                    fontWeight: "bold",
                  }}
                >
                  {user.status}
                </span>
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginTop: "15px",
                }}
              >
                <button
                  onClick={() => navigate(`/user/${user._id}`)}
                  style={{
                    background: "#007bff",
                    color: "white",
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  View
                </button>

                {user.status !== "APPROVED" && (
                  <button
                    onClick={() => handleApprove(user._id)}
                    style={{
                      background: "green",
                      color: "white",
                      padding: "8px 12px",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Approve
                  </button>
                )}

                <button
                  onClick={() => handleDelete(user._id)}
                  style={{
                    background: "red",
                    color: "white",
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Memview;
