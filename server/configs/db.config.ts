import mongoose from "mongoose";
import logger from "@server/utils/logger.util";

const connectDB = async () => {
  try {
    const connection: any = await mongoose.connect(process.env.MONGO_URI!);
    logger.info(`Mongo DB is connected to: ${connection.connection.host}`);
  } catch (error) {
    logger.error(`An error ocurred\n\r\n\r${error}`);
  }
};

export default connectDB;
