// src/Component/EventPost.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Add useNavigate for Back button

function EventPost() {
  const navigate = useNavigate();
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "",
    endTime: "",
    venue: "",
    organizer: "",
    contact: "",
    category: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null); // State to hold the user ID

  useEffect(() => {
    // Retrieve the user ID from local storage once the component loads
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
        setCurrentUserId(storedUserId);
    } else {
        // Optional: Redirect if not logged in
        // navigate("/login");
        console.error("User ID not found in local storage.");
    }
  }, []);

  const addEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.venue) {
      alert("⚠️ Title, Date, Start Time and Venue are required");
      return;
    }
    
    if (!currentUserId) {
        alert("❌ Cannot post event. User is not logged in or User ID is missing.");
        return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/events", newEvent, {
        // FIX: Using the correct header expected by the server
        headers: { "x-user-id": currentUserId }, 
      });
      setSuccessMessage("✅ Event posted successfully! Returning to dashboard...");
      setNewEvent({ /* reset form */
        title: "", description: "", date: new Date().toISOString().split('T')[0], startTime: "",
        endTime: "", venue: "", organizer: "", contact: "", category: "",
      });
      
      // Navigate after a short delay to let the user see the success message
      setTimeout(() => navigate("/dashboard"), 1500);

    } catch (err) {
      console.error("Error adding event:", err);
      // Display the actual error message from the server if available
      const errMsg = err.response?.data?.error || "❌ Failed to post event. Check console for details.";
      setSuccessMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #87CEFA, #00BFFF)",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      
      <div
        style={{
          background: "#E3F2FD", // light blue card
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          width: "600px",
          maxWidth: "100%",
        }}
      >
        {/* Back Button on the left */}
        <div style={{ flex: "1" }}>
        <button
        onClick={() => navigate("/dashboard")} // Use navigate for better routing
        style={{
            background: "#0288D1",
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
        <h2
          style={{
            marginBottom: "20px",
            color: "#01579B",
            textAlign: "center",
          }}
        >
          Post a New Event
        </h2>

        {/* Success / Error Message */}
        {successMessage && (
          <div
            style={{
              background: successMessage.startsWith("✅") ? "#c8e6c9" : "#ffcdd2",
              color: successMessage.startsWith("✅") ? "#256029" : "#b71c1c",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "20px",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Event Form */}
        {/* ... (Keep the rest of your form structure and styling as is) ... */}
        
        <div style={sectionStyle}>
          <p style={labelStyle}>Event Name</p>
          <input
            type="text"
            placeholder="Enter event title"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            style={inputStyle}
          />

          <p style={labelStyle}>Description</p>
          <textarea
            placeholder="Brief event description"
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
            style={{ ...inputStyle, height: "80px", resize: "none" }}
          />
        </div>

        <div style={sectionStyle}>
          <div style={twoCol}>
            <div>
              <p style={labelStyle}>Date</p>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <p style={labelStyle}>Category</p>
              <select
                value={newEvent.category}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, category: e.target.value })
                }
                style={{ ...inputStyle, cursor: "pointer" }}
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
                value={newEvent.startTime}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, startTime: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <p style={labelStyle}>End Time</p>
              <input
                type="time"
                value={newEvent.endTime}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, endTime: e.target.value })
                }
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <p style={labelStyle}>Venue</p>
          <input
            type="text"
            placeholder="Event location"
            value={newEvent.venue}
            onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
            style={inputStyle}
          />

          <div style={twoCol}>
            <div>
              <p style={labelStyle}>Organizer</p>
              <input
                type="text"
                placeholder="Organizer name"
                value={newEvent.organizer}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, organizer: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <p style={labelStyle}>Contact Email</p>
              <input
                type="email"
                placeholder="Email address"
                value={newEvent.contact}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, contact: e.target.value })
                }
                style={inputStyle}
              />
            </div>
          </div>
        </div>
        
        {/* Post Button */}
        <button
          onClick={addEvent}
          disabled={loading || !currentUserId} // Disable if posting or no user ID
          style={{
            width: "100%",
            padding: "14px",
            background: loading || !currentUserId ? "grey" : "#0288D1",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
            cursor: loading || !currentUserId ? "not-allowed" : "pointer",
            transition: "0.3s",
            marginTop: "10px",
          }}
        >
          {loading ? "Posting..." : "Post Event"}
        </button>
      </div>
    </div>
  );
}

// Styles
const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  border: "1px solid #4FC3F7",
  borderRadius: "6px",
  background: "#ffffff",
  color: "#0277BD",
  fontSize: "14px",
};

const sectionStyle = {
  marginBottom: "20px",
  paddingBottom: "10px",
  borderBottom: "1px solid #bbdefb",
};

const labelStyle = {
  margin: "4px 0",
  color: "#01579B",
  fontSize: "13px",
  fontWeight: "bold",
};

const twoCol = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "15px",
};

export default EventPost;
