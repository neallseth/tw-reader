import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import TweetRouter from "./routes/tweet.js";
import UserRouter from "./routes/user.js";
import SearchRouter from "./routes/search.js";
import { keyCheck } from "./middleware/auth.js";

const port = process.env.PORT || 3000;

app.use(keyCheck);

app.use("/tweet", TweetRouter);
app.use("/user", UserRouter);
app.use("/search", SearchRouter);

app.get("*", async (req, res) => {
  res.status(400);
  res.json({
    appName: "Twitter Reader",
    services: [
      {
        endpoint: "/tweet/{id}",
        example: "/tweet/1359708562776330241",
        description:
          "Retrieve data for a particular tweet, along with its top replies - nested in their original tree structure",
        status:
          "active - though hierarchical replies no longer work (thanks elon :/)",
      },
      {
        endpoint: "/user/{handle}",
        example: "/user/dril",
        description: "Retrieve a user's profile and account information",
        status: "active",
      },
      {
        endpoint: "/user/{handle}/tweets",
        example: "/user/dril/tweets",
        description: "Retrieve a user's recent non-reply tweets",
        status: "active - works for most medium / large accounts",
      },
      {
        endpoint: "/user/{handle}/replies",
        example: "/user/dril/replies",
        description: "Retrieve a user's recent tweets, including replies",
        status: "deprecated - thanks elon :/",
      },
      {
        endpoint: "/search?q={query}&start={yyyy-mm-dd}&end={yyyy-mm-dd}",
        example: "/search?q=lk99",
        description:
          "Query recent tweets for a given string, optionally specify date range of tweet",
        status: "active",
      },
    ],
  });
});

app.listen(port, () => {
  console.log(`Twitter Reader API server listening on port ${port}`);
});
