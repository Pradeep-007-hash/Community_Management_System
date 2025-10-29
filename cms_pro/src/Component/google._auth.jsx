import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Google SVG Icon (small, clean G)
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

// Define styles used in this component (copied from Login.jsx for consistency)
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

/**
 * @param {object} props
 * @param {'default'|'email'|'otp'} props.googleFlowStep - The current step of the Google sign-in flow.
 * @param {function(string): void} props.setGoogleFlowStep - Setter for the flow step state.
 * @param {function(string): void} props.setMessage - Function to display status messages in the parent Login component.
 */
const GoogleAuth = ({ googleFlowStep, setGoogleFlowStep, setMessage }) => {
    const [googleEmail, setGoogleEmail] = useState('');
    const [otp, setOtp] = useState('');
    const navigate = useNavigate();

    // Handler to initiate the custom Google/OTP flow
    const handleGoogleSignIn = () => {
        setMessage(""); // Clear messages in parent
        setGoogleFlowStep('email');
    };

    // Handler for submitting the email (to "generate" OTP)
    const handleEmailSubmit = (e) => {
        e.preventDefault();
        if (googleEmail) {
            // Mock: OTP is "generated" and user is moved to the next step
            setMessage(`⚠️ MOCK OTP: In a real app, an OTP would be sent to ${googleEmail}. Please use the mock code 123456 to proceed.`);
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
            setMessage("OTP verified. Successfully signed in!");
            localStorage.setItem("userId", "mock-google-user-id");
            // Simulate redirect to user dashboard
            setTimeout(() => {
                setGoogleFlowStep('default'); // Reset flow state
                setGoogleEmail('');
                setOtp('');
                navigate("/userdashboard"); 
            }, 1500);
        } else {
            setMessage("Invalid OTP. Please try again.");
        }
    };

    // Render the Google Sign-in button when in 'default' state
    if (googleFlowStep === 'default') {
        return (
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
        );
    }

    // Render the Email input form
    if (googleFlowStep === 'email') {
        return (
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
                <button type="submit" style={buttonStyle}>
                    Generate OTP
                </button>
                <button 
                    type="button" 
                    onClick={() => { setGoogleFlowStep('default'); setMessage(''); }} 
                    style={{ ...buttonStyle, background: '#ccc', color: '#333', marginTop: '10px' }}>
                    Cancel
                </button>
            </form>
        );
    }

    // Render the OTP input form
    if (googleFlowStep === 'otp') {
        return (
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
                <button type="submit" style={buttonStyle}>
                    Verify OTP
                </button>
                <button 
                    type="button" 
                    onClick={() => { setGoogleFlowStep('email'); setMessage(''); }} 
                    style={{ ...buttonStyle, background: '#ccc', color: '#333', marginTop: '10px' }}>
                    Back to Email
                </button>
            </form>
        );
    }
    
    // Fallback/Should not happen
    return null;
};

export default GoogleAuth;
