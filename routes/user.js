import express from "express";
import microdataParse from "micro-parse";
import { buildTweetCollection } from "../utils/processing.js";
import { fetchMarkup } from "../utils/interservice.js";
import { pullProfileData } from "../utils/metadata.js";

const router = express.Router();

router.get("/", (req, res) => {
  res
    .status(400)
    .send(`user handle required: /user/{handle} or /user/{handle}/replies`);
});

router.get("/raw/:handle", async (req, res) => {
  const htmlText = await fetchMarkup(
    `https://twitter.com/${req.params.handle}`
  );
  res.send(htmlText);
});

router.get("/parsed/:handle", async (req, res) => {
  const htmlText = await fetchMarkup(
    `https://twitter.com/${req.params.handle}`
  );
  const parsedMetadata = microdataParse(htmlText);

  res.json(parsedMetadata);
});

router.get("/:handle", async (req, res) => {
  const htmlText = await fetchMarkup(
    `https://twitter.com/${req.params.handle}`
  );
  const profileData = pullProfileData(htmlText);
  if (profileData) {
    res.json(profileData);
  } else {
    res
      .status(400)
      .json({ status: "error", message: "Profile data inaccessible" });
  }
});

router.get("/:handle/tweets", async (req, res) => {
  const htmlText = await fetchMarkup(
    `https://twitter.com/${req.params.handle}`
  );
  const parsedMetadata = microdataParse(htmlText);
  const profileTweetCollection = buildTweetCollection(parsedMetadata)[0];
  res.json(profileTweetCollection);
});

router.get("/raw/:handle/replies", async (req, res) => {
  const htmlText = await fetchMarkup(
    `https://twitter.com/${req.params.handle}/with_replies`
  );
  res.send(htmlText);
});

router.get("/parsed/:handle/replies", async (req, res) => {
  const htmlText = await fetchMarkup(
    `https://twitter.com/${req.params.handle}/with_replies`
  );
  const parsedMetadata = microdataParse(htmlText);

  res.json(parsedMetadata);
});

router.get("/:handle/replies", async (req, res) => {
  const htmlText = await fetchMarkup(
    `https://twitter.com/${req.params.handle}/with_replies`
  );
  const parsedMetadata = microdataParse(htmlText);
  const profileTweetCollection = buildTweetCollection(parsedMetadata)[0];
  res.json(profileTweetCollection);
});

export default router;
