import {
  isAuthorized,
  isRateLimited,
  createRedisClient,
  disconnectRedisClient,
} from "../utils/interservice.js";
export const keyCheck = async (req, res, next) => {
  const { key } = req.query;
  if (!key) {
    res.status(401).json({ status: "Error", message: "No API key provided" });
    return;
  }

  const client = await createRedisClient();
  const [authorized, rateLimitReached] = await Promise.all([
    isAuthorized(key, client),
    isRateLimited(key, client),
  ]);

  if (!authorized) {
    res.status(401).json({ status: "Error", message: "Invalid API key" });
  } else if (rateLimitReached) {
    res.status(429).json({ status: "Error", message: "Rate limit reached" });
  } else {
    next();
  }

  disconnectRedisClient(client);
};
