import express from "express";
import router from "./routes/api";
import cors from "cors";

const app = express();

// Allow requests only from the frontend
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use("/api", router);

export default app;