(function () {
  const { escapeHTML, localized } = window.AFUtils;

  function productCard(product, ctx, options = {}) {
    const lang = ctx.state.lang;
    const category = ctx.categoryById(product.category);
    const inWishlist = ctx.state.wishlist.includes(product.id);
    const image = product.images && product.images[0] ? product.images[0] : "";
    const badge = localized(product.badge, lang);
    const name = localized(product.name, lang);
    const description = localized(product.description, lang);
    const compact = options.compact ? " product-card--compact" : "";

    return `
      <article class="product-card glass-card hover-tilt${compact}" data-product-card data-product-id="${escapeHTML(product.id)}">
        <a class="product-card__media" href="product.html?id=${encodeURIComponent(product.id)}" aria-label="${escapeHTML(name)}">
          <img loading="lazy" src="${escapeHTML(image)}" alt="${escapeHTML(name)}">
          <span class="product-card__shine" aria-hidden="true"></span>
          ${badge ? `<span class="badge">${escapeHTML(badge)}</span>` : ""}
          <span class="category-chip" style="--chip:${escapeHTML(category ? category.accent : ctx.state.accent)}">${escapeHTML(category ? localized(category.name, lang) : product.category)}</span>
        </a>
        <div class="product-card__body">
          <div class="product-card__meta">
            <span class="rating">${window.AFIcons.icon("star")} ${product.rating}</span>
            <span>${product.reviews} ${ctx.t("labels.reviews")}</span>
          </div>
          <h3><a href="product.html?id=${encodeURIComponent(product.id)}">${escapeHTML(name)}</a></h3>
          <p>${escapeHTML(description)}</p>
          <div class="price-row">
            <strong>${ctx.money(product.price)}</strong>
            ${product.oldPrice ? `<del>${ctx.money(product.oldPrice)}</del>` : ""}
          </div>
          <div class="card-actions">
            <button class="btn btn-primary" data-action="add-cart" data-product-id="${escapeHTML(product.id)}">
              ${window.AFIcons.icon("cart")} <span>${ctx.t("actions.addToCart")}</span>
            </button>
            <button class="icon-btn ${inWishlist ? "is-active" : ""}" data-action="toggle-wishlist" data-product-id="${escapeHTML(product.id)}" title="${ctx.t("nav.wishlist")}">
              ${window.AFIcons.icon("wishlist")}
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function skeletonCards(count = 8) {
    return Array.from({ length: count })
      .map(
        () => `
          <article class="product-card glass-card skeleton-card">
            <span class="skeleton skeleton-img"></span>
            <span class="skeleton skeleton-line"></span>
            <span class="skeleton skeleton-line short"></span>
            <span class="skeleton skeleton-button"></span>
          </article>
        `
      )
      .join("");
  }

  window.AFProductCard = { productCard, skeletonCards };
})();
