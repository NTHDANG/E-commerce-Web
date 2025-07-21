import express from "express";
import path from "path";
import cors from "cors";
import { appRoute } from "./routes/appRoute.js";
import os from "os";
import cookieParser from "cookie-parser";
import db from "./models/index.js";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

db.sequelize
  .authenticate()
  .then(() => {
    console.log("Connection to supabase successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to supabase:", err);
  });

app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(500).send("Something broke!");
});

// Serve thư mục uploads dưới đường dẫn /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Cho phép frontend gọi API
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép nếu không có origin (VD: Postman) hoặc nằm trong danh sách
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Nếu không, chặn lại
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

appRoute(app);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../fe_tiki/dist")));

  // For any other requests, serve the frontend's index.html (SPA fallback)
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../fe_tiki/dist/index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
