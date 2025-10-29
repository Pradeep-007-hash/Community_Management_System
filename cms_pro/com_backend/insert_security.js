import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const { hash } = bcrypt;

const uri = "mongodb+srv://2312034:Pradeep@pradeepdatabase.iszxesl.mongodb.net/?retryWrites=true&w=majority&appName=PradeepDatabase";
const client = new MongoClient(uri);

async function insertSecurityUser() {
  try {
    await client.connect();
    const db = client.db("community_db");

    // Check if security user already exists
    const existing = await db.collection("users").findOne({ username: "security" });
    if (existing) {
      console.log("Security user already exists.");
      return;
    }

    // Hash the password
    const hashedPassword = await hash("security123", 10);

    // Insert the security user
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
    console.log("Security user inserted successfully.");
    console.log("Username: security");
    console.log("Password: security123");

  } catch (err) {
    console.error("Error inserting security user:", err);
  } finally {
    await client.close();
  }
}

insertSecurityUser();
