// updated Userdashboard.jsx


// userdashboard.jsx (Imports)

import React, { useState, useEffect } from "react";
import EventView from "./viewevent"; // adjust path if needed
import EventPostUser from "./userevent";
import { useNavigate } from "react-router-dom";
import LostAndFoundApp from "./LostAndFoundApp"; // Add Lost & Found component

const handleLogout = () => {
  localStorage.removeItem("userId");
  alert("Logged out successfully! Redirecting to login...");
  window.location.href = "/login";
};

const UserDashboard = () => {
  const [pageView, setPageView] = useState("viewevent");
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const navigate = useNavigate();

  // Fetch user profile
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("⚠ Please login first");
      navigate("/login");
      return;
    }
    const fetchProfile = async () => {
      try {
        const res = await fetch(http://localhost:5000/user/profile/${userId});
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setUserProfile(data);
        setEditedProfile(data);
      } catch (err) {
        console.error("❌ Error fetching user profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const navItems = [
    { name: "View Events", key: "viewevent" },
    { name: "View Profile", key: "viewprofile" },
    { name: "Past Events", key: "pastEvents" },
    { name: "Add Event", key: "userevent" },
    { name: "Lost/Found", key: "lost" }, // NEW: Lost & Found
    { name: "Logout", key: "logout" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await fetch(http://localhost:5000/user/profile/${userId}, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedProfile),
      });
      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg || "Failed to update profile");
      }
      const updated = await res.json();
      const userData = updated.user || updated;
      setUserProfile(userData);
      setEditedProfile(userData);
      setIsEditing(false);
      setPageView("viewprofile");
      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update profile: " + (err.message || ""));
    }
  };

  const cancelEditing = () => {
    setEditedProfile(userProfile);
    setIsEditing(false);
  };

  const renderProfile = () => {
    if (loading) return <p>Loading profile...</p>;
    if (!userProfile) return <p>⚠ Could not load profile data.</p>;

    if (isEditing) {
      return (
        <>
          <div className="mainHeader">
            <button className="logoutButton" onClick={handleLogout} title="Logout">
              Logout
            </button>
          </div>

          <h2 className="welcomeHeader">Edit Profile</h2>
          <p className="welcomeSubtext">Update your profile information below.</p>

          <div className="profileCard">
            <h3>Profile Details</h3>
            <div className="detailsGrid">
              {[
                { label: "First Name", name: "firstname" },
                { label: "Last Name", name: "lastname" },
                { label: "Username", name: "username", disabled: true },
                { label: "Email", name: "email" },
                { label: "Phone", name: "phone" },
                { label: "Door No", name: "door_no" },
                { label: "Floor No", name: "floor_no" },
              ].map(({ label, name, disabled }) => (
                <div className="detailItem" key={name}>
                  <label className="detailLabel" htmlFor={name}>
                    {label.toUpperCase()}
                  </label>
                  <input
                    id={name}
                    name={name}
                    type="text"
                    value={editedProfile[name] || ""}
                    onChange={handleInputChange}
                    disabled={disabled}
                    className="detailInput"
                  />
                </div>
              ))}
            </div>
            <div style={{ marginTop: "20px" }}>
              <button onClick={saveProfile} style={{ marginRight: "10px" }}>
                Save Changes
              </button>
              <button onClick={cancelEditing}>Cancel</button>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="mainHeader">
          <div style={{ background: "#f0f0f0", padding: "10px", color: "black" }}>
            <marquee behavior="scroll" direction="left">
              🔔 Welcome to the Dashboard! Stay tuned for updates.
            </marquee>
          </div>
          <button onClick={() => setIsEditing(true)} style={{ marginLeft: "10px" }}>
            Edit Profile
          </button>
        </div>

        <h2 className="welcomeHeader">Welcome Back, {userProfile.firstname}</h2>
        <p className="welcomeSubtext">Here's a summary of your profile information.</p>

        <div className="profileCard">
          <h3>Profile Details</h3>
          <div className="detailsGrid">
            <div className="detailItem">
              <span className="detailLabel">FIRST NAME</span>
              <span className="detailValue">{userProfile.firstname}</span>
            </div>
            <div className="detailItem">
              <span className="detailLabel">LAST NAME</span>
              <span className="detailValue">{userProfile.lastname}</span>
            </div>
            <div className="detailItem">
              <span className="detailLabel">USERNAME</span>
              <span className="detailValue">{userProfile.username}</span>
            </div>
            <div className="detailItem">
              <span className="detailLabel">EMAIL</span>
              <span className="detailValue">{userProfile.email}</span>
            </div>
            <div className="detailItem">
              <span className="detailLabel">PHONE</span>
              <span className="detailValue">{userProfile.phone}</span>
            </div>
            <div className="detailItem">
              <span className="detailLabel">DOOR NO</span>
              <span className="detailValue">{userProfile.door_no}</span>
            </div>
            <div className="detailItem">
              <span className="detailLabel">FLOOR NO</span>
              <span className="detailValue">{userProfile.floor_no}</span>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderMainContent = () => {
    switch (pageView) {
      case "userevent":
        return <EventPostUser />;
      case "logout":
        handleLogout();
        return null;
      case "viewprofile":
        return renderProfile();
      case "lost": // NEW: Lost & Found
        return <LostAndFoundApp />;
      case "viewevent":
      default:
        return <EventView />;
    }
  };

  return (
    <>
      <style>{`
        html, body, #root { width:100vw; height:100vh; margin:0; padding:0; box-sizing:border-box; }
        .portalContainer { display:flex; min-height:100vh; width:100vw; background-color:#f7f7f9; }
        .sidebar { width:20vw; min-width:200px; max-width:280px; background-color:#3b5998; color:white; padding:20px 0; box-shadow:2px 0 5px rgba(0,0,0,0.1); height:100vh; }
        .logo { font-size:1.5rem; padding:0 20px 20px 20px; margin-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.1); }
        .navItem { padding:15px 20px; cursor:pointer; transition:background-color 0.2s; font-weight:500; }
        .navItem:hover { background-color:#2e4475; }
        .active { background-color:white; color:#3b5998; font-weight:bold; border-left:4px solid #f29c1d; }
        .mainContent { flex:1; padding:30px; width:80vw; height:100vh; overflow-y:auto; }
        .mainHeader { display:flex; justify-content:flex-end; margin-bottom:30px; }
        .logoutButton { background-color:#e55353; color:white; padding:5px 10px; border:none; border-radius:4px; cursor:pointer; font-weight:500; font-size:0.9rem; transition: background-color 0.2s; box-shadow:0 2px 4px rgba(0,0,0,0.1); }
        .logoutButton:hover { background-color:#cc4949; }
        .welcomeHeader { font-size:2.5rem; font-weight:800; color:#333; margin-bottom:5px; }
        .welcomeSubtext { color:#666; margin-bottom:30px; }
        .profileCard { background-color:white; padding:30px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.05); }
        .profileCard h3 { font-size:1.3rem; color:#333; margin-bottom:20px; }
        .detailsGrid { display:grid; grid-template-columns:1fr 1fr; gap:30px 50px; }
        .detailLabel { display:block; font-size:0.75rem; color:#999; font-weight:600; margin-bottom:4px; letter-spacing:0.5px; }
        .detailValue { display:block; font-size:1.1rem; color:#333; font-weight:500; }
        .detailInput { width:100%; padding:8px; font-size:1rem; border:1px solid #ccc; border-radius:4px; }
        button { padding:8px 15px; font-size:1rem; cursor:pointer; border-radius:4px; border:none; background-color:#3b5998; color:white; font-weight:600; transition:background-color 0.3s ease; }
        button:hover { background-color:#2e4475; }
      `}</style>

      <div className="portalContainer">
        <div className="sidebar">
          <h1 className="logo">My Portal</h1>
          <nav className="navList">
            {navItems.map((item) => (
              <div
                key={item.key}
                className={navItem ${pageView === item.key ? "active" : ""}}
                onClick={() => setPageView(item.key)}
              >
                {item.name}
              </div>
            ))}
          </nav>
        </div>

        <div className="mainContent">{renderMainContent()}</div>
      </div>
    </>
  );
};

export default UserDashboard;