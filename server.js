#!/usr/bin/env node
/**
 * Lightweight local server & API endpoint for Harrogate Jagwar
 * Zero external dependencies: uses native Node.js http and fetch.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// Cache memory store
let cachedReviews = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const FALLBACK_DATA = {
  rating: 5.0,
  user_ratings_total: 48,
  place_url: "https://maps.google.com/?q=Harrogate+Jagwar+Specialists+HG3+2BX",
  reviews: [
    {
      author_name: "David Hirst",
      rating: 5,
      relative_time_description: "3 weeks ago",
      text: "Trevor and the team at Harrogate Jagwar are in a league of their own. Main dealer wanted £2,400 for a suspension rebuild — Trevor accurately diagnosed a worn valve block and saved me over half that cost. Exceptional knowledge, total honesty, and genuine pride in their work.",
      profile_photo_url: ""
    },
    {
      author_name: "Sarah Jenkins",
      rating: 5,
      relative_time_description: "a month ago",
      text: "Outstanding service from start to finish. Layla booked my F-Pace in quickly, kept me informed with clear estimates, and the car was handed back driving like brand new. Wonderful customer care and far more personal than any franchised dealership.",
      profile_photo_url: ""
    },
    {
      author_name: "Richard Cartwright",
      rating: 5,
      relative_time_description: "2 months ago",
      text: "I have trusted Trevor with my XKR and now my family's everyday cars for over 10 years. They look after generations of local motorists with the same meticulous standards. True craftsmanship and integrity.",
      profile_photo_url: ""
    }
  ]
};

async function getReviewsData() {
  const now = Date.now();
  if (cachedReviews && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedReviews;
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    cachedReviews = FALLBACK_DATA;
    cacheTimestamp = now;
    return cachedReviews;
  }

  try {
    const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=name,rating,user_ratings_total,url,reviews&key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(googleUrl);
    const data = await response.json();

    if (data.status !== "OK" || !data.result) {
      console.warn("Google Places API error, using fallback data:", data.status);
      cachedReviews = FALLBACK_DATA;
      cacheTimestamp = now;
      return cachedReviews;
    }

    const res = data.result;
    const sanitizedReviews = (res.reviews || []).slice(0, 6).map((rev) => ({
      author_name: rev.author_name,
      rating: rev.rating,
      relative_time_description: rev.relative_time_description,
      text: rev.text,
      profile_photo_url: rev.profile_photo_url || ""
    }));

    cachedReviews = {
      rating: res.rating || 5.0,
      user_ratings_total: res.user_ratings_total || sanitizedReviews.length,
      place_url: res.url || FALLBACK_DATA.place_url,
      reviews: sanitizedReviews.length > 0 ? sanitizedReviews : FALLBACK_DATA.reviews
    };
    cacheTimestamp = now;
    return cachedReviews;
  } catch (err) {
    console.error("Failed to query Google Places API:", err.message);
    return cachedReviews || FALLBACK_DATA;
  }
}

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  // Server-side route: /api/reviews
  if (parsedUrl.pathname === "/api/reviews") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
    const data = await getReviewsData();
    res.writeHead(200);
    res.end(JSON.stringify(data));
    return;
  }

  // Static files
  let safePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, "");
  if (safePath === "/" || safePath === "\\") {
    safePath = "/index.html";
  }

  const filePath = path.join(__dirname, safePath);
  const ext = path.extname(filePath).toLowerCase();

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }

    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Reviews API available at http://localhost:${PORT}/api/reviews`);
});
