import mongoose from "mongoose";

// Make sure your .env contains:
// MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
// Do NOT add /prescripto or ?w=majority/prescripto in the URI.

const connectDB = async () => {
    mongoose.connection.on('connected', () => console.log("✅ Database Connected Successfully"));
    mongoose.connection.on('error', (err) => console.error("❌ Database Connection Error:", err));
    mongoose.connection.on('disconnected', () => console.log("⚠️ Database Disconnected"));

    try {
        const options = {
            dbName: 'prescripto',
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(process.env.MONGODB_URI, options);

        if (mongoose.connection.readyState === 1) {
            console.log("✅ Database Connected Successfully");
        }
    } catch (error) {
        console.error("❌ Failed to connect to database:", error.message);
        process.exit(1);
    }
}

export default connectDB;

// Do not use '@' symbol in your database user's password else it will show an error.