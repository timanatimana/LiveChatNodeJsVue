import winston from "winston";

import ConstantDateFormat from "@server/constants/dateformat.constant";
import ConstantPath from "@server/constants/path.constant";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({
    format: ConstantDateFormat.YYYY_MM_DD_HH_MM_SS_MS,
  }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info: any) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: ConstantPath.LOGS_ERROR,
    level: "error",
  }),
  new winston.transports.File({ filename: ConstantPath.LOGS_ALL }),
];

const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default logger;
