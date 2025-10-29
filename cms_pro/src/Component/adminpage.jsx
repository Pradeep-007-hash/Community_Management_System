import React from "react";
import { useNavigate } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    localStorage.removeItem("token");
    sessionStorage.clear();
    alert("You have logged out successfully!");
    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#e0f7fa", // light sky blue background
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#004d40", // dark teal text
        width:"1525px"
      }}
    >
      {/* Header */}
      <div style={{ width: "100%", maxWidth: "1200px", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleLogout}
          style={{
            background: "#00bcd4",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
            transition: "0.3s",
            width: "100px",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#0097a7")}
          onMouseLeave={(e) => (e.target.style.background = "#00bcd4")}
        >
          Logout
        </button>
      </div>

      {/* Welcome Text */}
      <h1 style={{ margin: "40px 0 60px", textAlign: "center", fontSize: "36px",width:"1000px" }}>
        Welcome! Admin Dashboard
      </h1>

      {/* Dashboard Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
          gap: "40px",
          width: "2050px",
          maxWidth: "1000px",
        }}
      >
        {/* View Members */}
        <div
          onClick={() => navigate("/memapprove")}
          style={{
            backgroundColor: "#00bcd4",
            color: "white",
            padding: "30px 20px",
            borderRadius: "15px",
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
            transition: "0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0097a7";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#00bcd4";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>View Members</h2>
        </div>

        {/* Post Events */}
        <div
          onClick={() => navigate("/events")}
          style={{
            backgroundColor: "#00bcd4",
            color: "white",
            padding: "30px 20px",
            borderRadius: "15px",
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
            transition: "0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0097a7";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#00bcd4";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>Post Events</h2>
        </div>

        {/* View Event*/}
         <div
          onClick={() => navigate("/viewevents")}
          style={{
            backgroundColor: "#00bcd4",
            color: "white",
            padding: "30px 20px",
            borderRadius: "15px",
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
            transition: "0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0097a7";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#00bcd4";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>View Events</h2>
        </div>

        {/* Post Announcement */}
        <div
          onClick={() => navigate("/post-announcement")}
          style={{
            backgroundColor: "#00bcd4",
            color: "white",
            padding: "30px 20px",
            borderRadius: "15px",
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
            transition: "0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0097a7";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#00bcd4";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>Post Announcement</h2>
        </div>

        {/* View Dashboard */}
        <div
          onClick={() => navigate("/admin-dashboard")}
          style={{
            backgroundColor: "#00bcd4",
            color: "white",
            padding: "30px 20px",
            borderRadius: "15px",
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
            transition: "0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0097a7";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#00bcd4";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>View Dashboard</h2>
        </div>

        {/* View Lost and Found Items */}
        <div
          onClick={() => navigate("/viewlostitems")}
          style={{
            backgroundColor: "#00bcd4",
            color: "white",
            padding: "30px 20px",
            borderRadius: "15px",
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
            transition: "0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0097a7";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#00bcd4";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>View Lost and Found</h2>
        </div>

        {/* View Profile */}
        <div
          onClick={() => navigate("/viewprofile")}
          style={{
            backgroundColor: "#00bcd4",
            color: "white",
            padding: "30px 20px",
            borderRadius: "15px",
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
            transition: "0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0097a7";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#00bcd4";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>View Profile</h2>
        </div>

        {/* View Past Events */}
        <div
          onClick={() => navigate("/past-events")}
          style={{
            backgroundColor: "#00bcd4",
            color: "white",
            padding: "30px 20px",
            borderRadius: "15px",
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
            transition: "0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0097a7";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#00bcd4";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>View Past Events</h2>
        </div>
      </div>
    </div>
  );
}

export default Admin;
