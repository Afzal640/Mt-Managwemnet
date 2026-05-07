import mongoose from "mongoose";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

const connectDB = async () => {
  const dbURI = process.env.MONGO_URI;

  if (!dbURI) {
    console.error("MONGO_URI is not defined in .env file ❌");
    process.exit(1);
  }

  try {
    await mongoose.connect(dbURI, {
      family: 4, // Force IPv4 to resolve DNS issues (ECONNREFUSED)
    });
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.error("MongoDB Connection Error ❌:", error.message);
    if (error.message.includes("ECONNREFUSED")) {
      console.log("Tip: This often means your IP is not allowlisted in MongoDB Atlas or there is a DNS issue.");
    }
    process.exit(1);
  }
};

export default connectDB;