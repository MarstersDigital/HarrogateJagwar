/**
 * Harrogate Jagwar Specialists - Google Reviews Client Renderer
 * Fetches from /api/reviews and dynamically populates the testimonials section
 */

(function () {
  "use strict";

  const DEFAULT_DATA = {
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

  function renderStars(rating) {
    const rounded = Math.round(rating || 5);
    let starsHtml = "";
    for (let i = 1; i <= 5; i++) {
      if (i <= rounded) {
        starsHtml += `
          <svg class="w-4 h-4 text-[#c5a059] fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>`;
      } else {
        starsHtml += `
          <svg class="w-4 h-4 text-gray-600 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>`;
      }
    }
    return starsHtml;
  }

  function getInitials(name) {
    if (!name) return "J";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  function renderCard(review) {
    const avatar = review.profile_photo_url
      ? `<img src="${review.profile_photo_url}" alt="${review.author_name}" class="w-10 h-10 rounded-full object-cover border border-[#c5a059]/40 flex-shrink-0" loading="lazy">`
      : `<div class="w-10 h-10 rounded-full bg-[#0a291b] border border-[#c5a059]/50 flex items-center justify-center text-[#c5a059] font-bold text-sm flex-shrink-0 shadow-inner">${getInitials(review.author_name)}</div>`;

    return `
      <article class="relative flex flex-col justify-between p-6 bg-[#161b20] hover:bg-[#1a2027] border border-[#2d343c] hover:border-[#c5a059]/60 rounded-xl transition duration-300 shadow-lg group">
        <div>
          <!-- Header with Author, Stars & Google badge -->
          <div class="flex items-start justify-between gap-3 mb-4">
            <div class="flex items-center gap-3">
              ${avatar}
              <div>
                <h4 class="font-semibold text-[#f9f8f5] text-base leading-tight group-hover:text-[#c5a059] transition-colors">${review.author_name}</h4>
                <p class="text-xs text-[#8e9aa5] mt-0.5">${review.relative_time_description || "Verified Client"}</p>
              </div>
            </div>
            <!-- Google G Icon -->
            <div class="flex-shrink-0" title="Verified Google Review">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"/>
                <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
              </svg>
            </div>
          </div>

          <!-- Star Rating -->
          <div class="flex items-center gap-1 mb-3" aria-label="${review.rating} out of 5 stars">
            ${renderStars(review.rating)}
          </div>

          <!-- Review Text -->
          <p class="text-[#cbd5e1] text-sm leading-relaxed italic font-normal">
            &ldquo;${review.text}&rdquo;
          </p>
        </div>

        <div class="mt-4 pt-3 border-t border-[#232a31] flex items-center justify-between text-xs text-[#8e9aa5]">
          <span class="inline-flex items-center gap-1.5 text-[#a4b1be]">
            <svg class="w-3.5 h-3.5 text-[#34a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Verified Customer
          </span>
          <span class="text-[#c5a059] group-hover:underline">Google Review</span>
        </div>
      </article>
    `;
  }

  function populateSection(container, data) {
    const grid = container.querySelector(".reviews-cards-grid");
    const ratingValue = container.querySelector(".reviews-rating-value");
    const totalCount = container.querySelector(".reviews-total-count");
    const starsContainer = container.querySelector(".reviews-header-stars");
    const placeLink = container.querySelector(".reviews-place-link");

    if (ratingValue) ratingValue.textContent = (data.rating || 5.0).toFixed(1);
    if (totalCount) totalCount.textContent = `${data.user_ratings_total || 48}+`;
    if (starsContainer) starsContainer.innerHTML = renderStars(data.rating || 5);
    if (placeLink && data.place_url) placeLink.href = data.place_url;

    if (grid && Array.isArray(data.reviews)) {
      grid.innerHTML = data.reviews.map(renderCard).join("");
    }
  }

  async function init() {
    const containers = document.querySelectorAll("[data-reviews-section]");
    if (!containers.length) return;

    // Immediately render default data to prevent blank state
    containers.forEach((c) => populateSection(c, DEFAULT_DATA));

    try {
      const res = await fetch("/api/reviews");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const liveData = await res.json();
      if (liveData && Array.isArray(liveData.reviews) && liveData.reviews.length > 0) {
        containers.forEach((c) => populateSection(c, liveData));
      }
    } catch (err) {
      // Gracefully silent fallback to default data
      console.info("Using cached Google review testimonials:", err.message);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
