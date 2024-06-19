import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `Db connected !! DB HOST :${connectionInstance.connection.host} `
    );
  } catch (error) {
    console.log("DB not connected");
    process.exit(1);
  }
};

export default connectDB;
