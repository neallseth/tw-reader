import express from "express";
import { JSDOM } from "jsdom";
import { date30DaysAgo } from "../utils/general.js";

const router = express.Router();

// const nitterURL = 'https://nitter.net';
const nitterURL = "https://tweet.whateveritworks.org";

const volCountMap = {
  low: 1,
  med: 2,
  high: 3,
};

router.get("/", async (req, res) => {
  const query = req.query.q;
  const dateStart = req.query.start;
  const dateEnd = req.query.end;
  const vol = req.query.vol;
  if (vol && !Object.keys(volCountMap).includes(vol)) {
    res.status(400);
    res.json({ status: "error", message: "invalid data volume request" });
  }
  if (!query) {
    res.status(400);
    res.json({ status: "error", message: "no query received" });
  }
  const targetURL = `${nitterURL}/search?f=tweets&q=${query}&e-nativeretweets=on&since=${
    dateStart ?? date30DaysAgo()
  }&until=${dateEnd ?? ""}`;
  let tweetData;
  try {
    tweetData = await getTweetData(targetURL, query, volCountMap[vol] ?? 2);
  } catch (err) {
    console.error(err);
    res.status(500);
    res.json({ status: "error", message: err.toString() });
  }
  res.json(tweetData);
});

async function getTweetData(targetURL, query, pages = 2) {
  const finalTweetCollection = [];
  let url = targetURL;

  for (let curPage = 1; curPage <= pages && url; curPage++) {
    const [tweetData, nextURL] = await getTweetsFromURL(url, query);
    finalTweetCollection.push(...tweetData);
    url = nextURL ?? null;
  }

  return finalTweetCollection;
}

async function getTweetsFromURL(targetURL, query) {
  console.log("fetching: ", targetURL);
  const response = await fetch(targetURL);
  const html = await response.text();

  const { document } = new JSDOM(html).window;

  const tweetCollection = [];
  const tweetEls = document.querySelectorAll(".timeline-item:not(.show-more)");
  const nextPageLink = new URL(
    document.querySelector(".show-more>a")?.getAttribute("href"),
    `${nitterURL}/search`
  ).href;

  tweetEls.forEach((tweet) => {
    const tweetData = {};
    const tweetText = tweet.querySelector("div.tweet-content")?.textContent;
    // if (!tweetText.includes(query)) {
    //   return;
    // }
    let link = tweet.querySelector("a.tweet-link").getAttribute("href");

    const userHandle = tweet.querySelector(".username").textContent;
    const date = tweet.querySelector(".tweet-date>a").getAttribute("title");
    const replyingTo = Array.from(
      tweet.querySelectorAll("div.replying-to>a")
    ).map((userNode) => userNode.textContent);

    const commentCount = tweet
      .querySelector(".icon-comment")
      .parentNode.textContent.trim();

    const retweetCount = tweet
      .querySelector(".icon-retweet")
      .parentNode.textContent.trim();

    const quoteCount = tweet
      .querySelector(".icon-quote")
      .parentNode.textContent.trim();

    const likeCount = tweet
      .querySelector(".icon-heart")
      .parentNode.textContent.trim();

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
    date ? (tweetData.publishDate = date.replace("·", "-")) : null;
    tweetData.commentCount = commentCount || 0;
    tweetData.retweetCount = retweetCount || 0;
    tweetData.quoteCount = quoteCount || 0;
    tweetData.likeCount = likeCount || 0;

    tweetCollection.push(tweetData);
  });
  return [tweetCollection, nextPageLink];
}

export default router;
