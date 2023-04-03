export async function fetchMarkup(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "ReaderBot",
    },
  });

  return await response.text();
}
