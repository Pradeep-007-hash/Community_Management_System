// src/Component/EventPost.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Helper function to format date/time for input constraints and checks
const getFormattedDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return {
    currentDate: `${year}-${month}-${day}`, // YYYY-MM-DD for date input min
    currentTime: `${hours}:${minutes}`     // HH:MM for time input min
  };
};

// Get current date/time once for stable reference outside the component
const { currentDate, currentTime } = getFormattedDateTime(); 

function EventPost() {
  const navigate = useNavigate();
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    organizer: "",
    contact: "",
    category: "",
  });
  // STATE: To store the selected file object
  const [eventImageFile, setEventImageFile] = useState(null); 
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // State for dynamic constraints (used in JSX min attributes)
  const [minDate, setMinDate] = useState(currentDate);
  const [minStartTime, setMinStartTime] = useState("");


  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setCurrentUserId(storedUserId);
    } else {
      console.error("User ID not found in local storage. Event posting will be disabled.");
    }
  }, []);

  // Effect to update the minimum time constraint based on the selected date
  useEffect(() => {
    // If the selected date is TODAY, set the minimum time to the current time.
    if (newEvent.date === currentDate) {
        setMinStartTime(currentTime);
    } else {
        // If the date is in the future, allow any time (no minimum constraint).
        setMinStartTime("00:00");
    }
  }, [newEvent.date]); // Depend on newEvent.date

  const addEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.venue) {
      alert("⚠ Title, Date, Start Time, and Venue are required");
      return;
    }
    
    if (!currentUserId) {
      alert("❌ Cannot post event. User is not logged in or User ID is missing.");
      return;
    }

    // -----------------------------------------------------------------
    // ⭐ CRITICAL ENFORCEMENT: Check if the selected time is in the past ⭐
    // -----------------------------------------------------------------
    // 1. Create a date string in ISO format for reliable Date object creation
    const selectedDateTimeString = `${newEvent.date}T${newEvent.startTime}:00`;
    const selectedDateTime = new Date(selectedDateTimeString);
    const now = new Date(); // Get current time at the moment of submission

    // 2. Check if the date is invalid OR if the selected time is less than the current time
    if (isNaN(selectedDateTime.getTime()) || selectedDateTime <= now) {
        alert("❌ The selected date and time is invalid or is in the past! Please schedule a future event.");
        return; // STOP submission
    }
    // -----------------------------------------------------------------

    setLoading(true);
    setSuccessMessage(""); // Clear previous message

    try {
      // 1. Create a FormData object to handle text fields and files
      const formData = new FormData();
      
      // 2. Append all event text fields to the FormData
      Object.keys(newEvent).forEach(key => {
        formData.append(key, newEvent[key]);
      });

      // 3. Append the image file itself (if selected)
      if (eventImageFile) {
        // The server will receive this as a file named 'eventImage'
        formData.append('eventImage', eventImageFile);
      }
      
      // 4. Send the FormData object. 
      await axios.post("http://localhost:5000/events", formData, {
        headers: { 
          "x-user-id": currentUserId,
        }, 
      });
      
      setSuccessMessage("✅ Event posted successfully! Returning to dashboard...");
      setNewEvent({ // reset form
        title: "", description: "", date: "", startTime: "", 
        endTime: "", venue: "", organizer: "", contact: "", category: "",
      });
      setEventImageFile(null); // reset image input
      
      setTimeout(() => navigate("/dashboard"), 1500);

    } catch (err) {
      console.error("Error adding event:", err);
      // Log response data for better debugging
      console.error("Server Response Data:", err.response?.data); 
      const errMsg = err.response?.data?.error || "❌ Failed to post event. Check console for details.";
      setSuccessMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // HANDLER: Captures the selected file (UNCHANGED)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setEventImageFile(file);
    } else {
      alert("Please select a valid image file (JPEG or PNG).");
      setEventImageFile(null);
      e.target.value = null; // Clear the input
    }
  };

  /* --- INNOVATIVE STYLES (Rest of the component's style and JSX is unchanged) --- */
  const cardStyle = {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
    width: "700px",
    maxWidth: "100%",
    animation: "fadeIn 0.5s ease-out",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 15px",
    marginBottom: "15px",
    border: "2px solid #E0F7FA",
    borderRadius: "8px",
    background: "#F8F8F8",
    color: "#01579B",
    fontSize: "15px",
    transition: "border-color 0.3s, box-shadow 0.3s",
  };

  const sectionStyle = {
    marginBottom: "25px",
    paddingBottom: "15px",
    borderBottom: "1px solid #B3E5FC",
  };

  const labelStyle = {
    margin: "4px 0",
    color: "#01579B",
    fontSize: "14px",
    fontWeight: "600",
    display: "block",
    marginBottom: "5px",
  };

  const twoCol = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  };
  /* --- END OF INNOVATIVE STYLES --- */

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #E3F2FD, #B3E5FC)",
        fontFamily: "Poppins, Arial, sans-serif",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      
      <div style={cardStyle}>
        {/* Header and Back Button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
         
          <h2
            style={{
              color: "#01579B",
              margin: 0,
              fontSize: "28px",
              fontWeight: "800",
            }}
          >
            Publish New Event ✨
          </h2>
          <div style={{ width: "85px" }}>{/* Spacer for alignment */}</div>
        </div>

        {/* Success / Error Message */}
        {successMessage && (
          <div
            style={{
              background: successMessage.startsWith("✅") ? "#E8F5E9" : "#FFEBEE",
              color: successMessage.startsWith("✅") ? "#388E3C" : "#D32F2F",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "25px",
              fontSize: "15px",
              fontWeight: "600",
              textAlign: "center",
              border: `1px solid ${successMessage.startsWith("✅") ? "#A5D6A7" : "#EF9A9A"}`,
            }}
          >
            {successMessage}
          </div>
        )}

        {/* --- Form Fields --- */}
        
        <div style={sectionStyle}>
          <label style={labelStyle} htmlFor="title">Event Name <span style={{color: 'red'}}>*</span></label>
          <input
            id="title"
            type="text"
            placeholder="e.g., Annual Tech Fest 2024"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            style={inputStyle}
          />

          <label style={labelStyle} htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Brief event description (what, why, who)"
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
              <label style={labelStyle} htmlFor="date">Date <span style={{color: 'red'}}>*</span></label>
              <input
                id="date"
                type="date"
                // ENFORCEMENT 1: UX constraint (HTML min attribute)
                min={minDate} 
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="category">Category</label>
              <select
                id="category"
                value={newEvent.category}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, category: e.target.value })
                }
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="">Select Category</option>
                <option value="Workshop">Emergency Alert</option>
                <option value="Seminar">General</option>
                <option value="Webinar">Meeting</option>
                <option value="Competition">Competition</option>
                <option value="Fest">Fest</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={twoCol}>
            <div>
              <label style={labelStyle} htmlFor="startTime">Start Time <span style={{color: 'red'}}>*</span></label>
              <input
                id="startTime"
                type="time"
                // ENFORCEMENT 2: UX constraint (HTML min attribute for time)
                min={newEvent.date === minDate ? minStartTime : "00:00"}
                value={newEvent.startTime}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, startTime: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="endTime">End Time (Optional)</label>
              <input
                id="endTime"
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
          <label style={labelStyle} htmlFor="venue">Venue <span style={{color: 'red'}}>*</span></label>
          <input
            id="venue"
            type="text"
            placeholder="e.g., Main Auditorium / Online via Zoom"
            value={newEvent.venue}
            onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
            style={inputStyle}
          />

          <div style={twoCol}>
            <div>
              <label style={labelStyle} htmlFor="organizer">Organizer</label>
              <input
                id="organizer"
                type="text"
                placeholder="Club or Department Name"
                value={newEvent.organizer}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, organizer: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="contact">Contact Email</label>
              <input
                id="contact"
                type="email"
                placeholder="event@example.com"
                value={newEvent.contact}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, contact: e.target.value })
                }
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* IMAGE UPLOAD FUNCTIONALITY */}
        <div style={sectionStyle}>
          <label style={labelStyle} htmlFor="imageFile">Event Poster/Image (Optional)</label>
          <input
            id="imageFile"
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleImageChange}
            style={{ ...inputStyle, padding: "12px 15px", border: "1px dashed #0288D1", cursor: "pointer" }}
          />
          {eventImageFile && (
            <p style={{ margin: "-10px 0 10px 0", fontSize: "12px", color: "#4CAF50" }}>
              Selected: {eventImageFile.name}
            </p>
          )}
        </div>
        
        {/* Post Button */}
        <button
          onClick={addEvent}
          disabled={loading || !currentUserId}
          style={{
            width: "100%",
            padding: "15px",
            background: loading || !currentUserId ? "#B0BEC5" : "#0288D1",
            color: "white",
            fontSize: "17px",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
            cursor: loading || !currentUserId ? "not-allowed" : "pointer",
            transition: "background 0.3s, transform 0.1s",
            marginTop: "10px",
            boxShadow: "0 4px 10px rgba(2, 136, 209, 0.3)",
          }}
          onMouseOver={(e) => e.target.style.background = (loading || !currentUserId) ? '#B0BEC5' : '#01579B'}
          onMouseOut={(e) => e.target.style.background = (loading || !currentUserId) ? '#B0BEC5' : '#0288D1'}
        >
          {loading ? "Posting..." : "🚀 Publish Event"}
        </button>
      </div>
    </div>
  );
}

export default EventPost;
