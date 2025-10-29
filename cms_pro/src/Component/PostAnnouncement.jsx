import React, { useState } from "react";
import { postAnnouncement } from "../api";
import { useNavigate } from "react-router-dom";

function PostAnnouncement() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage("Please fill in the title.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await postAnnouncement({ title: title.trim(), content: content.trim() });
      setMessage("Announcement posted successfully!");
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Error posting announcement:", error);
      setMessage("Failed to post announcement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnnouncements = () => {
    navigate('/view-announcements');
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Post Announcement</h2>
        <button
          onClick={handleViewAnnouncements}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            width:"200px"
          }}
        >
          View Past Announcements
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="title" style={{ display: "block", marginBottom: "5px" }}>
            Title:
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "16px",
              backgroundColor: "#fafafa",
              color: "black",
            }}
            placeholder="Enter announcement title"
            required
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="content" style={{ display: "block", marginBottom: "5px" }}>
            Content:
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "16px",
              minHeight: "150px",
              resize: "vertical",
              backgroundColor: "#fafafa",
              color: "black",
            }}
            placeholder="Enter announcement content"
            
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          {loading ? "Posting..." : "Post Announcement"}
        </button>
      </form>
      {message && (
        <p
          style={{
            marginTop: "15px",
            color: message.includes("successfully") ? "green" : "red",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default PostAnnouncement;
