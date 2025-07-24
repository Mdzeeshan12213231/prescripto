import mongoose from "mongoose";

// Make sure your .env contains:
// MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
// Do NOT add /prescripto or ?w=majority/prescripto in the URI. The code below will append /prescripto automatically.

const connectDB = async () => {
    mongoose.connection.on('connected', () => console.log("Database Connected"))
    await mongoose.connect(`${process.env.MONGODB_URI}/prescripto`)
}

export default connectDB;

// Do not use '@' symbol in your database user's password else it will show an error.