import { MongoClient, ObjectId } from "mongodb";

let db;

async function connectDB() {
  if (!db) {
    const uri = "mongodb+srv://2312034:Pradeep@pradeepdatabase.iszxesl.mongodb.net/?retryWrites=true&w=majority&appName=PradeepDatabase";
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db("community_db");
  }
  return db;
}

export async function sendNotification(userId, message, type) {
  try {
    const database = await connectDB();
    const notification = {
      userId: new ObjectId(userId),
      message,
      type, // 'visitor' or 'delivery'
      isRead: false,
      createdAt: new Date(),
    };
    await database.collection("notifications").insertOne(notification);
    console.log(`Notification sent to user ${userId}: ${message}`);
  } catch (err) {
    console.error("Error sending notification:", err);
  }
}
