import express from "express";
import google from "./auth/google";
import facebook from "./auth/facebook";

const auth = express.Router();

// Use Provider Routes
auth.use("/google", google);
auth.use("/facebook", facebook)

export default auth;
