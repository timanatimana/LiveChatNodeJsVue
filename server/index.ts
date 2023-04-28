import "module-alias/register";
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "@server/configs/db.config";
import logger from "@server/utils/logger.util";
import ErrorHandler from "./middlewares/errorHandler";

import authRoutes from "@server/routes/auth.route";
import chatmsgRoutes from "@server/routes/chatmsg.route";
import usersRoutes from "@server/routes/users.route";
import { authenticateToken } from "./middlewares/authToken";
import initializeSocketIO from "./configs/socketio.config";
import { createServer } from "http";

// load env variables
dotenv.config();

// initialize Express framework
let app: Express = express();
app.use(express.json());

const baseUrlClient =
  process.env.BASE_URL_CLIENT || "http://localhost:";
const baseUrlServer =
  process.env.BASE_URL_SERVER || "http://localhost:";
const serverApiPort = process.env.SERVER_API_PORT || 3000;
const clientApiPort = process.env.CLIENT_API_PORT || 4000;

const corsOptions = {
  origin: `${baseUrlClient}${clientApiPort}`,
};
app.use(cors(corsOptions));

// connect to db (MongoDB)
connectDb();

// add routes - some secured with token
app.use("/api/auth", authRoutes);
app.use("/api/chat", authenticateToken, chatmsgRoutes);
app.use("/api/users", authenticateToken, usersRoutes);

// register error handling middleware --> called with next()
app.use(ErrorHandler);

// page for default connection
app.get("/", (req: Request, res: Response) => {
  res.send(
    "<h1>Successfully connected to server backend of ----addev - live chat----</h1>"
  );
});

// initialize socket io
const server = createServer(app);
initializeSocketIO(server);

// endpoints
server.listen(serverApiPort, () => {
  logger.info(
    `⚡️[server]: Backend api and socketio server is running at ${baseUrlServer}${serverApiPort}`
  );
});

process.on("unhandledRejection", (error, promise) => {
  logger.error(`Logged Error: ${error}`);
  process.exit(1);
});

// nodemon termination signals
["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) =>
  process.on(signal, () => {
    process.kill(process.pid, signal);
  })
);
