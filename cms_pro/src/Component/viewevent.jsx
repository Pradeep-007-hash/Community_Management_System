import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function EventView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [isAdmin, setIsAdmin] = useState(null);
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  // Fetch user info to check admin role
  const fetchUserInfo = async () => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }
    try {
      const res = await axios.get("http://localhost:5000/user/profile/" + userId, {
        headers: { "x-user-id": userId },
      });
      setIsAdmin(res.data.role === "admin");
    } catch {
      setIsAdmin(false);
    }
  };

  // Fetch events
  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/events/upcoming");
      setEvents(res.data || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch latest announcement
  const fetchLatestAnnouncement = async () => {
    try {
      const res = await axios.get("http://localhost:5000/announcements");
      if (res.data && res.data.length > 0) {
        // Get the most recent announcement (sorted by createdAt descending)
        const latest = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        setLatestAnnouncement(latest);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchEvents();
    fetchLatestAnnouncement();
  }, []);

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`http://localhost:5000/events/${id}`, {
        headers: { "x-user-id": userId },
      });
      setEvents(events.filter((ev) => ev._id !== id));
    } catch {
      alert("❌ You can only delete your own event or need admin rights.");
    }
  };

  const toggleLike = async (id) => {
    if (!userId) {
      alert("You must be logged in to like an event.");
      return;
    }
    try {
      const res = await axios.post(
        `http://localhost:5000/events/${id}/like`,
        {},
        { headers: { "x-user-id": userId } }
      );
      setEvents((prev) =>
        prev.map((ev) => (ev._id === id ? { ...ev, likes: res.data.likes } : ev))
      );
    } catch {
      alert("Could not update like status. Are you logged in?");
    }
  };

  const commentEvent = async (id) => {
    if (!userId) {
      alert("You must be logged in to comment.");
      return;
    }
    const text = commentText[id];
    if (!text || text.trim() === "") return;
    try {
      await axios.post(
        `http://localhost:5000/events/${id}/comment`,
        { text: text },
        { headers: { "x-user-id": userId } }
      );
      await fetchEvents();
      setCommentText((prev) => ({ ...prev, [id]: "" }));
    } catch {
      alert("Could not post comment. Are you logged in?");
    }
  };
    
  const editEvent = (id) => {
    navigate(`/events/edit/${id}`);
  };


  // Block rendering until admin and events are loaded
  if (loading || isAdmin === null) return <p style={{ textAlign: "center", padding: "20px",color:"black",textAlign:"center"}}>Loading events...</p>;
  if (!events.length) return <p style={{ textAlign: "center", padding: "20px" }}>No upcoming events.</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ background: "#f0f0f0", padding: "10px", color: "black", marginBottom: "20px" }}>
        <marquee behavior="scroll" direction="left">
          🔔 {latestAnnouncement ? `${latestAnnouncement.title}: ${latestAnnouncement.content}` : "Welcome to the Dashboard! Stay tuned for updates."}
        </marquee>
      </div>
      <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#0277BD" }}>
        Upcoming Events 📅
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {events.map((ev) => (
          <div
            key={ev._id}
            style={{
              background: "#E0F7FA",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {ev.image && (
              <img
                src={`data:image/png;base64,${ev.image}`}
                alt={ev.title}
                style={{
                  height: "200px",
                  width: "100%",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
              />
            )}

            <h2 style={{ margin: 0, color: "#01579B" }}>{ev.title}</h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#333" }}>{ev.description}</p>
            <p style={{ margin: 0, color: "#333" }}>
              <strong>Date:</strong> {new Date(ev.date).toLocaleDateString("en-IN")}
            </p>
            <p style={{ margin: 0, color: "#333" }}>
              <strong>Time:</strong> {ev.startTime} {ev.endTime && `- ${ev.endTime}`}
            </p>
            <p style={{ margin: 0, color: "#333" }}>
              <strong>Venue:</strong> {ev.venue}
            </p>
            <p style={{ margin: 0, color: "#333" }}>
              <strong>Organizer:</strong> {ev.organizer}
            </p>
            <p style={{ margin: 0, color: "#333" }}>
              <strong>Contact:</strong> {ev.contact}
            </p>
            <p style={{ margin: 0, color: "#333" }}>
              <strong>Category:</strong> {ev.category}
            </p>

            {/* START OF BUTTONS SECTION - COMBINED LIKE/EDIT/DELETE */}
            <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
                
                {/* LIKE/UNLIKE BUTTON */}
                <button
              onClick={() => toggleLike(ev._id)}
              style={{
                width: "140px",
                marginTop: "10px",
                padding: "8px",
                background: ev.likes?.includes(userId) ? "#E53935" : "#43A047",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: userId ? "pointer" : "not-allowed",
                fontWeight: "bold",
              }}
              disabled={!userId}
            >
              {ev.likes?.includes(userId) ? "❤ Unlike" : "🤍 Like"} ({ev.likes?.length || 0})
            </button>

                {/* EDIT AND DELETE BUTTONS - TEMPORARILY VISIBLE */}

                {(String(ev.postedBy) === String(userId) || isAdmin || true) && ( 
                  <>
                    <button
                      onClick={() => editEvent(ev._id)}
                      style={{
                        flex: 1,
                        minWidth: "80px", 
                        padding: "8px 12px",
                        background: "#0288D1",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Edit ✏️
                    </button>
                    <button
                      onClick={() => deleteEvent(ev._id)}
                      style={{
                        flex: 1,
                        minWidth: "80px", 
                        padding: "8px 12px",
                        background: "#D32F2F",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Delete 🗑️
                    </button>
                  </>
                )}
            </div>
            {/* END OF BUTTONS SECTION */}

         <div style={{ marginTop: "10px", display: "flex", gap: "5px" }}>
              <input
                type="text"
                value={commentText[ev._id] || ""}
                onChange={(e) =>
                  setCommentText((prev) => ({
                    ...prev,
                    [ev._id]: e.target.value,
                  }))
                }
                placeholder={userId ? "Add a comment..." : "Login to comment..."}
                style={{
                  flexGrow: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  backgroundColor:"white",
                  color:"black"
                }}
                disabled={!userId}
              />
              <button
                onClick={() => commentEvent(ev._id)}
                style={{
                  padding: "8px 12px",
                  background: "#0288D1",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: userId ? "pointer" : "not-allowed",
                  fontWeight: "bold",
                }}
                disabled={!userId || !commentText[ev._id]}
              >
                Post
              </button>
            </div>
            <div
              style={{
                marginTop: "10px",
                color: "#333",
                maxHeight: "150px",
                overflowY: "auto",
                paddingRight: "5px",
              }}
            >
              <strong>Comments:</strong>
              <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                {(ev.comments?.length ?? 0) === 0 && (
                  <li style={{ fontSize: "14px", color: "#666" }}>No comments yet.</li>
                )}
                {ev.comments?.slice().reverse().map((c, idx) => (
                  <li
                    key={idx}
                    style={{
                      padding: "5px 0",
                      borderBottom: "1px dotted #B3E5FC",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#00BCD4",
                      }}
                    >
                      {c.username || "Anonymous"}:
                    </span>{" "}
                    {c.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>

  );
}

export default EventView;