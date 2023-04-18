import { raw } from "express";
import { parse } from "node-html-parser";

export function pullProfileData(html) {
  const rootNode = parse(html);

  const rawBaseData = rootNode.querySelectorAll(
    '[type="application/ld+json"]'
  )[1]?.innerText;

  if (!rawBaseData) {
    return;
  }

  const baseData = JSON.parse(rawBaseData);

  const { author } = baseData;

  const profileData = {
    accountCreatedDate: baseData.dateCreated,
    userSetName: author.givenName,
    handle: author.additionalName,
    bio: author.description,
    accountDisambiguator: author.disambiguatingDescription,
    location: author.homeLocation.name,
    userID: author.identifier,
    profileImage: {
      fullSize: author.image.contentUrl,
      thumbnail: author.image.thumbnailUrl,
    },
    profileURL: author.url,
    userContentRating: baseData.contentRating || "none",
  };

  for (let stat of author.interactionStatistic) {
    if (stat.name === "Follows") {
      profileData.followerCount = stat.userInteractionCount;
    } else if (stat.name === "Friends") {
      profileData.followingCount = stat.userInteractionCount;
    } else if (stat.name === "Tweets") {
      profileData.tweetCount = stat.userInteractionCount;
    }
  }

  return profileData;

  const profileURLSplit = rootNode
    .querySelector('[property="og:url"]')
    .getAttribute("content")
    .split("/");
  const userHandle = profileURLSplit[profileURLSplit.length - 1];

  const ogImageNode = rootNode.querySelector('[property="og:image"]');
  const ogDescriptionNode = rootNode.querySelector(
    '[property="og:description"]'
  );
  const followingNode = rootNode.querySelector(
    `a[href="/${userHandle}/following"]`
  );
  const followingCount = followingNode.innerText.split(" ")[0];

  const followersNode = rootNode.querySelector(
    `a[href="/${userHandle}/followers"]`
  );
  const followerCount = followersNode.innerText.split(" ")[0];

  profileData.userImage = ogImageNode.getAttribute("content");
  profileData.userBio = ogDescriptionNode.getAttribute("content");
  profileData.userHandle = userHandle;
  profileData.userFollowingCount = followingCount;
  profileData.userFollowerCount = followerCount;
  return profileData;
}
