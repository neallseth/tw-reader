import express from "express";
import microdataParse from "micro-parse";
import { buildTweetCollection, buildTweetTree } from "../utils/processing.js";
import { fetchMarkup } from "../utils/interservice.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(400);
  res.send(`tweet id required: /tweet/{id}`);
});

router.get("/parsed/:id", async (req, res) => {
  const htmlText = await fetchMarkup(
    `https://twitter.com/twitter/status/${req.params.id}`
  );

  const parsedMetadata = microdataParse(htmlText);
  res.json(parsedMetadata);
});

router.get("/raw/:id", async (req, res) => {
  const htmlText = await fetchMarkup(
    `https://twitter.com/twitter/status/${req.params.id}`
  );
  res.send(htmlText);
});

router.get("/:id", async (req, res) => {
  const htmlText = await fetchMarkup(
    `https://twitter.com/twitter/status/${req.params.id}`
  );
  const parsedMetadata = microdataParse(htmlText);
  const tweetCollection = buildTweetCollection(parsedMetadata);
  const tweetTree = buildTweetTree(...tweetCollection);
  res.json(tweetTree);
});

export default router;
