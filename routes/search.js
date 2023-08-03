import express from "express";
import { JSDOM } from "jsdom";

const router = express.Router();

router.get("/", async (req, res) => {
  const query = req.query.q;
  const dateStart = req.query.start;
  const dateEnd = req.query.end;
  if (!query) {
    res.status(400);
    res.json({ status: "error", message: "no query received" });
  }
  const targetURL = `https://nitter.net/search?f=tweets&q=${query}&e-nativeretweets=on&since=${
    dateStart ?? ""
  }&until=${dateEnd ?? ""}`;
  const response = await fetch(targetURL);
  const html = await response.text();
  const allTweetData = getTweetsFromMarkup(html, query);
  res.json(allTweetData);
});

function getTweetsFromMarkup(html, query) {
  const { document } = new JSDOM(html).window;

  const allTweetData = [];
  const tweetEls = document.querySelectorAll(".timeline-item");

  tweetEls.forEach((tweet) => {
    const tweetData = {};
    const tweetText = tweet.querySelector("div.tweet-content").textContent;
    if (!tweetText.includes(query)) {
      return;
    }
    let link = tweet.querySelector("a.tweet-link").getAttribute("href");
    const userHandle = tweet.querySelector(".username").textContent;
    const date = tweet.querySelector(".tweet-date>a").getAttribute("title");
    const replyingTo = Array.from(
      tweet.querySelectorAll("div.replying-to>a")
    ).map((userNode) => userNode.textContent);

    if (link) {
      link = link.replace("#m", "");
      const linkSegments = link.split("/");
      const id = linkSegments[linkSegments.length - 1];
      tweetData.id = id;
      const fullLink = `https://twitter.com${link}`;
      tweetData.link = fullLink;
    }

    tweetText ? (tweetData.text = tweetText) : null;
    replyingTo.length ? (tweetData.replyingTo = replyingTo) : null;
    userHandle ? (tweetData.user = userHandle) : null;
    date ? (tweetData.publishDate = date) : null;
    allTweetData.push(tweetData);
  });
  return allTweetData;
}

export default router;
