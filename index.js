import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import TweetRouter from "./routes/tweet.js";
import UserRouter from "./routes/user.js";
import { keyCheck } from "./middleware/auth.js";

const port = process.env.PORT || 3000;

app.use(keyCheck);

app.use("/tweet", TweetRouter);
app.use("/user", UserRouter);

app.get("*", async (req, res) => {
  res.status(400);
  res.json({
    appName: "Twitter Reader",
    services: [
      {
        endpoint: "/tweet/{id}",
        description:
          "Retrieve data for a particular tweet, along with its top replies - nested in their original tree structure",
      },
      {
        endpoint: "/user/{handle}",
        description: "Retrieve a user's profile and account information",
      },
      {
        endpoint: "/user/{handle}/tweets",
        description: "Retrieve a user's recent non-reply tweets",
      },
      {
        endpoint: "/user/{handle}/replies",
        description: "Retrieve a user's recent tweets, including replies",
      },
    ],
  });
});

app.listen(port, () => {
  console.log(`Twitter Reader API server listening on port ${port}`);
});
