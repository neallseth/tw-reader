import express from "express";
const app = express();
import TweetRouter from "./routes/tweet.js";
import ProfileRouter from "./routes/profile.js";
import { keyCheck } from "./middleware/auth.js";
const port = process.env.PORT || 3000;

app.use(keyCheck);

app.use("/tweet", TweetRouter);
app.use("/profile", ProfileRouter);

app.get("*", (req, res) => {
  res.status(400);
  res.json({
    appName: "Twitter Reader",
    availableEndpoints: ["/tweet/{id}", "/profile/{handle}"],
  });
});

app.listen(port, () => {
  console.log(`Twitter Reader API server listening on port ${port}`);
});
