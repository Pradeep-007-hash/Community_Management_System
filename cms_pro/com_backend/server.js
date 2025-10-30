import express, { json } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import multer from "multer";
import nodemailer from "nodemailer";
import crypto from "crypto";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import { sendNotification } from "./notification.js";

dotenv.config();

const { hash, compare } = bcrypt;
const { memoryStorage } = multer;
const { randomBytes } = crypto;

const app = express();

// ----------------- CORS Setup -----------------
const corsOptions = {
  origin: [
    "http://localhost:5173", // local development
    "https://meek-meringue-8cdb33.netlify.app", // production frontend URL
    // Add more production URLs as needed
  ],
  credentials: true,
};
app.use(cors(corsOptions));

// Session middleware for Passport
app.use(session({
  secret: 'your-session-secret', // Replace with a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id', // Replace with actual env var
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret', // Replace with actual env var
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists by Google ID
      let user = await db.collection("users").findOne({ googleId: profile.id });
      if (user) {
        return done(null, user);
      }
      // Check if user exists by email
      user = await db.collection("users").findOne({ email: profile.emails[0].value });
      if (user) {
        // Link Google ID to existing user
        await db.collection("users").updateOne(
          { _id: user._id },
          { $set: { googleId: profile.id } }
        );
        return done(null, user);
      }
      // Create new user
      const newUser = {
        googleId: profile.id,
        firstname: profile.name.givenName,
        lastname: profile.name.familyName,
        email: profile.emails[0].value,
        username: profile.emails[0].value.split('@')[0],
        role: "resident",
        status: "APPROVED",
        createdAt: new Date(),
      };
      const result = await db.collection("users").insertOne(newUser);
      newUser._id = result.insertedId;
      return done(null, newUser);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Serialize and Deserialize
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google Auth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/authttps://meek-meringue-8cdb33.netlify.app/h/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/Login?error=oauth_failed' }),
  async (req, res) => {
    // Successful authentication, redirect to frontend with user data
    const user = req.user;
    const userData = {
      id: user._id.toString(),
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      status: user.status,
      image: user.image || null,
    };

    // Encode user data as base64 to pass in URL
    const encodedUser = Buffer.from(JSON.stringify(userData)).toString('base64');
    res.redirect(`http://localhost:5173/Login?oauth_success=true&user=${encodedUser}`);
  });

app.use(json());
app.use(bodyParser.json()); // Ensure bodyParser is used

// ----------------- Multer setup for image uploads -----------------
const storage = memoryStorage();
const upload = multer({ storage: storage });

// ----------------- MongoDB CONNECTION -----------------
const uri = "mongodb+srv://2312034:Pradeep@pradeepdatabase.iszxesl.mongodb.net/?retryWrites=true&w=majority&appName=PradeepDatabase";
const client = new MongoClient(uri);

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("community_db");
    console.log("✅ MongoDB Connected!");

    // Insert security user if not exists
    const existing = await db.collection("users").findOne({ username: "security" });
    if (!existing) {
      const hashedPassword = await hash("security123", 10);
      const securityUser = {
        firstname: "Security",
        lastname: "Guard",
        username: "security",
        email: "security@community.com",
        phone: "1234567890",
        password: hashedPassword,
        role: "security",
        status: "APPROVED",
        createdAt: new Date(),
      };
      await db.collection("users").insertOne(securityUser);
      console.log("✅ Security user inserted successfully.");
      console.log("Username: security");
      console.log("Password: security123");
    } else {
      console.log("Security user already exists.");
    }
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
}
connectDB();

// ----------------- Nodemailer Setup (CRITICAL: UPDATE THIS!) -----------------
// You MUST replace these with your actual email service credentials 
// (e.g., Gmail App Password). The server WILL fail if these are generic.
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: 'athulpalanichamy076@gmail.com', // <-- REPLACE THIS
        pass: 'jrlr kwjc ddbb zgff' // <-- REPLACE THIS
    }
});
// ------------------------------------------------------------------------------------------------

// Utility function to generate a 6-digit OTP
function generateOTP() {
    return (randomBytes(4).readUInt32LE(0) % 1000000).toString().padStart(6, '0');
}


// ----------------- OTP LOGIN & FORGET PASSWORD APIs -----------------

// POST - Generates OTP and sends it to the user's email (Used by frontend Login.jsx for 'Email OTP' flow)
app.post("/api/generate-otp", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required to generate OTP." });
    }

    try {
        // 1. Find the user by email
        const user = await db.collection("users").findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "Email not registered." });
        }

        // 2. Generate a new OTP and set expiry time (e.g., 5 minutes)
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

        // 3. Store the OTP in a temporary collection (linking it to the user)
        // Ensure old tokens are cleaned up to avoid confusion, though findOne/sort helps.
        await db.collection("otp_tokens").deleteMany({ email }); // Clean old tokens
        await db.collection("otp_tokens").insertOne({
            email,
            otp,
            expiresAt,
            userId: user._id.toString(),
            createdAt: new Date(),
        });
        
        // 4. Send the OTP via email
        const mailOptions = {
    from: 'Your Community App <YOUR_EMAIL@gmail.com>',
    to: email,
    subject: 'Community App OTP Verification',
    // ⬇️ ADD A PLAIN TEXT VERSION HERE ⬇️
    text: `Your Community App OTP is: ${otp}. This code is valid for 5 minutes.`,
    
    // Your HTML content remains the same
    html: `
        <p>🎊 Hello there!</p>
        <p>🎉 Welcome back to the Community Management System. We received a request to log in to your account.</p>
        <p style="font-size: 20px; color: #1976d2; background: #f4f6f9; padding: 15px; border-radius: 8px; text-align: center;">
            Your One-Time Password (OTP) is: <strong>${otp}</strong>
        </p>
        <p>This code is valid for <strong>5 minutes</strong>. Please enter it on the login screen to continue.</p>
        <p style="margin-top: 30px; color: #888;">
            If you didn't request this code, please ignore this email.
        </p>
        <p>
            Thank you,<br>
            The Community Management System Team 🤝
        </p>
    `
};

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: "✅ OTP sent successfully! Check your inbox." });

    } catch (err) {
        console.error("❌ Error generating or sending OTP:", err);
        if (err.code === 'EENVELOPE' || err.code === 'EAUTH') {
             res.status(500).json({ error: "Server error: Failed to send email. Check Nodemailer credentials/config." });
        } else {
             res.status(500).json({ error: "Server error during OTP generation." });
        }
    }
});

// POST - Verifies OTP and performs LOGIN (Matches frontend Login.jsx /api/verify-otp call)
app.post("/api/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP are required for login verification." });
    }

    try {
        // 1. Find the most recent, unexpired OTP for this email
        const tokenEntry = await db.collection("otp_tokens").findOne(
            { 
                email, 
                otp, 
                expiresAt: { $gt: new Date() } // Must be greater than current time
            },
            { sort: { createdAt: -1 } } // Get the newest one
        );

        if (!tokenEntry) {
            return res.status(400).json({ success: false, message: "❌ Invalid or expired OTP." });
        }

        // 2. Find the user associated with the token
        const user = await db.collection("users").findOne({ _id: new ObjectId(tokenEntry.userId) });

        if (!user) {
            return res.status(404).json({ success: false, message: "User associated with OTP not found." });
        }

        // 3. Check for admin approval status (same as password login)
        if (user.role !== "admin" && user.status !== "APPROVED") {
            return res.status(403).json({ success: false, message: "⏳ Account pending admin approval." });
        }

        // 4. Invalidate the specific OTP token used after successful verification
        await db.collection("otp_tokens").deleteOne({ _id: tokenEntry._id });

        // 5. Successful Login
        res.status(200).json({
            success: true,
            message: "✅ OTP verified. Login successful!",
            user: {
                id: user._id.toString(),
                firstname: user.firstname,
                lastname: user.lastname,
                role: user.role,
                status: user.status,
            },
        });

    } catch (err) {
        console.error("❌ Error verifying OTP for login:", err);
        res.status(500).json({ success: false, message: "Server error during OTP verification." });
    }
});


// POST - Verifies OTP and resets the password (For Forget Password flow)
app.post("/api/reset-password", async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: "Email, OTP, and new password are required." });
    }

    try {
        // 1. Find the most recent, unexpired OTP for this email
        const tokenEntry = await db.collection("otp_tokens").findOne(
            { 
                email, 
                otp, 
                expiresAt: { $gt: new Date() } // Must be greater than current time
            },
            { sort: { createdAt: -1 } } // Get the newest one
        );

        if (!tokenEntry) {
            const expiredToken = await db.collection("otp_tokens").findOne({ email, otp });
            if (expiredToken) {
                 return res.status(400).json({ error: "❌ Invalid or expired OTP. Please request a new one." });
            }
             return res.status(400).json({ error: "❌ Invalid OTP. Please check the code." });
        }

        // 2. Hash the new password
        const hashedPassword = await hash(newPassword, 10);

        // 3. Update the user's password
        const result = await db.collection("users").updateOne(
            { email },
            { $set: { password: hashedPassword } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "User not found for password reset." });
        }

        // 4. Invalidate all OTPs for this email after a successful reset
        await db.collection("otp_tokens").deleteMany({ email });


        res.status(200).json({ message: "✅ Password reset successfully! You can now log in." });

    } catch (err) {
        console.error("❌ Error resetting password:", err);
        res.status(500).json({ error: "Server error during password reset." });
    }
});

/// ----------------- SIGNUP API -----------------
app.post("/signup", upload.single("photo"), async (req, res) => {
  const data = req.body;
  let imageData = null;
  if (req.file) imageData = req.file.buffer.toString("base64");

  try {
    // Check if username or email already exists
    const existing = await db.collection("users").findOne({
      $or: [{ username: data.username }, { email: data.email }]
    });

    if (existing) {
      return res.status(400).json({ error: "⚠️ Username or Email already exists" });
    }
    // Checking for floor_no and door_no already exists
    const existingFlat = await db.collection("users").findOne({
      floor_no: data.floor_no,
      door_no: data.door_no
    });
    if (existingFlat) {
      return res.status(400).json({ error: "⚠️ Floor No and Door No combination already exists" });
    }
    // Checking for email aleady exists
    const existingEmail = await db.collection("users").findOne({ email: data.email });
    if (existingEmail) {
      return res.status(400).json({ error: "⚠️ Email already exists" });
    }
    
    const hashedPassword = await hash(data.password, 10);
    const status = data.role === "admin" ? "APPROVED" : "PENDING";

    // Transform dynamic family_member fields into an array
    let familyMembers = [];
    const numMembers = Number(data.family_members) || 0;

    for (let i = 0; i < numMembers; i++) {
      const member = {
        name: data[`family_member_${i + 1}`] || "",
        age: data[`family_member_${i + 1}age`] || "",
        gender: data[`family_member_${i + 1}gender`] || "",
        occupation: data[`family_member_${i + 1}occupation`] || "",
        student_school: data[`family_member_${i + 1}student_school`] || "",
        student_school_name: data[`family_member_${i + 1}student_school_name`] || "",
        student_college: data[`family_member_${i + 1}student_college`] || "",
        student_college_name: data[`family_member_${i + 1}student_college_name`] || "",
        office_name: data[`family_member_${i + 1}office_name`] || ""
      };
      familyMembers.push(member);
    }

    await db.collection("users").insertOne({
      firstname: data.firstname,
      lastname: data.lastname,
      username: data.username,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      role: data.role,
      door_no: data.door_no,
      floor_no: data.floor_no,
      apartment: data.apartment,
      family_details: data.family_details,
      family_members: familyMembers,
      communication: data.communication,
      worker_type: data.worker_type,
      work: data.work,
      seperate_work: data.seperate_work,
      time: data.time,
      terms: data.terms === "true" || data.terms === true,
      status,
      image: imageData
    });

    res.status(201).json({ message: "✅ User registered successfully" });
  } catch (err) {
    console.error("❌ Signup Error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});


// ----------------- LOGIN API - Improved -----------------
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await db.collection("users").findOne({ username });
    
    // 1. Check if user exists
    if (!user) {
        return res.status(401).json({ error: "❌ Invalid username or password" });
    }

    // 2. Critical: Check for missing/invalid password field BEFORE bcrypt.compare()
    if (!user.password) {
        console.error(`❌ Data Error: User ${username} found but has no password field.`);
        return res.status(500).json({ error: "Server error: User record corrupt." });
    }
    
    // 3. Check for admin approval status
    if (user.role !== "admin" && user.status !== "APPROVED") {
      return res.status(403).json({ error: "⏳ Account pending admin approval" });
    }

    // 4. Compare password
    const isMatch = await compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "❌ Invalid username or password" });

res.json({
  message: "✅ Login successful",
  user: {
    id: user._id.toString(),
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    image: user.image || null,
  },
});
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});


// ----------------- ADMIN/USER Profile Management -----------------

// GET user profile by ID (ObjectId or username)
app.get("/user/profile/:id", async (req, res) => {
  const { id } = req.params;

  let query;
  if (ObjectId.isValid(id)) {
    query = { _id: new ObjectId(id) };
  } else {
    query = { username: id };
  }

  try {
    const user = await db.collection("users").findOne(
      query,
      { projection: { password: 0 } } // exclude password
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Server error while fetching user profile" });
  }
});

// PUT (UPDATE) user profile by username - Consolidated and cleaned the duplicate routes
app.put("/user/profile/:id", async (req, res) => {
  const { id } = req.params;
  console.log("PUT /user/profile/:id called with id:", id);

  try {
    const { firstname, lastname, email, phone, floor_no, door_no } = req.body;
    console.log("Update fields received:", { firstname, lastname, email, phone, floor_no, door_no });

    const updateFields = { firstname, lastname, email, phone, floor_no, door_no };

    // Remove undefined fields
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] === undefined) delete updateFields[key];
    });
    console.log("Filtered updateFields:", updateFields);

    const result = await db.collection("users").findOneAndUpdate(
      { username: id },
      { $set: updateFields },
      { returnDocument: "after" }
    );
    console.log("findOneAndUpdate result:", result);

    if (!result.value) {
      console.log("User not found for username:", id);
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      id: result.value.username,
      firstname: result.value.firstname,
      lastname: result.value.lastname,
      username: result.value.username,
      email: result.value.email,
      phone: result.value.phone,
      floor_no: result.value.floor_no,
      door_no: result.value.door_no,
      role: result.value.role,
      status: result.value.status,
      image: result.value.image || null
    });
  } catch (err) {
    console.error("Server error while updating profile:", err);
    res.status(500).json({ error: "Server error while updating profile: " + err.message });
  }
});

// ----------------- ADMIN MANAGEMENT ROUTES -----------------

// GET all users for admin view (kept for completeness)
app.get("/admin/users", async (req, res) => { 
    try {
        // Fetch all users. You can exclude sensitive fields like password.
        const users = await db.collection("users").find({})
            .project({ 
                password: 0, 
                family_details: 0, 
                family_members: 0, 
                communication: 0, 
                worker_type: 0, 
                work: 0, 
                seperate_work: 0, 
                time: 0, 
                terms: 0 
            })
            .toArray(); 
        
        res.json(users);

    } catch (err) {
        console.error("Error fetching all users for admin:", err);
        res.status(500).json({ error: "Server error fetching user list" });
    } 
});

// GET pending users (new functionality)
app.get("/pending-users", async (req, res) => {
    const adminUserId = req.headers["x-user-id"]; 
    
    if (!adminUserId || !ObjectId.isValid(adminUserId)) {
        return res.status(401).json({ error: "Unauthorized: Missing Admin ID" });
    }

    try {
        // 1. Authorization check
        const adminUser = await db.collection("users").findOne({ _id: new ObjectId(adminUserId) });
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Forbidden: Only admins can view pending users" });
        }

        // 2. Fetch pending users
        const pendingUsers = await db.collection("users").find({ status: "PENDING" })
            .project({ password: 0 }) 
            .toArray();

        res.json(pendingUsers);
    } catch (err) {
        console.error("Error fetching pending users:", err);
        res.status(500).json({ error: "Server error fetching pending user list" });
    }
});


// PUT Admin approves user by ID (New functionality)
app.put("/admin/approve/:id", async (req, res) => {
    const targetId = req.params.id;
    const adminUserId = req.headers["x-user-id"]; 

    if (!ObjectId.isValid(targetId)) return res.status(400).json({ error: "Invalid target user ID" });
    if (!adminUserId || !ObjectId.isValid(adminUserId)) return res.status(401).json({ error: "Unauthorized: Invalid or missing Admin ID" });

    try {
        // 1. Authorization check
        const adminUser = await db.collection("users").findOne({ _id: new ObjectId(adminUserId) });
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Forbidden: Only admins can approve users" });
        }

        // 2. Perform the update
        const result = await db.collection("users").updateOne(
            { _id: new ObjectId(targetId) },
            { $set: { status: "APPROVED" } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "User not found for approval" });
        }

        res.status(200).json({ message: "User approved successfully" });
    } catch (err) {
        console.error("Error approving user:", err);
        res.status(500).json({ error: "Server error during approval" });
    }
});

// DELETE Admin rejects/deletes user by ID (New functionality)
app.delete("/admin/reject/:id", async (req, res) => {
    const targetId = req.params.id;
    const adminUserId = req.headers["x-user-id"];

    if (!ObjectId.isValid(targetId)) return res.status(400).json({ error: "Invalid target user ID" });
    if (!adminUserId || !ObjectId.isValid(adminUserId)) return res.status(401).json({ error: "Unauthorized: Invalid or missing Admin ID" });

    try {
        // 1. Authorization check
        const adminUser = await db.collection("users").findOne({ _id: new ObjectId(adminUserId) });
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Forbidden: Only admins can reject/delete users" });
        }

        // 2. Perform the deletion
        const result = await db.collection("users").deleteOne({ _id: new ObjectId(targetId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "User not found for deletion" });
        }

        res.status(200).json({ message: "User rejected and deleted successfully" });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ error: "Server error during rejection/deletion" });
    }
});

// Alternative POST route for approval (filling the stub, expects ID in body)
app.post("/approve-user", async (req, res) => {
    const targetId = req.body.id;
    req.params.id = targetId; // Reuse the PUT logic by setting params
    req.method = 'PUT'; // Informative only, doesn't change Express flow
    // return await app.handle(req, res); // This is highly non-standard. Implementing direct logic instead.
    
    // Direct implementation logic (as above)
    const adminUserId = req.headers["x-user-id"]; 
    if (!targetId || !ObjectId.isValid(targetId)) return res.status(400).json({ error: "Invalid target user ID" });
    if (!adminUserId || !ObjectId.isValid(adminUserId)) return res.status(401).json({ error: "Unauthorized: Invalid or missing Admin ID" });

    try {
        const adminUser = await db.collection("users").findOne({ _id: new ObjectId(adminUserId) });
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Forbidden: Only admins can approve users" });
        }
        const result = await db.collection("users").updateOne(
            { _id: new ObjectId(targetId) },
            { $set: { status: "APPROVED" } }
        );
        if (result.matchedCount === 0) return res.status(404).json({ error: "User not found for approval" });
        res.status(200).json({ message: "User approved successfully via POST" });
    } catch (err) {
        console.error("Error approving user (POST):", err);
        res.status(500).json({ error: "Server error during POST approval" });
    }
});

// Alternative POST route for rejection (filling the stub, expects ID in body)
app.post("/reject-user", async (req, res) => {
    const targetId = req.body.id;
    
    const adminUserId = req.headers["x-user-id"];

    if (!targetId || !ObjectId.isValid(targetId)) return res.status(400).json({ error: "Invalid target user ID" });
    if (!adminUserId || !ObjectId.isValid(adminUserId)) return res.status(401).json({ error: "Unauthorized: Invalid or missing Admin ID" });

    try {
        const adminUser = await db.collection("users").findOne({ _id: new ObjectId(adminUserId) });
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Forbidden: Only admins can reject/delete users" });
        }
        const result = await db.collection("users").deleteOne({ _id: new ObjectId(targetId) });
        if (result.deletedCount === 0) return res.status(404).json({ error: "User not found for deletion" });
        res.status(200).json({ message: "User rejected and deleted successfully via POST" });
    } catch (err) {
        console.error("Error deleting user (POST):", err);
        res.status(500).json({ error: "Server error during POST rejection/deletion" });
    }
});

// GET admin user profile (filling the stub, identical to /user/profile/:id)
app.get("/admin/user/:id", async (req, res) => { 
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    try {
        const user = await db.collection("users").findOne(
          { _id: new ObjectId(id) },
          { projection: { password: 0 } }
        );
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error("Error fetching admin user profile:", err);
        res.status(500).json({ error: "Server error while fetching admin user profile" });
    }
});


// ----------------- EVENTS APIs -----------------

// Create event (admin or user with x-user-id) - Consolidated
app.post("/events", upload.single('eventImage'), async (req, res) => {
  const data = req.body;
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  // Validate required fields
  if (!data.title || !data.date || !data.startTime || !data.venue) {
    return res.status(400).json({ error: "Title, Date, Start Time, and Venue are required." });
  }

  // Validate date is not in the past
  const eventDate = new Date(data.date);
  if (isNaN(eventDate.getTime())) {
    return res.status(400).json({ error: "Invalid date format." });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  if (eventDate < today) {
    return res.status(400).json({ error: "Event date cannot be in the past." });
  }

  let imageData = null;
  if (req.file) {
    imageData = req.file.buffer.toString("base64");
  }

  const newEvent = {
    title: data.title,
    description: data.description,
    date: new Date(data.date),
    startTime: data.startTime,
    endTime: data.endTime,
    venue: data.venue,
    organizer: data.organizer,
    contact: data.contact,
    category: data.category,
    image: imageData,
    postedBy: userId, // Store the user ID as a string
    likes: [],
    comments: [],
    createdAt: new Date(),
  };

  try {
    const result = await db.collection("events").insertOne(newEvent);
    res.status(201).json({ ...newEvent, _id: result.insertedId });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET UPCOMING EVENTS (with poster info)
app.get("/events/upcoming", async (req, res) => {
  try {
    const events = await db.collection("events").aggregate([
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "poster"
        }
      },
      {
        $unwind: {
          path: "$poster",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          title: 1,
          description: 1,
          date: 1,
          startTime: 1,
          endTime: 1,
          venue: 1,
          organizer: 1,
          contact: 1,
          category: 1,
          image: 1,
          postedBy: 1,
          likes: 1,
          comments: 1,
          createdAt: 1,
          posterName: {
            $concat: ["$poster.firstname", " ", "$poster.lastname"]
          },
          posterImage: "$poster.image"
        }
      },
      {
        $sort: { date: 1 }
      }
    ]).toArray();
    res.json(events);
  } catch (err) {
    console.error("Error fetching upcoming events:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET PAST EVENTS (with poster info)
app.get("/events/past", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const events = await db.collection("events").aggregate([
      {
        $match: { date: { $lt: today } }
      },
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "poster"
        }
      },
      {
        $unwind: {
          path: "$poster",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          title: 1,
          description: 1,
          date: 1,
          startTime: 1,
          endTime: 1,
          venue: 1,
          organizer: 1,
          contact: 1,
          category: 1,
          image: 1,
          postedBy: 1,
          likes: 1,
          comments: 1,
          createdAt: 1,
          poster: {
            firstname: "$poster.firstname",
            lastname: "$poster.lastname",
            image: "$poster.image"
          }
        }
      },
      {
        $sort: { date: -1 }
      }
    ]).toArray();
    res.json(events);
  } catch (err) {
    console.error("Error fetching past events:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET single event (Kept for completeness)
app.get("/events/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid event ID" });

  try {
    const event = await db.collection("events").findOne({ _id: new ObjectId(id) });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.put("/events/:id", async (req, res) => {
    const eventId = req.params.id;
    const userId = req.headers["x-user-id"];
    const data = req.body;

    // 1. Basic ID Validation
    if (!ObjectId.isValid(eventId)) {
        return res.status(400).json({ error: "Invalid event ID format." });
    }
    if (!userId || !ObjectId.isValid(userId)) {
        return res.status(401).json({ error: "Unauthorized: Invalid or missing User ID." });
    }

    const eventObjectId = new ObjectId(eventId);
    const userObjectId = new ObjectId(userId);

    try {
        // 2. Fetch Event and User
        const event = await db.collection("events").findOne({ _id: eventObjectId });
        if (!event) return res.status(404).json({ error: "Event not found." });

        const user = await db.collection("users").findOne({ _id: userObjectId });
        if (!user) return res.status(404).json({ error: "User not found in database." });

        // 3. Authorization Check (CRITICAL)
        // Ensure both IDs are strings for reliable comparison
        const eventPosterIdString = String(event.postedBy);
        const userIdString = String(userId);

        const isOwner = eventPosterIdString === userIdString;
        const isAdmin = user.role === "admin";

        console.log(`Edit Attempt: User ID ${userIdString}, Event Poster ID ${eventPosterIdString}`);
        console.log(`Is Owner: ${isOwner}, Is Admin: ${isAdmin}`);

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: "Forbidden: Not the event owner or admin." });
        }

        // 4. Prepare Update Data
        const updateData = { ...data, updatedAt: new Date() };

        // CRITICAL: Ensure date is converted to a proper Date object and validate not in past
        if (data.date) {
            const dateObj = new Date(data.date);
            if (isNaN(dateObj.getTime())) {
                return res.status(400).json({ error: "Invalid date value provided." });
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dateObj.setHours(0, 0, 0, 0);

            if (dateObj < today) {
                return res.status(400).json({ error: "Event date cannot be in the past." });
            }

            updateData.date = dateObj;
        }

        // Clean up protected fields that should not be updated via PUT
        delete updateData.likes;
        delete updateData.comments;
        delete updateData.postedBy;
        delete updateData._id;

        // 5. Execute Update
        const result = await db.collection("events").updateOne(
            { _id: eventObjectId },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Event was not found for updating." });
        }

        // 6. Return the updated event (optional but good practice)
        const updatedEvent = await db.collection("events").findOne({ _id: eventObjectId });
        res.json(updatedEvent);

    } catch (err) {
        // Log the exact server error for debugging!
        console.error("❌ Critical Error updating event:", err);
        res.status(500).json({ error: "Server error during event update." });
    }
})

// DELETE EVENT - CONSOLIDATED ROUTE (Kept the robust version)
app.delete("/events/:id", async (req, res) => {
    const eventId = req.params.id;
    const userId = req.headers["x-user-id"]; 

    // 1. Validation for IDs
    if (!ObjectId.isValid(eventId)) {
        return res.status(400).json({ error: "Invalid event ID format." });
    }
    if (!userId || !ObjectId.isValid(userId)) {
        console.log("Unauthorized: Missing or Invalid User ID in header.");
        return res.status(401).json({ error: "Unauthorized: Invalid or missing User ID in header." });
    }

    try {
        // Find the event
        const event = await db.collection("events").findOne({ _id: new ObjectId(eventId) });
        if (!event) return res.status(404).json({ error: "Event not found." });

        // Find the user object to check their role
        const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
        
        if (!user) {
            console.error(`Deletion failed: User not found in 'users' collection for ID: ${userId}`);
            return res.status(404).json({ error: "Admin/User credentials not found in database." });
        }

        // 3. Authorization Check: Owner or Admin
        const eventPosterIdString = event.postedBy instanceof ObjectId ? event.postedBy.toString() : String(event.postedBy);

        const isOwner = eventPosterIdString === String(userId);
        const isAdminUser = user.role === "admin";

        console.log(`DELETE attempt: User Role: ${user.role}, Is Owner: ${isOwner}, Is Admin Check Result: ${isAdminUser}`);

        if (!isOwner && !isAdminUser) {
            return res.status(403).json({ error: "Forbidden: You must be the event owner or an admin to delete this." });
        }

        // 4. Perform Deletion
        const result = await db.collection("events").deleteOne({ _id: new ObjectId(eventId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Event was not deleted (possibly disappeared before deletion)." });
        }

        res.status(200).json({ message: "Event deleted successfully" });
    } catch (err) {
        console.error("Critical Error in delete route processing:", err);
        res.status(500).json({ error: "A server error occurred during deletion." });
    }
});

// --- LIKE/UNLIKE EVENT --- (unchanged)
app.post("/events/:id/like", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const event = await db.collection("events").findOne({ _id: new ObjectId(req.params.id) });
    if (!event) return res.status(404).json({ error: "Event not found" });

    let update;
    if (event.likes?.includes(userId)) {
      update = { $pull: { likes: userId } };
    } else {
      update = { $push: { likes: userId } };
    }

    await db.collection("events").updateOne(
      { _id: new ObjectId(req.params.id) },
      update
    );
    const updated = await db.collection("events").findOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true, likes: updated.likes });
  } catch (err) {
    res.status(500).json({ error: "Failed to like/unlike" });
  }
});

// --- COMMENT EVENT --- (unchanged)
app.post("/events/:id/comment", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { text } = req.body;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(404).json({ error: "User not found" });

    const comment = {
      userId,
      username: user.username || user.firstname || "Anonymous",
      text,
      createdAt: new Date(),
    };

    await db.collection("events").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $push: { comments: comment } }
    );
    res.json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});


// ----------------- LOST AND FOUND APIs -----------------

// GET all lost and found items
app.get("/lostandfound", async (req, res) => {
  try {
    const items = await db.collection("lostandfound").aggregate([
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "poster"
        }
      },
      {
        $unwind: {
          path: "$poster",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          type: 1,
          title: 1,
          description: 1,
          contact: 1,
          name: 1,
          image: 1,
          createdAt: 1,
          postedBy: 1,
          posterName: {
            $concat: ["$poster.firstname", " ", "$poster.lastname"]
          },
          posterImage: "$poster.image"
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray();
    res.json(items);
  } catch (err) {
    console.error("Error fetching lost and found items:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST create a new lost or found item
app.post("/lostandfound", upload.single('photo'), async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { type, title, description, contact, name } = req.body;
  if (!type || !title || !description || !contact || !name) {
    return res.status(400).json({ error: "All fields are required" });
  }

  let imageData = null;
  if (req.file) {
    imageData = req.file.buffer.toString("base64");
  }

  const newItem = {
    type,
    title,
    description,
    contact,
    name,
    postedBy: userId,
    image: imageData,
    createdAt: new Date(),
  };

  try {
    const result = await db.collection("lostandfound").insertOne(newItem);
    res.status(201).json({ ...newItem, _id: result.insertedId });
  } catch (err) {
    console.error("Error creating lost and found item:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE lost and found item (admin only)
app.delete("/lostandfound/:id", async (req, res) => {
  const itemId = req.params.id;
  const userId = req.headers["x-user-id"];

  if (!ObjectId.isValid(itemId)) {
    return res.status(400).json({ error: "Invalid item ID format." });
  }
  if (!userId || !ObjectId.isValid(userId)) {
    return res.status(401).json({ error: "Unauthorized: Invalid or missing User ID." });
  }

  try {
    // Find the user to check role
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Only admins can delete lost and found items." });
    }

    // Find and delete the item
    const result = await db.collection("lostandfound").deleteOne({ _id: new ObjectId(itemId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Item not found." });
    }

    res.status(200).json({ message: "Item deleted successfully." });
  } catch (err) {
    console.error("Error deleting lost and found item:", err);
    res.status(500).json({ error: "Server error during deletion." });
  }
});

// ----------------- VISITOR LOG APIs -----------------

// GET family details by door number
app.get("/family/:doorNo", async (req, res) => {
  const { doorNo } = req.params;
  try {
    const user = await db.collection("users").findOne(
      { door_no: doorNo },
      { projection: { family_members: 1, firstname: 1, lastname: 1, floor_no: 1 } }
    );
    if (!user) {
      return res.status(404).json({ error: "No family found for this door number" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching family details:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET all visitor entries
app.get("/visitors", async (req, res) => {
  try {
    const visitors = await db.collection("visitors").find({}).sort({ entryTime: -1 }).toArray();
    res.json(visitors);
  } catch (err) {
    console.error("Error fetching visitor logs:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST create a new visitor entry
app.post("/visitors", async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { name, contact, purpose, vehicleNumber, entryTime, doorNo } = req.body;
  if (!name || !contact || !purpose || !entryTime || !doorNo) {
    return res.status(400).json({ error: "Name, contact, purpose, entry time, and door number are required" });
  }

  const newVisitor = {
    name,
    contact,
    purpose,
    vehicleNumber: vehicleNumber || "",
    entryTime: new Date(entryTime),
    doorNo,
    loggedBy: userId,
    createdAt: new Date(),
  };

  try {
    const result = await db.collection("visitors").insertOne(newVisitor);

    // Send notification to the resident at the door number
    const resident = await db.collection("users").findOne({ door_no: doorNo });
    if (resident) {
      await sendNotification(resident._id.toString(), `A visitor named ${name} has arrived at your door (${doorNo}). Purpose: ${purpose}.`, "visitor");
    }

    res.status(201).json({ ...newVisitor, _id: result.insertedId });
  } catch (err) {
    console.error("Error creating visitor entry:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- DELIVERY LOG APIs -----------------

// GET all delivery entries
app.get("/deliveries", async (req, res) => {
  try {
    const deliveries = await db.collection("deliveries").find({}).sort({ deliveryTime: -1 }).toArray();
    res.json(deliveries);
  } catch (err) {
    console.error("Error fetching delivery logs:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET single delivery by ID
app.get("/deliveries/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid delivery ID" });

  try {
    const delivery = await db.collection("deliveries").findOne({ _id: new ObjectId(id) });
    if (!delivery) return res.status(404).json({ error: "Delivery not found" });
    res.json(delivery);
  } catch (err) {
    console.error("Error fetching delivery:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT update delivery status
app.put("/deliveries/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.headers["x-user-id"];

  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid delivery ID" });
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!status || !["Pending", "Received"].includes(status)) {
    return res.status(400).json({ error: "Invalid status. Must be 'Pending' or 'Received'" });
  }

  try {
    const result = await db.collection("deliveries").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    res.status(200).json({ message: "Delivery status updated successfully" });
  } catch (err) {
    console.error("Error updating delivery status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST create a new delivery entry
app.post("/deliveries", async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { senderName, senderContact, recipientDoorNo, itemDescription, deliveryTime, deliveryType } = req.body;
  if (!senderName || !senderContact || !recipientDoorNo || !itemDescription || !deliveryTime) {
    return res.status(400).json({ error: "Sender name, contact, recipient door number, item description, and delivery time are required" });
  }

  const newDelivery = {
    senderName,
    senderContact,
    recipientDoorNo,
    itemDescription,
    deliveryType: deliveryType || "Other",
    deliveryTime: new Date(deliveryTime),
    status: "Pending",
    loggedBy: userId,
    createdAt: new Date(),
  };

  try {
    const result = await db.collection("deliveries").insertOne(newDelivery);

    // Send notification to the resident at the door number
    const resident = await db.collection("users").findOne({ door_no: recipientDoorNo });
    if (resident) {
      await sendNotification(resident._id.toString(), `You have received a delivery: ${itemDescription} from ${senderName}. Please collect from security.`, "delivery");
    }

    // Send notification email to the user at the door number
    const user = await db.collection("users").findOne({ door_no: recipientDoorNo });
    if (user && user.email) {
      const mailOptions = {
        from: 'Your Community App <YOUR_EMAIL@gmail.com>',
        to: user.email,
        subject: 'Delivery Notification - Community Management System',
        html: `
          <p>Dear ${user.firstname} ${user.lastname},</p>
          <p>You have received a delivery at the security gate.</p>
          <p><strong>Delivery Details:</strong></p>
          <ul>
            <li><strong>Sender:</strong> ${senderName}</li>
            <li><strong>Sender Contact:</strong> ${senderContact}</li>
            <li><strong>Item Description:</strong> ${itemDescription}</li>
            <li><strong>Delivery Time:</strong> ${new Date(deliveryTime).toLocaleString()}</li>
          </ul>
          <p>Please collect your delivery from the security office.</p>
          <p>Thank you,<br>Community Management System Security Team</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Delivery notification sent to ${user.email}`);
    }

    res.status(201).json({ ...newDelivery, _id: result.insertedId });
  } catch (err) {
    console.error("Error creating delivery entry:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- ADMIN STATS APIs -----------------

// GET admin statistics for dashboard
app.get("/admin/stats", async (req, res) => {
  const adminUserId = req.headers["x-user-id"];

  if (!adminUserId || !ObjectId.isValid(adminUserId)) {
    return res.status(401).json({ error: "Unauthorized: Missing Admin ID" });
  }

  try {
    // 1. Authorization check
    const adminUser = await db.collection("users").findOne({ _id: new ObjectId(adminUserId) });
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Only admins can view stats" });
    }

    // 2. Fetch all approved users with family members
    const users = await db.collection("users").find({ status: "APPROVED" }).toArray();

    // 3. Calculate statistics
    let men = 0;
    let women = 0;
    let children = 0;

    users.forEach(user => {
      if (user.family_members && Array.isArray(user.family_members)) {
        user.family_members.forEach(member => {
          const age = parseInt(member.age);
          const gender = member.gender?.toLowerCase();

          if (age < 18) {
            children++;
          } else if (gender === 'male' || gender === 'm') {
            men++;
          } else if (gender === 'female' || gender === 'f') {
            women++;
          }
        });
      }
    });

    const total = men + women + children;

    // 4. Calculate house statistics
    const allDoorNos = await db.collection("users").distinct("door_no");
    const occupiedDoorNos = await db.collection("users").distinct("door_no", { status: "APPROVED" });
    const occupied = occupiedDoorNos.length;
    const empty = allDoorNos.length - occupied;

    res.json({
      men,
      women,
      children,
      total,
      occupied,
      empty,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- ANNOUNCEMENTS APIs -----------------

// GET all announcements
app.get("/announcements", async (req, res) => {
  try {
    const announcements = await db.collection("announcements").find({}).sort({ createdAt: -1 }).toArray();
    res.json(announcements);
  } catch (err) {
    console.error("Error fetching announcements:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST create a new announcement
app.post("/announcements", async (req, res) => {
  const { title, content } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const newAnnouncement = {
    title,
    content: content || "",
    createdAt: new Date(),
  };

  try {
    const result = await db.collection("announcements").insertOne(newAnnouncement);
    res.status(201).json({ ...newAnnouncement, _id: result.insertedId });
  } catch (err) {
    console.error("Error creating announcement:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET notifications for a user
app.get("/api/notifications/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!ObjectId.isValid(userId)) return res.status(400).json({ error: "Invalid user ID" });

  try {
    const notifications = await db.collection("notifications").find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray();
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- ROOT ROUTE -----------------
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// ----------------- SERVER START -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
