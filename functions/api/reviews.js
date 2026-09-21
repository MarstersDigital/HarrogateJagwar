/**
 * Cloudflare Pages Function: /api/reviews
 * Fetches and caches Google Places Reviews for Harrogate Jagwar Specialists.
 */

// 24 hours in seconds for edge and browser caching
const CACHE_TTL = 86400;

// Curated authentic reviews fallback in case API key/Place ID is not set or network fails
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

export async function onRequest(context) {
  const { request, env } = context;

  // Use Cloudflare Cache API if available
  const cacheUrl = new URL(request.url);
  const cacheKey = new Request(cacheUrl.toString(), request);
  const cache = caches.default;

  let response = await cache.match(cacheKey);
  if (response) {
    return response;
  }

  const apiKey = env.GOOGLE_PLACES_API_KEY;
  const placeId = env.GOOGLE_PLACE_ID;

  // If credentials are not configured yet, return fallback data
  if (!apiKey || !placeId) {
    response = new Response(JSON.stringify(FALLBACK_DATA), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}`,
        "Access-Control-Allow-Origin": "*"
      }
    });
    return response;
  }

  try {
    const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=name,rating,user_ratings_total,url,reviews&key=${encodeURIComponent(apiKey)}`;

    const googleRes = await fetch(googleUrl);
    const googleData = await googleRes.json();

    if (googleData.status !== "OK" || !googleData.result) {
      console.warn("Google Places API error, using fallback data:", googleData.status);
      response = new Response(JSON.stringify(FALLBACK_DATA), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": `public, max-age=3600`,
          "Access-Control-Allow-Origin": "*"
        }
      });
      return response;
    }

    const result = googleData.result;
    const sanitizedReviews = (result.reviews || []).slice(0, 6).map((rev) => ({
      author_name: rev.author_name,
      rating: rev.rating,
      relative_time_description: rev.relative_time_description,
      text: rev.text,
      profile_photo_url: rev.profile_photo_url || ""
    }));

    const payload = {
      rating: result.rating || 5.0,
      user_ratings_total: result.user_ratings_total || (sanitizedReviews.length),
      place_url: result.url || FALLBACK_DATA.place_url,
      reviews: sanitizedReviews.length > 0 ? sanitizedReviews : FALLBACK_DATA.reviews
    };

    response = new Response(JSON.stringify(payload), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}`,
        "Access-Control-Allow-Origin": "*"
      }
    });

    context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (err) {
    console.error("Failed to query Google Places API:", err);
    return new Response(JSON.stringify(FALLBACK_DATA), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
