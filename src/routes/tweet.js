import express from "express";
import microdataParse from "micro-parse";
import { buildTweetCollection, buildTweetTree } from "../utils/processing.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.status(400);
  res.send(`tweet id required: /tweet/{id}`);
});

router.get("/parsed/:id", async (req, res) => {
  const response = await fetch(
    `https://twitter.com/twitter/status/${req.params.id}`,
    {
      headers: {
        "User-Agent": "ReaderBot",
      },
    }
  );

  const htmlText = await response.text();

  const parsedMetadata = microdataParse(htmlText);
  res.json(parsedMetadata);
});

router.get("/raw/:id", async (req, res) => {
  const response = await fetch(
    `https://twitter.com/twitter/status/${req.params.id}`,
    {
      headers: {
        "User-Agent": "ReaderBot",
      },
    }
  );

  const htmlText = await response.text();
  res.send(htmlText);
});

router.get("/:id", async (req, res) => {
  const response = await fetch(
    `https://twitter.com/twitter/status/${req.params.id}`,
    {
      headers: {
        "User-Agent": "ReaderBot",
      },
    }
  );

  const htmlText = await response.text();
  const parsedMetadata = microdataParse(htmlText);
  const tweetCollection = buildTweetCollection(parsedMetadata);
  const tweetTree = buildTweetTree(...tweetCollection);
  res.json(tweetTree);
});

export default router;
