import express from "express";
import router from "./routes/api";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Allow requests only from the frontend
app.use(cors({ 
    origin: "https://localhost:5173", 
    credentials: true }));

// Middleware to parse JSON
app.use(express.json());

app.use(cookieParser());

// Routes
app.use("/api", router);

export default app;