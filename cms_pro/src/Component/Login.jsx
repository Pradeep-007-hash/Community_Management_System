import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "./AuthContext";

// API URL constant for the backend service
const API_URL = "http://localhost:5000";

// =================================================================
// MOCK useFirebase HOOK (Used to resolve compilation error)
// This simulates the check for Firebase initialization and user ID.
// =================================================================
const useFirebase = () => {
    const [authReady, setAuthReady] = useState(false);
    const [userId, setUserId] = useState(null);

    // Simulate initial authentication check delay
    useEffect(() => {
        const mockAuthCheck = setTimeout(() => {
            // In a real app, this would get the Firebase user ID.
            // Here, we provide a mock ID for placeholder purposes.
            setUserId(crypto.randomUUID());
            setAuthReady(true);
        }, 500);

        return () => clearTimeout(mockAuthCheck);
    }, []);

    return { userId, authReady };
};
// =================================================================

// Google SVG Icon (small, clean G)
const GoogleIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <path id="a" d="M44.5 20H24v8.5h11.8c-.7 4.3-3.6 7.6-8.2 9.5v5.5h6.3c3.9-3.6 6.3-8.8 6.3-15.7 0-1.8-.2-3.4-.6-5z"/>
    </defs>
    <clipPath id="b">
      {/* Changed xlinkHref to href for modern React SVG compatibility */}
      <use href="#a" overflow="visible"/>
    </clipPath>
    <path clipPath="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z"/>
    <path clipPath="url(#b)" fill="#EA4335" d="M0 11l17 13 7-6.1L4.6 4.4z"/>
    <path clipPath="url(#b)" fill="#34A853" d="M0 37l17-13-7 6.1-12.4 12.2z"/>
    <path clipPath="url(#b)" fill="#4285F4" d="M24 45.5c-.8 0-1.5-.1-2.2-.3-.1-.5-.2-1.1-.2-1.6 0-1.5.3-2.9.7-4.1-4.7-2-8.2-5.3-8.2-9.5V20H24v8.5h11.8c-.7 4.3-3.6 7.6-8.2 9.5v5.5h6.3c3.9-3.6 6.3-8.8 6.3-15.7 0-1.8-.2-3.4-.6-5z"/>
  </svg>
);


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  // Get the current user ID and auth status from mock Firebase context
  const { authReady } = useFirebase();

  // Handle OAuth callback on component mount
  useEffect(() => {
    const oauthSuccess = searchParams.get('oauth_success');
    const oauthError = searchParams.get('error');
    const userParam = searchParams.get('user');

    if (oauthSuccess && userParam) {
      try {
        const userData = JSON.parse(Buffer.from(userParam, 'base64').toString());
        setMessage("Google login successful!");
        login({ id: userData.id, role: userData.role });
        setTimeout(() => {
          if (userData.role === "admin") {
            navigate("/admin");
          } else if (userData.role === "security") {
            navigate("/securitydashboard");
          } else {
            navigate("/userdashboard");
          }
        }, 500);
      } catch (err) {
        console.error("Error parsing OAuth user data:", err);
        setMessage("Error processing Google login.");
      }
    } else if (oauthError) {
      setMessage("Google login failed. Please try again.");
    }
  }, [searchParams, login, navigate]);

  // Display a small loading message if Firebase hasn't finished its initial auth check
  if (!authReady) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <p style={{...subtitleStyle, color: '#1976d2'}}>Loading application context...</p>
        </div>
      </div>
    );
  }

  // Handler for Google OAuth sign in
  const handleGoogleSignIn = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  // ----------------- REAL ORIGINAL PASSWORD LOGIN HANDLER (Using fetch to local API) -----------------

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(""); 
    setLoading(true); 

    try {
      const res = await fetch(`${API_URL}/login`, { // Use API_URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        login({ id: data.user.id, role: data.user.role });

        setTimeout(() => { // Keep small timeout for UI smoothness
            if (data.user.role === "admin") {
                navigate("/admin");
            } else if (data.user.role === "security") {
                navigate("/securitydashboard");
            } else {
                navigate("/userdashboard");
            }
        }, 500);
      } else {
        setMessage(data.error || "Login failed. Check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("⚠️ Server error. Could not connect to API.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------- STYLES & DYNAMICS -----------------
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



  // ----------------- RENDER -----------------

 return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Welcome Back</h2>
        <p style={subtitleStyle}>Please sign in to continue</p>

        {/* GOOGLE SIGN IN BUTTON */}
        <button
          onClick={handleGoogleSignIn}
          style={googleButtonStyle}
          onMouseOver={(e) => Object.assign(e.currentTarget.style, googleButtonStyle, googleButtonHoverStyle)}
          onMouseOut={(e) => Object.assign(e.currentTarget.style, googleButtonStyle)}
          disabled={loading}
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
          <span style={{ margin: '0 10px', color: '#888' }}>OR</span>
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
            disabled={loading}
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
            disabled={loading}
          />

          <button type="submit" style={loading ? { ...buttonStyle, background: '#ccc' } : buttonStyle} disabled={loading}>
            {loading && username && password ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {message && <p style={errorStyle}>{message}</p>}

        <p style={signupText}>
          Don’t have an account?{" "}
          <Link to="/signup" style={signupLink}>
            Sign up
          </Link>
        </p>
        <p style={{color:"black", marginTop: '10px'}}><Link to="/forgot-password" style={signupLink}>forget password ?</Link></p>
      </div>
    </div>
  );
};

// -------------------- STYLES --------------------
const containerStyle = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f4f6f9",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  width:"1525px" 
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

const buttonStyle = {
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

// Custom Google button style to match a standard aesthetic
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



export default Login;
