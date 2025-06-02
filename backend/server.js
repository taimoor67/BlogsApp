import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createClient } from "redis";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());

const redisClient = createClient();
redisClient.on("error", (err) => {
  console.error("redis error", err);
});

(async () => {
  try {
    await redisClient.connect();
    console.log("redis connected");

    app.post("/signup", async (req, res) => {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: "Missing fields" });
      await redisClient.set(email, password);
      res.json({ message: "Signup successful" });
    });

    app.post("/login", async (req, res) => {
      const { email, password } = req.body;
      const storedPassword = await redisClient.get(email);
      if (storedPassword === password) {
        res.json({ message: "Login successful" });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to Redis", error);
    process.exit(1);
  }
})();