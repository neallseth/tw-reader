export function buildTweetCollection(parsedMetadata) {
  const tweetCollection = [];
  const tweetMap = {};

  function pullTweetData(tweet) {
    const tweetData = {
      content: {},
      author: {},
    };

    for (let metaKey in tweet.metadata) {
      const metaVal = tweet.metadata[metaKey];
      if (metaKey === "articleBody") {
        tweetData.content.text = metaVal;
        continue;
      }
      if (metaKey === "isBasedOn") {
        tweetData.content.quotedTweet = metaVal;
        continue;
      }
      if (metaKey === "commentCount" || metaKey === "position") {
        continue;
      }
      if (metaKey === "isPartOf") {
        metaKey = "replyTo";
      }
      if (metaKey === "identifier") {
        metaKey = "tweetID";
      }
      if (metaVal) {
        tweetData[metaKey] = metaVal;
      }
    }

    tweet.children.forEach((child) => {
      const { scope, metadata } = child;
      if (scope === "https://schema.org/SocialMediaPosting") {
        tweetData.content.retweet = pullTweetData(child);
        tweetData.isRetweet = true;
      }
      if (scope === "https://schema.org/Person") {
        const {
          identifier: id,
          additionalName: handle,
          givenName: selfName,
          disambiguatingDescription: disambiguatingDescriptor,
        } = metadata;
        tweetData.author = { id, handle, selfName, disambiguatingDescriptor };
      }
      if (scope === "https://schema.org/CreativeWork") {
        const { url } = metadata;
        if (!url.includes(tweet.metadata.url)) {
          tweetData.content.attachedURL = url;
        }
      }
      if (scope === "https://schema.org/InteractionCounter") {
        tweetData[metadata.name.toLowerCase() + "Count"] =
          metadata.userInteractionCount;
      }
      if (scope === "https://schema.org/ImageObject") {
        if (!tweetData.content.images) {
          tweetData.content.images = [];
        }
        const imageData = {};
        for (let metaKey in metadata) {
          let metaVal = metadata[metaKey];
          if (metaKey === "contentUrl") {
            metaKey = "imageURL";
          }
          if (metaKey === "thumbnailUrl") {
            metaKey = "thumbnailURL";
          }
          if (metaKey === "caption") {
            if (metaVal === "Image") {
              metaVal = "";
            } else {
              metaKey = "altText";
            }
          }
          if (metaVal) {
            imageData[metaKey] = metaVal;
          }
        }
        tweetData.content.images.push(imageData);
      }

      if (scope === "https://schema.org/VideoObject") {
        if (!tweetData.content.videos) {
          tweetData.content.videos = [];
        }
        const {
          caption,
          duration,
          embedUrl: embedURL,
          thumbnailUrl: thumbnailURL,
        } = metadata;

        const videoData = {
          caption,
          duration,
          embedURL,
          thumbnailURL,
        };

        tweetData.content.videos.push(videoData);
      }
    });

    return tweetData;
  }

  parsedMetadata?.children?.forEach((tweet) => {
    const tweetData = pullTweetData(tweet);
    tweetCollection.push(tweetData);
    tweetMap[tweet.metadata.url] = tweetData;
  });

  return [tweetCollection, tweetMap];
}

export function buildTweetTree(tweetCollection, tweetMap) {
  let rootTweet;
  tweetCollection.forEach((tweet) => {
    const parent = tweetMap[tweet.replyTo];
    if (!parent) {
      rootTweet = tweet;
    } else {
      if (parent.replies) {
        parent.replies.push(tweet);
      } else {
        parent.replies = [tweet];
      }
    }
  });

  return rootTweet;
}
