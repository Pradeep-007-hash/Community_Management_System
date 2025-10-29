import React, { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import { addVisitor, getVisitors, addDelivery, getDeliveries, updateDeliveryStatus } from "../api";
import ViewAnnouncements from './ViewAnnouncements';

const handleLogout = () => {
  localStorage.removeItem("userId");
  alert("Logged out successfully! Redirecting to login...");
  window.location.href = "/login";
};

const SecurityDashboard = () => {
  const [pageView, setPageView] = useState("visitorlog");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [visitors, setVisitors] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    purpose: "",
    vehicleNumber: "",
    doorNo: ""
  });
  const [deliveryFormData, setDeliveryFormData] = useState({
    senderName: "",
    senderContact: "",
    recipientDoorNo: "",
    itemDescription: "",
    deliveryType: ""
  });
  const [loading, setLoading] = useState(false);
  const [searchDate, setSearchDate] = useState("");
  const [visitorError, setVisitorError] = useState("");
  const [deliveryError, setDeliveryError] = useState("");

  // Fetch visitors and deliveries on component mount
  useEffect(() => {
    fetchVisitors();
    fetchDeliveries();
  }, []);

  const fetchVisitors = async () => {
    try {
      const response = await getVisitors();
      setVisitors(response.data);
    } catch (error) {
      console.error("Error fetching visitors:", error);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const response = await getDeliveries();
      setDeliveries(response.data);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  };

  const exportToExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(visitor => ({
      Name: visitor.name,
      Contact: visitor.contact,
      Purpose: visitor.purpose,
      'Vehicle Number': visitor.vehicleNumber || 'N/A',
      'Door Number': visitor.doorNo,
      'Entry Time': new Date(visitor.entryTime).toLocaleString()
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitor Log');
    XLSX.writeFile(workbook, 'visitor_log.xlsx');
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'doorNo') {
      setVisitorError("");
    }
  };

  const handleDeliveryFormChange = (e) => {
    setDeliveryFormData({
      ...deliveryFormData,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'recipientDoorNo') {
      setDeliveryError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVisitorError("");

    // Validate door number
    if (!formData.doorNo || formData.doorNo.trim() === "") {
      setVisitorError("Door number is required.");
      setLoading(false);
      return;
    }

    // Check if door number is valid (assuming valid door numbers are 1-100 or specific format)
    const validDoorNumbers = ["101", "102", "103", "201", "202", "203"]; // Example valid door numbers
    if (!validDoorNumbers.includes(formData.doorNo.trim())) {
      setVisitorError("Invalid door number. Please enter a valid door number.");
      setLoading(false);
      return;
    }

    try {
      const visitorData = {
        ...formData,
        entryTime: new Date().toISOString()
      };
      await addVisitor(visitorData);
      alert("Visitor logged successfully!");
      setFormData({
        name: "",
        contact: "",
        purpose: "",
        vehicleNumber: "",
        doorNo: ""
      });
      fetchVisitors(); // Refresh the list
    } catch (error) {
      console.error("Error adding visitor:", error);
      alert("Failed to log visitor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDeliveryError("");

    // Validate recipient door number
    if (!deliveryFormData.recipientDoorNo || deliveryFormData.recipientDoorNo.trim() === "") {
      setDeliveryError("Recipient door number is required.");
      setLoading(false);
      return;
    }

    // Check if recipient door number is valid
    const validDoorNumbers = ["101", "102", "103", "201", "202", "203"]; // Example valid door numbers
    if (!validDoorNumbers.includes(deliveryFormData.recipientDoorNo.trim())) {
      setDeliveryError("Invalid recipient door number. Please enter a valid door number.");
      setLoading(false);
      return;
    }

    try {
      const deliveryData = {
        ...deliveryFormData,
        deliveryTime: new Date().toISOString()
      };
      await addDelivery(deliveryData);
      alert("Delivery logged successfully!");
      setDeliveryFormData({
        senderName: "",
        senderContact: "",
        recipientDoorNo: "",
        itemDescription: "",
        deliveryType: ""
      });
      fetchDeliveries(); // Refresh the list
    } catch (error) {
      console.error("Error adding delivery:", error);
      alert("Failed to log delivery. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { name: "Visitor Log", key: "visitorlog" },
    { name: "View Past Visitors", key: "viewpastvisitor" },
    { name: "Delivery Reminder", key: "deliveryreminder" },
    { name: "View Delivery Log", key: "viewdeliverylog" },
    { name: "View Announcements", key: "viewannouncements" },
    { name: "Logout", key: "logout" }
  ];

  const renderMainContent = () => {
    switch (pageView) {
      case "visitorlog":
        return (
          <>
            <h2 className="welcomeHeader">Visitor Log</h2>
            <p className="welcomeSubtext">Manage and view visitor entries here.</p>
            <div className="profileCard">
              <h3>Log New Visitor</h3>
              <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px",backgroundColor:"white",color:"black" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Contact:</label>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleFormChange}
                      required
                      style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px",backgroundColor:"white",color:"black"}}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Purpose:</label>
                    <input
                      type="text"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleFormChange}
                      required
                      style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px",backgroundColor:"white",color:"black"}}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Vehicle Number:</label>
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={handleFormChange}
                      style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px",backgroundColor:"white",color:"black"}}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Door Number:</label>
                    <input
                      type="text"
                      name="doorNo"
                      value={formData.doorNo}
                      onChange={handleFormChange}
                      required
                      style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px",backgroundColor:"white",color:"black"}}
                    />
                    {visitorError && <p style={{ color: "red", fontSize: "0.9rem", marginTop: "5px" }}>{visitorError}</p>}
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Entry Time:</label>
                    <input
                      type="text"
                      name="entryTime"
                      value={new Date().toLocaleString()}
                      readOnly
                      style={{ width: "200px", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", backgroundColor: "#f9f9f9",color:"black" }}
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} style={{ padding: "10px 20px", backgroundColor: "#3b5998", color: "white", border: "none", borderRadius: "4px", cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "Logging..." : "Log Visitor"}
                </button>
              </form>
              </div>
          </>
        );
      case "viewpastvisitor":
        return (
          <>
            <h2 className="welcomeHeader">View Past Visitors</h2>
            <p className="welcomeSubtext">View all logged visitor entries.</p>
            <div className="profileCard">
              <h3>All Visitor Logs</h3>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Search by Date:</label>
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px", marginRight: "10px",width:"200px",color:"black",backgroundColor:"white" }}
                />
                <button onClick={() => setSearchDate("")} style={{ padding: "8px 15px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer",width:"100px" }}>
                  Clear
                </button>
              </div>
              {visitors.length > 0 && (
                <button onClick={() => exportToExcel(visitors)} style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "20px",width:"250px" }}>
                  Download Visitor Log as Excel
                </button>
              )}
              {visitors.length === 0 ? (
                <p>No visitors logged yet.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px", color:"black"}}>
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Name</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Contact</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Purpose</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Vehicle</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Door No</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Entry Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.map((visitor) => (
                      <tr key={visitor._id}>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{visitor.name}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{visitor.contact}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{visitor.purpose}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{visitor.vehicleNumber || "N/A"}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{visitor.doorNo || "N/A"}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{new Date(visitor.entryTime).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        );
      case "deliveryreminder":
        return (
          <>
            <h2 className="welcomeHeader">Delivery Reminder</h2>
            <p className="welcomeSubtext">Log and view delivery entries.</p>
            <div className="profileCard">
              <h3>Log New Delivery</h3>
              <form onSubmit={handleDeliverySubmit} style={{ marginBottom: "30px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Sender Name:</label>
                    <input
                      type="text"
                      name="senderName"
                      value={deliveryFormData.senderName}
                      onChange={handleDeliveryFormChange}
                      required
                      style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px",background:"white",color:"black"}}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Sender Contact:</label>
                    <input
                      type="text"
                      name="senderContact"
                      value={deliveryFormData.senderContact}
                      onChange={handleDeliveryFormChange}
                      required
                      style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px",background:"white",color:"black"}}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Recipient Door No:</label>
                    <input
                      type="text"
                      name="recipientDoorNo"
                      value={deliveryFormData.recipientDoorNo}
                      onChange={handleDeliveryFormChange}
                      required
                      style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px",background:"white",color:"black" }}
                    />
                    {deliveryError && <p style={{ color: "red", fontSize: "0.9rem", marginTop: "5px" }}>{deliveryError}</p>}
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Item Description:</label>
                    <input
                      type="text"
                      name="itemDescription"
                      value={deliveryFormData.itemDescription}
                      onChange={handleDeliveryFormChange}
                      required
                      style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" ,background:"white",color:"black"}}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Delivery Type:</label>
                    <select
                      name="deliveryType"
                      value={deliveryFormData.deliveryType}
                      onChange={handleDeliveryFormChange}
                      required
                      style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" ,background:"white",color:"black"}}
                    >
                      <option value="">Select Type</option>
                      <option value="Food Delivery">Food Delivery</option>
                      <option value="Product Delivery">Product Delivery</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500"}}>Delivery Time:</label>
                    <input
                      type="text"
                      name="deliveryTime"
                      value={new Date().toLocaleString()}
                      readOnly
                      style={{ width: "200px", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", backgroundColor: "black" }}
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} style={{ padding: "10px 20px", backgroundColor: "#3b5998", color: "white", border: "none", borderRadius: "4px", cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "Logging..." : "Log Delivery"}
                </button>
              </form>

             
            </div>
          </>
        );
      case "viewdeliverylog":
        return (
          <>
            <h2 className="welcomeHeader">View Delivery Log</h2>
            <p className="welcomeSubtext">View all delivery entries with status.</p>
            <div className="profileCard">
              <h3>All Delivery Logs</h3>
              {deliveries.length === 0 ? (
                <p>No deliveries logged yet.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px", color: "black" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Sender Name</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Sender Contact</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Door No</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Item Description</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Delivery Type</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Delivery Time</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Status</th>
                      <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map((delivery) => (
                      <tr key={delivery._id}>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{delivery.senderName}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{delivery.senderContact}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{delivery.recipientDoorNo}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{delivery.itemDescription}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{delivery.deliveryType || "N/A"}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>{new Date(delivery.deliveryTime).toLocaleString()}</td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                          <span style={{
                            color: delivery.status === 'Received' ? 'green' : 'orange',
                            fontWeight: 'bold'
                          }}>
                            {delivery.status || 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                          {delivery.status !== 'Received' && (
                            <button
                              onClick={async () => {
                                try {
                                  await updateDeliveryStatus(delivery._id, 'Received');
                                  fetchDeliveries(); // Refresh the list
                                  alert("Delivery status updated to Received!");
                                } catch (error) {
                                  console.error("Error updating status:", error);
                                  alert("Failed to update status. Please try again.");
                                }
                              }}
                              style={{ padding: "5px 10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                            >
                              Mark as Received
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        );
      case "viewannouncements":
        return (
          <>
            <h2 className="welcomeHeader">View Announcements</h2>
            <p className="welcomeSubtext">View all posted announcements.</p>
            <div className="profileCard">
              <h3>All Announcements</h3>
              <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
                <ViewAnnouncements />
              </div>
            </div>
          </>
        );
      case "logout":
        handleLogout();
        return null;
      default:
        return (
          <>
            <h2 className="welcomeHeader">Welcome to Security Dashboard</h2>
            <p className="welcomeSubtext">Select an option from the sidebar.</p>
          </>
        );
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
          <h1 className="logo">Security Portal</h1>
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

export default SecurityDashboard;
