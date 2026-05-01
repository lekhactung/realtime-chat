import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        //@ts.ignore
        await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
        console.log("Database connected");
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};