// src/Component/userdetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/admin/user/${id}`);
      setUser(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch user details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading user details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "blue",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
          marginBottom: "20px",
          width: "100px",
        }}
      >
        Back
      </button>

      <h1>User Details</h1>

      <div
        style={{
          background: "white",
          color: "black",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          maxWidth: "600px",
        }}
      >
        {user.image && (
          <img
            src={`data:image/jpeg;base64,${user.image}`}
            alt="profile"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              marginBottom: "20px",
            }}
          />
        )}
        <p><b>Name:</b> {user.firstname} {user.lastname}</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Phone:</b> {user.phone}</p>
        <p><b>Username:</b> {user.username}</p>
        <p><b>Door No:</b> {user.door_no}</p>
        <p><b>Floor:</b> {user.floor_no}</p>
        <p><b>Apartment:</b> {user.apartment}</p>
        <p><b>Community:</b> {user.community}</p>
        <p><b>Role:</b> {user.role}</p>
        <p><b>Status:</b> {user.status}</p>

        {user.family_members && user.family_members.length > 0 && (
          <>
            <h3>Family Members:</h3>
            <ul>
              {user.family_members.map((fm, i) => (
                <li key={i}>
                  {fm.name}, {fm.age}, {fm.gender}
                  {fm.occupation && `, ${fm.occupation}`}
                  {fm.student_school_name && ` (School: ${fm.student_school_name})`}
                  {fm.student_college_name && ` (College: ${fm.student_college_name})`}
                  {fm.office_name && ` (Office: ${fm.office_name})`}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default UserDetail;
