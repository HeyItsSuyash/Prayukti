const mongoose = require('mongoose');
const dns = require('dns');

// Use Google DNS to bypass local network/ISP DNS issues causing querySrv ECONNREFUSED
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (error) {
    console.warn("Failed to set DNS servers:", error.message);
}

const connectDB = async (retries = 3, delay = 2000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Connecting to MongoDB (attempt ${attempt}/${retries})...`);
            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 30000,
                family: 4,
                maxPoolSize: 10,
                retryWrites: true,
                retryReads: true
            });
            console.log("MongoDB Connected successfully");
            return;
        } catch (err) {
            console.error(`Attempt ${attempt} failed:`, err.message);
            if (attempt < retries) {
                console.log(`Retrying in ${delay/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    console.error("CRITICAL: MongoDB Connection Failed after all retries!");
    console.log("Tip: Check if your IP is whitelisted in MongoDB Atlas.");
};

module.exports = connectDB;
