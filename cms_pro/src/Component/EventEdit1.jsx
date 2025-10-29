import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function EventEdit() {
  const { id: eventId } = useParams(); // Get ID from the URL: /events/edit/:id
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // --- 1. Fetch User Role and Event Data ---
  useEffect(() => {
    if (!userId) {
      alert("You must be logged in to view event details.");
      navigate("/login");
      return;
    }

    const fetchUserInfo = async () => {
      try {
        // Fetch user info to check admin role
        const res = await axios.get("http://localhost:5000/users/me", {
          headers: { "x-user-id": userId },
        });
        setIsAdmin(res.data.role === "admin");
      } catch (err) {
        console.error("Failed to fetch user role:", err);
        setIsAdmin(false);
      }
    };

    const fetchEventData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/events/${eventId}`);
        
        // Set date to today's date instead of existing event date
        const todayDate = new Date().toISOString().split('T')[0];

        setEventData({ ...res.data, date: todayDate });
      } catch (err) {
        alert("Error fetching event details. Maybe the event ID is invalid.");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserInfo();
    fetchEventData();
  }, [eventId, userId, navigate]);

  // --- 2. Change Handler ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- 3. Authorization and Save Logic ---
  const isOwner = eventData && String(eventData.postedBy) === String(userId);
  const isAuthorizedToSave = isOwner || isAdmin;

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!isAuthorizedToSave) {
      alert("❌ Unauthorized: You must be the event owner or an admin to save changes.");
      return;
    }
    
    if (!eventData.title || !eventData.date || !eventData.startTime || !eventData.venue) {
      alert("⚠️ Title, Date, Start Time and Venue are required.");
      return;
    }
    
    setLoading(true);

    try {
      await axios.put(
        `http://localhost:5000/events/${eventId}`,
        eventData, // Send updated data
        { headers: { "x-user-id": userId } } // Send userId for server-side authorization
      );
      setSuccessMessage("✅ Event updated successfully!");
      setTimeout(() => navigate("/dashboard"), 1500); // Redirect after success
    } catch (err) {
      console.error("Error updating event:", err);
      const errMsg = err.response?.data?.error || "❌ Failed to update event. Please check your network.";
      setSuccessMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- 4. Render Logic ---
  if (loading || eventData === null) return <p style={{ textAlign: "center", padding: "20px" }}>Loading event details...</p>;
  
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        
        <button onClick={() => navigate("/dashboard")} style={backButtonStyle}>Back</button>

        <h2 style={titleStyle}>Edit Event: {eventData.title}</h2>
        
        {successMessage && (
          <div style={{ ...messageStyle, background: successMessage.startsWith("✅") ? "#c8e6c9" : "#ffcdd2" }}>
            {successMessage}
          </div>
        )}

        {!isAuthorizedToSave && (
          <p style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}>
            🔒 Viewing as Read-Only. Only the owner or an Admin can save changes.
          </p>
        )}
        
        <form onSubmit={handleSave}>
          <div style={sectionStyle}>
            <p style={labelStyle}>Event Name</p>
            <input
              type="text"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              style={inputStyle}
              disabled={!isAuthorizedToSave}
            />

            <p style={labelStyle}>Description</p>
            <textarea
              name="description"
              value={eventData.description}
              onChange={handleChange}
              style={{ ...inputStyle, height: "80px", resize: "none" }}
              disabled={!isAuthorizedToSave}
            />
          </div>

          <div style={sectionStyle}>
            <div style={twoCol}>
              <div>
                <p style={labelStyle}>Date</p>
                <input
                  type="date"
                  name="date"
                  value={eventData.date}
                  onChange={handleChange}
                  style={inputStyle}
                  disabled={!isAuthorizedToSave}
                />
              </div>
              <div>
                <p style={labelStyle}>Category</p>
                <select
                  name="category"
                  value={eventData.category}
                  onChange={handleChange}
                  style={{ ...inputStyle, cursor: "pointer" }}
                  disabled={!isAuthorizedToSave}
                >
                  <option value="">Select Category</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Webinar">Webinar</option>
                  <option value="Competition">Competition</option>
                  <option value="Fest">Fest</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={twoCol}>
              <div>
                <p style={labelStyle}>Start Time</p>
                <input
                  type="time"
                  name="startTime"
                  value={eventData.startTime}
                  onChange={handleChange}
                  style={inputStyle}
                  disabled={!isAuthorizedToSave}
                />
              </div>
              <div>
                <p style={labelStyle}>End Time</p>
                <input
                  type="time"
                  name="endTime"
                  value={eventData.endTime}
                  onChange={handleChange}
                  style={inputStyle}
                  disabled={!isAuthorizedToSave}
                />
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <p style={labelStyle}>Venue</p>
            <input
              type="text"
              name="venue"
              value={eventData.venue}
              onChange={handleChange}
              style={inputStyle}
              disabled={!isAuthorizedToSave}
            />

            <div style={twoCol}>
              <div>
                <p style={labelStyle}>Organizer</p>
                <input
                  type="text"
                  name="organizer"
                  value={eventData.organizer}
                  onChange={handleChange}
                  style={inputStyle}
                  disabled={!isAuthorizedToSave}
                />
              </div>
              <div>
                <p style={labelStyle}>Contact Email</p>
                <input
                  type="email"
                  name="contact"
                  value={eventData.contact}
                  onChange={handleChange}
                  style={inputStyle}
                  disabled={!isAuthorizedToSave}
                />
              </div>
            </div>
          </div>
          
          {/* SAVE BUTTON - Disabled if not authorized */}
          <button
            type="submit"
            disabled={!isAuthorizedToSave || loading}
            style={{
              ...saveButtonStyle,
              background: (!isAuthorizedToSave || loading) ? "grey" : "#0288D1",
              cursor: (!isAuthorizedToSave || loading) ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Saving..." : (isAuthorizedToSave ? "Save Changes" : "Save (Admin/Owner Only)")}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- STYLES (Kept outside the component for cleaner code) ---
const containerStyle = {
  minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center",
  background: "linear-gradient(135deg, #87CEFA, #00BFFF)", fontFamily: "Arial, sans-serif",
  padding: "20px", boxSizing: "border-box",
};

const cardStyle = {
  background: "#E3F2FD", padding: "30px", borderRadius: "16px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.15)", width: "600px", maxWidth: "100%",
};

const titleStyle = {
  marginBottom: "20px", color: "#01579B", textAlign: "center",
};

const inputStyle = {
  width: "100%", padding: "10px", marginBottom: "12px", border: "1px solid #4FC3F7",
  borderRadius: "6px", background: "#ffffff", color: "#0277BD", fontSize: "14px",
};

const sectionStyle = {
  marginBottom: "20px", paddingBottom: "10px", borderBottom: "1px solid #bbdefb",
};

const labelStyle = {
  margin: "4px 0", color: "#01579B", fontSize: "13px", fontWeight: "bold",
};

const twoCol = {
  display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px",
};

const backButtonStyle = {
    background: "#0288D1", color: "white", padding: "10px 15px", 
    borderRadius: "5px", border: "none", cursor: "pointer", 
    width: "100px", marginBottom: "20px"
};

const saveButtonStyle = {
    width: "100%", padding: "14px", color: "white", fontSize: "16px",
    fontWeight: "bold", border: "none", borderRadius: "8px", 
    transition: "0.3s", marginTop: "10px"
};

const messageStyle = {
    color: "#256029", padding: "10px", borderRadius: "6px",
    marginBottom: "20px", fontSize: "14px", textAlign: "center",
};


export default EventEdit;