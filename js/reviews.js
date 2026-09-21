/**
 * Harrogate Jagwar Specialists - Google Reviews Client Renderer
 * Progressive enhancement: checks for live Google Places API data via /api/reviews
 * and seamlessly updates the testimonials section if available.
 */

(function () {
  "use strict";

  function renderStars(rating) {
    const rounded = Math.round(rating || 5);
    let starsHtml = "";
    for (let i = 1; i <= 5; i++) {
      if (i <= rounded) {
        starsHtml += `
          <svg class="reviews-star-icon" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>`;
      } else {
        starsHtml += `
          <svg class="reviews-star-icon" style="color: #4a5568;" viewBox="0 0 20 20" aria-hidden="true">
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
      ? `<img src="${review.profile_photo_url}" alt="${review.author_name}" class="review-avatar" loading="lazy">`
      : `<div class="review-avatar">${getInitials(review.author_name)}</div>`;

    return `
      <article class="review-card">
        <div>
          <!-- Header with Author, Stars & Google badge -->
          <div class="review-card-top">
            <div class="review-author-info">
              ${avatar}
              <div>
                <h4 class="review-author-name">${review.author_name}</h4>
                <p class="review-date">${review.relative_time_description || "Verified Client"}</p>
              </div>
            </div>
            <!-- Google G Icon -->
            <div class="review-google-badge" title="Verified Google Review">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"/>
                <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
              </svg>
            </div>
          </div>

          <!-- Star Rating -->
          <div class="review-card-stars" aria-label="${review.rating} out of 5 stars">
            ${renderStars(review.rating)}
          </div>

          <!-- Review Text -->
          <p class="review-text">
            &ldquo;${review.text}&rdquo;
          </p>
        </div>

        <div class="review-card-footer">
          <span class="review-verified-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Verified Customer
          </span>
          <span class="review-source-tag">Google Review</span>
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

    if (ratingValue && data.rating) ratingValue.textContent = Number(data.rating).toFixed(1);
    if (totalCount && data.user_ratings_total) totalCount.textContent = `${data.user_ratings_total}+`;
    if (starsContainer && data.rating) starsContainer.innerHTML = renderStars(data.rating);
    if (placeLink && data.place_url) placeLink.href = data.place_url;

    if (grid && Array.isArray(data.reviews) && data.reviews.length > 0) {
      grid.innerHTML = data.reviews.map(renderCard).join("");
    }
  }

  async function init() {
    const containers = document.querySelectorAll("[data-reviews-section]");
    if (!containers.length) return;

    // Only attempt fetch if online and served over HTTP/HTTPS
    if (location.protocol.indexOf("http") !== 0) {
      return;
    }

    try {
      const res = await fetch("/api/reviews");
      if (!res.ok) return;
      const liveData = await res.json();
      if (liveData && Array.isArray(liveData.reviews) && liveData.reviews.length > 0) {
        containers.forEach((c) => populateSection(c, liveData));
      }
    } catch {
      // Gracefully silent fallback to pre-rendered HTML cards
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
