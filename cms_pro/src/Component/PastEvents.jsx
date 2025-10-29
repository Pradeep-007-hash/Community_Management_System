import React, { useState, useEffect } from 'react';
import axios from 'axios';

// =========================================================
// 1. UTILITY: Helper function to format timestamp
// =========================================================
const timeAgo = (date) => {
    if (!date) return 'N/A';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return "just now";
};

// =========================================================
// 2. STYLES: Simple inline styles for event card (based on your CSS)
// =========================================================
const styles = {
    container: {
        padding: '20px',
    },
    // NEW: Container for 3 columns grid
    eventsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px', // Space between cards
    },
    // MODIFIED: Card style for grid layout
    eventCard: {
        background: '#fff',
        padding: '0',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    contentArea: {
        padding: '15px', // Padding inside the card content area
    },
    title: {
        fontSize: '1.4rem',
        fontWeight: '700',
        color: '#1e88e5', // Blue title
        margin: '0 0 5px 0',
        textAlign: 'center',
    },
    dateInfo: {
        fontSize: '1rem',
        color: '#333',
        fontWeight: '400',
        lineHeight: '1.5',
    },
    description: {
        fontSize: '0.9rem',
        color: '#555',
        marginBottom: '15px',
        textAlign: 'center',
    },
    // 🛑 MODIFIED: Poster Container is now the final element of the card
    posterContainer: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 15px', // Padding added here
        borderTop: '1px solid #eee',
        fontSize: '12px',
        marginTop: 'auto', // Pushes the poster info to the bottom of the card
    },
    userImage: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        objectFit: 'cover',
        marginRight: '10px',
    },
    posterName: {
        fontWeight: '600',
        color: '#333',
        margin: 0,
    },
    timeAgo: {
        color: '#6c757d',
        margin: '2px 0 0 0',
    }
    // Action buttons styles removed
};

// =========================================================
// 3. COMPONENT: PastEvents (Final structure)
// =========================================================
const PastEvents = () => {
    const [pastEvents, setPastEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPastEvents = async () => {
            try {
                const res = await axios.get("http://localhost:5000/events/past"); 
                setPastEvents(res.data);
                setError(null);
            } catch (err) {
                console.error("❌ Failed to fetch past events:", err);
                setError("Failed to load past events. Please check the server.");
            } finally {
                setLoading(false);
            }
        };
        fetchPastEvents();
    }, []);

    if (loading) return <p>Loading past events...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (pastEvents.length === 0) return (
        <div style={styles.container}>
            <h2 className="welcomeHeader">Past Events</h2>
            <p className="welcomeSubtext">There are currently no events that have concluded.</p>
        </div>
    );

    return (
        <div style={styles.container}>
            <h2 className="welcomeHeader">Past Events</h2>
            <p className="welcomeSubtext">A list of all events that have already concluded.</p>

            <div style={styles.eventsGrid}>
                {pastEvents.map((event) => (
                    <div key={event._id} style={styles.eventCard}>
                        
                        {/* Event Poster Image (if available) */}
                        {event.image && (
                            <img 
                                src={`data:image/jpeg;base64,${event.image}`} 
                                alt={`${event.title} Poster`} 
                                style={{ 
                                    width: '100%', 
                                    height: '180px', 
                                    objectFit: 'contain', 
                                    borderRadius: '8px 8px 0 0', 
                                    marginBottom: '10px' 
                                }}
                            />
                        )}

                        {/* Event Content Area */}
                        <div style={styles.contentArea}>
                            <h3 style={styles.title}>{event.title}</h3>
                            <p style={styles.description}>{event.description}</p>
                            
                            {/* Display Event Details (Date, Time, Venue, etc.) */}
                            <p style={styles.dateInfo}>
                                <strong>Date:</strong> {new Date(event.date).toLocaleDateString('en-GB')} 
                            </p>
                            <p style={styles.dateInfo}>
                                <strong>Time:</strong> {event.startTime}
                            </p>
                            <p style={styles.dateInfo}><strong>Venue:</strong> {event.venue}</p>
                            <p style={styles.dateInfo}><strong>Organizer:</strong> {event.organizer}</p>
                            <p style={styles.dateInfo}><strong>Contact:</strong> {event.contact}</p>
                            <p style={styles.dateInfo}><strong>Category:</strong> {event.category}</p>

                            {/* Filler to push poster container down if content is short */}
                            <div style={{ flexGrow: 1 }}></div> 
                        </div>

                        {/* 🛑 FINAL ELEMENT: Poster Info (Posted by/time ago) */}
                        <div style={styles.posterContainer}>
                            <img
                                src={event.poster?.image ? `data:image/jpeg;base64,${event.poster.image}` : '/default-profile.png'}
                                alt={`${event.poster?.firstname || 'User'} Profile`}
                                style={styles.userImage}
                            />
                            <div>
                                <p style={styles.posterName}>
                                    Posted by: {event.poster ? `${event.poster.firstname} ${event.poster.lastname}` : 'Unknown User'}
                                </p>
                                <p style={styles.timeAgo}>
                                    {/* Final output must end with this line */}
                                    Posted {timeAgo(event.createdAt)}
                                </p>
                            </div>
                        </div>
                        {/* 🛑 Action buttons area completely removed */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PastEvents;
