import express from "express";
import microdataParse from "micro-parse";
import { buildTweetCollection } from "../utils/processing.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(400).send(`user handle required: /profile/{handle}`);
  next();
});

router.get("/raw/:handle", async (req, res) => {
  const response = await fetch(`https://twitter.com/${req.params.handle}`, {
    headers: {
      "User-Agent": "ReaderBot",
    },
  });

  const htmlText = await response.text();
  res.send(htmlText);
});

router.get("/parsed/:handle", async (req, res) => {
  const response = await fetch(`https://twitter.com/${req.params.handle}`, {
    headers: {
      "User-Agent": "ReaderBot",
    },
  });

  const htmlText = await response.text();
  const parsedMetadata = microdataParse(htmlText);

  res.json(parsedMetadata);
});

router.get("/:handle", async (req, res) => {
  const response = await fetch(`https://twitter.com/${req.params.handle}`, {
    headers: {
      "User-Agent": "ReaderBot",
    },
  });

  const htmlText = await response.text();
  const parsedMetadata = microdataParse(htmlText);
  const profileTweetCollection = buildTweetCollection(parsedMetadata)[0];
  res.json(profileTweetCollection);
});

export default router;
