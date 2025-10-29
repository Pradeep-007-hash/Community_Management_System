import { useState } from "react";
// Import necessary hooks and components from react-router-dom
import { BrowserRouter, Routes, Route, useNavigate, Link } from "react-router-dom";

// ------------------------------------------------------------------
// 1. STYLE DEFINITIONS & UTILS (Global styles used by all components)
// ------------------------------------------------------------------

const inputBaseStyle = {
    padding: "12px",
    marginBottom: "18px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    color: "#000",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
    width: "100%",
};

const inputFocusStyle = {
    border: "1px solid #1976d2",
    boxShadow: "0 0 5px rgba(25, 118, 210, 0.3)",
};

const formStyle = {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
};

const labelStyle = {
    marginBottom: "6px",
    fontSize: "14px",
    color: "#333",
    fontWeight: "500",
};

const primaryButtonStyle = {
    padding: "12px",
    background: "#1976d2",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "18px",
    transition: "background 0.3s",
};

// --- NEW GOOGLE ICON (Imported from your provided code) ---
const GoogleIcon = ({ style }) => (
    <svg style={style} viewBox="0 0 48 48">
        <defs>
            <path id="a" d="M44.5 20H24v8.5h11.8c-.7 4.3-3.6 7.6-8.2 9.5v5.5h6.3c3.9-3.6 6.3-8.8 6.3-15.7 0-1.8-.2-3.4-.6-5z"/>
        </defs>
        <clipPath id="b">
            <use xlinkHref="#a" overflow="visible"/>
        </clipPath>
        <path clipPath="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z"/>
        <path clipPath="url(#b)" fill="#EA4335" d="M0 11l17 13 7-6.1L4.6 4.4z"/>
        <path clipPath="url(#b)" fill="#34A853" d="M0 37l17-13-7 6.1-12.4 12.2z"/>
        <path clipPath="url(#b)" fill="#4285F4" d="M24 45.5c-.8 0-1.5-.1-2.2-.3-.1-.5-.2-1.1-.2-1.6 0-1.5.3-2.9.7-4.1-4.7-2-8.2-5.3-8.2-9.5V20H24v8.5h11.8c-.7 4.3-3.6 7.6-8.2 9.5v5.5h6.3c3.9-3.6 6.3-8.8 6.3-15.7 0-1.8-.2-3.4-.6-5z"/>
    </svg>
);

// --- NEW GOOGLE FLOW STYLES (Imported from your provided code) ---
const googleButtonStyle = {
    padding: '0', 
    height: '48px', 
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: '6px',
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: '10px', 
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'background 0.2s, box-shadow 0.2s',
};

const googleIconContainerStyle = {
    backgroundColor: 'white',
    padding: '11px 16px', 
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    borderRight: '1px solid #eee', 
};

const googleTextContainerStyle = {
    flexGrow: 1,
    textAlign: 'left',
    color: '#555', 
    fontSize: '15px',
    fontWeight: '500', 
    padding: '0 24px 0 16px', 
};

const googleButtonHoverStyle = {
    background: '#f8f8f8',
    boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
};

const separatorStyle = {
    textAlign: 'center',
    marginBottom: '18px',
    fontSize: '13px',
    color: '#aaa',
    display: 'flex',
    alignItems: 'center',
    padding: '0 5px',
    width: '100%',
};

const lineStyle = {
    flexGrow: 1,
    height: '1px',
    backgroundColor: '#eee',
};


// ------------------------------------------------------------------
// 2. LOGIN COMPONENT (Updated with Google/OTP Flow)
// ------------------------------------------------------------------

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  
  // State for the custom Google/OTP flow (from your provided code)
  const [googleFlowStep, setGoogleFlowStep] = useState('default'); // 'default', 'email', 'otp'
  const [googleEmail, setGoogleEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  const navigate = useNavigate();

  // Handler to initiate the custom Google/OTP flow
  const handleGoogleSignIn = () => {
      setMessage(""); // Clear messages
      setGoogleFlowStep('email');
  };

  // Handler for submitting the email (to "generate" OTP)
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (googleEmail) {
        // Mock: OTP is "generated" and user is moved to the next step
        setMessage(`OTP sent to ${googleEmail}. Enter the OTP (Mock: 123456) to verify.`);
        setGoogleFlowStep('otp');
    } else {
        setMessage("Please enter a valid email address.");
    }
  };

  // Handler for submitting the OTP
  const handleOTPSubmit = (e) => {
    e.preventDefault();
    // Mock OTP validation logic
    if (otp === "123456") { 
        setMessage("OTP verified. Successfully signed in! Redirecting...");
        localStorage.setItem("userId", "mock-google-otp-id");
        // Simulate redirect to user dashboard
        setTimeout(() => {
            setGoogleFlowStep('default');
            setGoogleEmail('');
            setOtp('');
            navigate("/userdashboard"); 
        }, 1500);
    } else {
        setMessage("Invalid OTP. Please try again.");
    }
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    // --- MOCK LOGIN LOGIC (Reverted from fetch to mock logic for sandbox) ---
    if (username === "admin" && password === "admin123") {
      setMessage("Admin Login successful (Mock)! Redirecting...");
      localStorage.setItem("userId", "mock-admin-id");
      setTimeout(() => navigate("/admin"), 1000);
    } else if (username === "user" && password === "user123") {
      setMessage("User Login successful (Mock)! Redirecting...");
      localStorage.setItem("userId", "mock-user-id");
      setTimeout(() => navigate("/userdashboard"), 1000);
    } else {
      setMessage("Invalid username or password (Mock Failure). Try 'user'/'user123' or 'admin'/'admin123'.");
    }
  };


  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Welcome Back</h2>
        <p style={subtitleStyle}>Please sign in to continue</p>
        
        {googleFlowStep === 'default' ? (
            // --- DEFAULT LOGIN VIEW (Username/Password + Google Button) ---
            <>
              {/* GOOGLE SIGN IN BUTTON */}
              <button
                onClick={handleGoogleSignIn}
                style={googleButtonStyle}
                onMouseOver={(e) => Object.assign(e.currentTarget.style, googleButtonStyle, googleButtonHoverStyle)}
                onMouseOut={(e) => Object.assign(e.currentTarget.style, googleButtonStyle)}
              >
                <div style={googleIconContainerStyle}>
                  <GoogleIcon style={{width: '24px', height: '24px'}} />
                </div>
                <div style={googleTextContainerStyle}>
                  Sign in with Google
                </div>
              </button>
              {/* Separator between Google button and form */}
              <div style={separatorStyle}>
                <span style={lineStyle}></span>
                <span style={{ margin: '0 0px 0 10px', color: '#888' }}>OR</span>
                <span style={lineStyle}></span>
              </div>

              <form onSubmit={handleLogin} style={formStyle}>
                <label style={labelStyle}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username"
                  style={inputBaseStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputBaseStyle, inputFocusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, inputBaseStyle)}
                />

                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  style={inputBaseStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputBaseStyle, inputFocusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, inputBaseStyle)}
                />

                <button type="submit" style={primaryButtonStyle}>
                  Sign In
                </button>
              </form>
            </>
        ) : (
            // --- GOOGLE CUSTOM FLOW VIEW (Email/OTP) ---
            <>
              {googleFlowStep === 'email' && (
                  <form onSubmit={handleEmailSubmit} style={formStyle}>
                      <label style={labelStyle}>Email for Verification</label>
                      <input
                          type="email"
                          value={googleEmail}
                          onChange={(e) => setGoogleEmail(e.target.value)}
                          required
                          placeholder="Enter your email"
                          style={inputBaseStyle}
                          onFocus={(e) => Object.assign(e.target.style, inputBaseStyle, inputFocusStyle)}
                          onBlur={(e) => Object.assign(e.target.style, inputBaseStyle)}
                      />
                      <button type="submit" style={primaryButtonStyle}>
                          Generate OTP
                      </button>
                      <button type="button" onClick={() => setGoogleFlowStep('default')} style={{ ...primaryButtonStyle, background: '#ccc', color: '#333', marginTop: '10px' }}>
                          Cancel
                      </button>
                  </form>
              )}

              {googleFlowStep === 'otp' && (
                  <form onSubmit={handleOTPSubmit} style={formStyle}>
                      <label style={labelStyle}>One-Time Password (OTP)</label>
                      <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          placeholder="Enter 6-digit OTP (Mock: 123456)"
                          style={inputBaseStyle}
                          maxLength="6"
                          onFocus={(e) => Object.assign(e.target.style, inputBaseStyle, inputFocusStyle)}
                          onBlur={(e) => Object.assign(e.target.style, inputBaseStyle)}
                      />
                      <button type="submit" style={primaryButtonStyle}>
                          Verify OTP
                      </button>
                      <button type="button" onClick={() => { setGoogleFlowStep('email'); setMessage(''); }} style={{ ...primaryButtonStyle, background: '#ccc', color: '#333', marginTop: '10px' }}>
                          Back to Email
                      </button>
                  </form>
              )}
            </>
        )}

        {message && <p style={errorStyle}>{message}</p>}

        {/* Signup links only visible in default login view */}
        {googleFlowStep === 'default' && (
          <>
            <p style={signupText}>
              Don’t have an account?{" "}
              <Link to="/signup" style={signupLink}>
                Sign up
              </Link>
            </p>
            <p style={signupText}><Link to="/forgot-password" style={signupLink}>Forgot password?</Link></p>
          </>
        )}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// 3. MOCK DASHBOARD COMPONENTS
// ------------------------------------------------------------------

const DashboardContainerStyle = {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#e8f0ff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    textAlign: "center"
};

const DashboardTitleStyle = {
    fontSize: "36px",
    color: "#1976d2",
    marginBottom: "20px"
};

const LogoutButton = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("userId");
        navigate("/");
    };
    return (
        <button onClick={handleLogout} style={{ ...primaryButtonStyle, background: '#d32f2f', marginTop: '30px' }}>
            Logout
        </button>
    );
};

const UserDashboard = () => (
    <div style={DashboardContainerStyle}>
        <h1 style={DashboardTitleStyle}>User Dashboard</h1>
        <p style={{ fontSize: "18px", color: "#555", marginBottom: "30px" }}>Welcome, regular user (Mock ID: {localStorage.getItem("userId")})!</p>
        <LogoutButton />
    </div>
);

const AdminDashboard = () => (
    <div style={DashboardContainerStyle}>
        <h1 style={DashboardTitleStyle}>Admin Dashboard</h1>
        <p style={{ fontSize: "18px", color: "#555", marginBottom: "30px" }}>Welcome, administrator (Mock ID: {localStorage.getItem("userId")})!</p>
        <LogoutButton />
    </div>
);


// ------------------------------------------------------------------
// 4. APPLICATION ROOT (Wraps components in Router)
// ------------------------------------------------------------------

const App = () => {
    return (
        <BrowserRouter> 
            <Routes>
                {/* Route for the login page, where Login is rendered */}
                <Route path="/" element={<Login />} /> 
                
                {/* Mock pages for navigation targets */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/userdashboard" element={<UserDashboard />} />
                <Route 
                    path="/signup" 
                    element={
                        <div style={DashboardContainerStyle}>
                            <h1 style={DashboardTitleStyle}>Sign Up Page</h1>
                            <p style={{ fontSize: "18px", color: "#555", marginBottom: "30px" }}>Sign up functionality would go here.</p>
                            <Link to="/" style={signupLink}>Go to Login</Link>
                        </div>
                    } 
                />
                <Route 
                    path="/forgot-password" 
                    element={
                        <div style={DashboardContainerStyle}>
                            <h1 style={DashboardTitleStyle}>Forgot Password</h1>
                            <p style={{ fontSize: "18px", color: "#555", marginBottom: "30px" }}>Password recovery functionality would go here.</p>
                            <Link to="/" style={signupLink}>Go to Login</Link>
                        </div>
                    } 
                />
            </Routes>
        </BrowserRouter>
    );
};


// -------------------- GLOBAL STYLES (Used by Login component) --------------------
const containerStyle = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f4f6f9",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  width:"100%" // Kept responsive width
};

const cardStyle = {
  background: "#fff",
  padding: "40px",
  borderRadius: "10px",
  width: "380px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
  textAlign: "center",
};

const titleStyle = {
  marginBottom: "10px",
  fontSize: "26px",
  fontWeight: "600",
  color: "#1976d2",
};

const subtitleStyle = {
  marginBottom: "25px",
  fontSize: "14px",
  color: "#555",
};

const errorStyle = {
  marginTop: "15px",
  fontSize: "13px",
  color: "#d32f2f",
  textAlign: "center",
};

const signupText = {
  marginTop: "20px",
  fontSize: "14px",
  color: "#333",
};

const signupLink = {
  color: "#1976d2",
  textDecoration: "none",
  fontWeight: "600",
};

export default App;
