import { createClient } from "redis";

export async function fetchMarkup(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "ReaderBot",
    },
  });

  return await response.text();
}

export async function createRedisClient() {
  const client = createClient({
    url: process.env.REDIS_URL,
  });
  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();
  return client;
}

export async function disconnectRedisClient(client) {
  return await client.quit();
}

export async function isAuthorized(id, client) {
  const key = id.toString();
  try {
    const keyExists = await client.exists(key);
    if (keyExists) {
      await client.incr(key);
    }
    return keyExists;
  } catch (err) {
    console.log(err);
  }
}

export async function isRateLimited(id, client) {
  const valueWasSet = await client.set(`rate-limit/${id}`, 0, {
    EX: 5,
    NX: true,
  });
  return !valueWasSet;
}

export async function screenRequest(id) {
  const screenStatus = { status: "Error", message: "" };
  try {
    const client = await createRedisClient();

    const [authStatus, rateLimitReached] = await Promise.all([
      isAuthorized(id, client),
      isRateLimited(id, client),
    ]);

    // const authStatus = await isAuthorized(id, client);
    if (!authStatus) {
      screenStatus.message = "Auth check failed";
      return screenStatus;
    }
    // const rateLimitStatus = await isRateLimited(id, client);
    if (rateLimitReached) {
      screenStatus.message =
        "Reached rate limit - please wait a few seconds before retrying";
      return screenStatus;
    }
  } catch (err) {
    console.log(err);
    screenStatus.message = err;
  }
  return screenStatus;
}
