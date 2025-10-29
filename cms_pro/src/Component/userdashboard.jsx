import React, { useState, useEffect } from "react";
import EventView from "./viewevent"; // adjust path if needed
import EventPost from "./EventPost"
import LostAndFoundApp from "./LostAndFoundApp"; // Lost and Found import
import ViewLostItem from "./viewlostitem"; // View Lost and Found items
import ViewAnnouncements from "./ViewAnnouncements"; // View Announcements import
import PastEvents from "./PastEvents"; // Past Events import
import { useNavigate } from "react-router-dom";

const Notifications = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/notifications/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchNotifications();
  }, [userId]);

  if (loading) return <p>Loading notifications...</p>;

  return (
    <div>
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications available.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0,color:"black" }}>
          {notifications.map((notif) => (
            <li key={notif._id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: notif.isRead ? '#f9f9f9' : '#fff3cd' }}>
              <p>{notif.message}</p>
              <small>Type: {notif.type} | Created: {new Date(notif.createdAt).toLocaleString()}</small>
              {!notif.isRead && <button onClick={() => {/* Mark as read logic */}} style={{width:"150px"}}>Mark as Read</button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

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
      alert("⚠️ Please login first");
      navigate("/login");
      return;
    }
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/user/profile/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setUserProfile(data);
        setEditedProfile(data);  // Initialize edited profile
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
    {name:"Lost/Found",key:"lost"},
    { name: "View Lost Items", key: "viewlost" },
    { name: "Announcements", key: "announcements" },
    { name: "Notifications", key: "notifications" },
    { name: "Logout", key: "logout" }
  ];

  // Handle input changes for edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save edited profile to backend
  // Save edited profile to backend
const saveProfile = async () => {
  try {
    const userId = localStorage.getItem("userId");
    const res = await fetch(`http://localhost:5000/user/profile/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editedProfile),
    });

    // Important: Handle non-2xx status as error
    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || "Failed to update profile");
    }

    const updated = await res.json();
    const userData = updated.user || updated;

    // Update states and force re-render
    setUserProfile(userData);
    setEditedProfile(userData);
    setIsEditing(false);
    setPageView("viewprofile"); // Show the updated profile

    alert("Changes saved successfully");
  } catch (err) {
    console.error(err);
    alert("❌ Failed to update profile: " + (err.message || ""));
  }
};




  // Cancel editing and revert changes
  const cancelEditing = () => {
    setEditedProfile(userProfile);
    setIsEditing(false);
  };

  const renderProfile = () => {
    if (loading) return <p>Loading profile...</p>;
    if (!userProfile) return <p>⚠️ Could not load profile data.</p>;

    if (isEditing) {
      return (
        <>
          <div className="mainHeader">
            {/* <button className="logoutButton" onClick={handleLogout} title="Logout">
              Logout
            </button> */}
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
                { label: "Floor No", name: "floor_no" },
                { label: "Door No", name: "door_no" },
                { label: "Apartment", name: "apartment" },
                { label: "Family Details", name: "family_details" },
                { label: "Family Members", name: "family_members" },
                { label: "Communication", name: "communication" },
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

    // Default view mode:
    return (
      <>
        <div className="mainHeader">
          {/* <button className="logoutButton" onClick={handleLogout} title="Logout">
            Logout
          </button> */}
          <button onClick={() => setIsEditing(true)} style={{ marginLeft: "10px",width:"150px" }}>
            Edit Profile
          </button>
        </div>

        <h2 className="welcomeHeader">Welcome Back, {userProfile.firstname}</h2>
        <p className="welcomeSubtext">Here's a summary of your profile information.</p>

        <div className="profileCard">
          <h3>Profile Details</h3>
          <div className="detailsGrid">
            <div className="detailItem">
              <span className="detailLabel">ROLE</span>
              <span className="detailValue">{userProfile.role || 'N/A'}</span>
            </div>
            <div className="detailItem">
              <span className="detailLabel">FIRST NAME</span>
              <span className="detailValue">{userProfile.firstname || 'N/A'}</span>
            </div>
            <div className="detailItem">
              <span className="detailLabel">LAST NAME</span>
              <span className="detailValue">{userProfile.lastname || 'N/A'}</span>
            </div>
            <div className="detailItem">
              <span className="detailLabel">USERNAME</span>
              <span className="detailValue">{userProfile.username || 'N/A'}</span>
            </div>
            <div className="detailItem">
              <span className="detailLabel">EMAIL</span>
              <span className="detailValue">{userProfile.email || 'N/A'}</span>
            </div>
            <div className="detailItem">
              <span className="detailLabel">PHONE</span>
              <span className="detailValue">{userProfile.phone || 'N/A'}</span>
            </div>
            {(userProfile.role === 'member' || !userProfile.role) && (
              <>
                <div className="detailItem">
                  <span className="detailLabel">FLOOR NO</span>
                  <span className="detailValue">{userProfile.floor_no || 'N/A'}</span>
                </div>
                <div className="detailItem">
                  <span className="detailLabel">DOOR NO</span>
                  <span className="detailValue">{userProfile.door_no || 'N/A'}</span>
                </div>
                <div className="detailItem">
                  <span className="detailLabel">APARTMENT</span>
                  <span className="detailValue">{userProfile.apartment || 'N/A'}</span>
                </div>
                <div className="detailItem">
                  <span className="detailLabel">FAMILY DETAILS</span>
                  <span className="detailValue">{userProfile.family_details || 'N/A'}</span>
                </div>
                <div className="detailItem">
                  <span className="detailLabel">FAMILY MEMBERS</span>
                  <span className="detailValue">{Array.isArray(userProfile.family_members) ? userProfile.family_members.map(m => m.name).join(', ') : 'N/A'}</span>
                </div>
                <div className="detailItem">
                  <span className="detailLabel">COMMUNICATION</span>
                  <span className="detailValue">{userProfile.communication || 'N/A'}</span>
                </div>
              </>
            )}
          </div>  
          {userProfile.role === 'member' && Array.isArray(userProfile.family_members) && userProfile.family_members.length > 0 && (
            <div style={{ marginTop: '20px',color:'black' }}>
              <h4>Family Members</h4>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {userProfile.family_members.map((member, index) => (
                  <li key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', color: 'black' }}>
                    <strong>{member?.name || 'N/A'}</strong> - Age: {member?.age || 'N/A'}, Gender: {member?.gender || 'N/A'}, Occupation: {member?.occupation || 'N/A'}
                    {member?.occupation === 'student' && member?.student_school && (
                      <> - {member.student_school === 'school' ? `School: ${member?.student_school_name || 'N/A'}` : `College: ${member?.student_college_name || 'N/A'}`}</>
                    )}
                    {member?.occupation === 'working' && member?.office_name && (
                      <> - Office: {member.office_name}</>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {userProfile.photo && (
            <div style={{ marginTop: '20px' }}>
              <h4>Profile Photo</h4>
              <img src={`data:image/png;base64,${userProfile.photo}`} alt="Profile" style={{ maxWidth: '200px', maxHeight: '200px' }} />
            </div>
          )}
        </div>
      </>
    );
  };

 const renderMainContent = () => {
    switch (pageView) {
      case "userevent":
        return <EventPost />;
      case "lost":
        return <LostAndFoundApp />;
      case "viewlost":
        return <ViewLostItem />;
      case "announcements":
        return <ViewAnnouncements />;
      case "pastEvents":
        return <PastEvents />;
      case "notifications":
        return <Notifications userId={localStorage.getItem("userId")} />;
      case "logout":
        handleLogout();
        return null; // important to avoid rendering anything
      case "viewprofile":
        return renderProfile();
      case "viewevent":
      default:
        return <EventView />;
    }
  };


  return (
    <>
      <style>{`
      html, body, #root {
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
        .portalContainer {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          background-color: #f7f7f9;
        }
        .sidebar {
          width: 20vw;
          min-width: 200px;
          max-width: 280px;
          background-color: #3b5998;
          color: white;
          padding: 20px 0;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
          height: 100vh;
        }
        .logo {
          font-size: 1.5rem;
          padding: 0 20px 20px 20px;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .navItem {
          padding: 15px 20px;
          cursor: pointer;
          transition: background-color 0.2s;
          font-weight: 500;
        }
        .navItem:hover {
          background-color: #2e4475;
        }
        .active {
          background-color: white;
          color: #3b5998;
          font-weight: bold;
          border-left: 4px solid #f29c1d;
        }
        .mainContent {
          flex: 1;
          padding: 30px;
          width: 80vw;
          height: 100vh;
          overflow-y: auto;
        }

        .mainHeader {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 30px;
        }
        .logoutButton {
          background-color: #e55353;
          color: white;
          padding: 5px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.9rem;
          transition: background-color 0.2s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .logoutButton:hover {
          background-color: #cc4949;
        }
        .welcomeHeader {
          font-size: 2.5rem;
          font-weight: 800;
          color: #333;
          margin-bottom: 5px;
        }
        .welcomeSubtext {
          color: #666;
          margin-bottom: 30px;
        }
        .profileCard {
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .profileCard h3 {
          font-size: 1.3rem;
          color: #333;
          margin-bottom: 20px;
        }
        .detailsGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px 50px;
        }
        .detailLabel {
          display: block;
          font-size: 0.75rem;
          color: #999;
          font-weight: 600;
          margin-bottom: 4px;
          letter-spacing: 0.5px;
        }
        .detailValue {
          display: block;
          font-size: 1.1rem;
          color: #333;
          font-weight: 500;
        }
        .detailInput {
          width: 100%;
          padding: 8px;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        button {
          padding: 8px 15px;
          font-size: 1rem;
          cursor: pointer;
          border-radius: 4px;
          border: none;
          background-color: #3b5998;
          color: white;
          font-weight: 600;
          transition: background-color 0.3s ease;
        }
        button:hover {
          background-color: #2e4475;
        }
      `}</style>

      <div className="portalContainer">
        <div className="sidebar">
          <h1 className="logo">My Portal</h1>
          <nav className="navList">
            {navItems.map((item) => (
              <div
                key={item.key}
                className={`navItem ${pageView === item.key ? "active" : ""}`}
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
