import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { connectdb } from "./db/db.js";

dotenv.config();

try {
  await connectdb();

  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  // Health check
  app.get("/", (req, res) => {
    res.json({ message: "LeadDesk Mini API is running!" });
  });

  // Routes
  app.use("/api/user", userRoutes);
  app.use("/api/auth", authRoutes);

  // Global error handler
  app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).json({
      status: "error",
      message: err.message || "Internal server error",
    });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.log(error);
}
