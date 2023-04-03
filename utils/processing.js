export function buildTweetCollection(parsedMetadata) {
  const tweetCollection = [];
  const tweetMap = {};

  parsedMetadata?.children?.forEach((tweet) => {
    const tweetData = {
      content: {},
      author: {},
    };
    const tweetURL = tweet.metadata.url;
    // const {url: tweetURL, articleBody, isBasedOn: quotedTweet, commentCount, contentRating} = tweet.metadata

    for (let metaKey in tweet.metadata) {
      const metaVal = tweet.metadata[metaKey];

      // switch (metaKey) {
      //   case "articleBody":
      //     tweetData.content.text = metaVal;
      //     break;
      //   case "isBasedOn":
      //     tweetData.content.quotedTweet = metaVal;
      //     break;
      //   case "commentCount":
      //     break;
      //   case "isPartOf":
      //     metaKey = "replyTo";
      //   case "identifier":
      //     metaKey = "tweetID";
      // }

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
        if (!url.includes(tweetURL)) {
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

    tweetCollection.push(tweetData);
    tweetMap[tweetURL] = tweetData;
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
