export const keyCheck = async (req, res, next) => {
  const { key } = req.query;
  if (!key) {
    res.status(401).json({ status: "Error", message: "Invalid API key" });
    return;
  }

  const response = await fetch(
    `https://redis-counter.vercel.app/api/get?id=${key}`
  );
  const keyLookup = await response.json();
  if (keyLookup.status === "Success") {
    fetch(`https://redis-counter.vercel.app/api/inc?id=${key}`);
    next();
  } else {
    res.status(401).json({ status: "Error", message: "Invalid API key" });
  }
};
