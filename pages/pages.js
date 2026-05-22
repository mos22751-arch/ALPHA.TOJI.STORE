(function () {
  const { escapeHTML, localized, productSearchText } = window.AFUtils;
  const { icon } = window.AFIcons;
  const { productCard, skeletonCards } = window.AFProductCard;

  function sectionTitle(title, body, eyebrow) {
    return `
      <div class="section-title reveal">
        ${eyebrow ? `<span class="eyebrow">${escapeHTML(eyebrow)}</span>` : ""}
        <h2>${escapeHTML(title)}</h2>
        ${body ? `<p>${escapeHTML(body)}</p>` : ""}
      </div>
    `;
  }

  function renderHero(ctx) {
    const hero = ctx.data.sections.hero;
    return `
      <section class="hero-section">
        <div class="hero-copy reveal">
          <span class="eyebrow">${escapeHTML(localized(hero.eyebrow, ctx.state.lang))}</span>
          <h1>${escapeHTML(localized(hero.title, ctx.state.lang))}</h1>
          <p>${escapeHTML(localized(hero.subtitle, ctx.state.lang))}</p>
          <div class="hero-actions">
            <a class="btn btn-primary btn-large" href="shop.html" data-transition>${icon("shop")} <span>${escapeHTML(localized(hero.primaryCta, ctx.state.lang))}</span></a>
            <a class="btn btn-ghost btn-large" href="offers.html" data-transition>${icon("offers")} <span>${escapeHTML(localized(hero.secondaryCta, ctx.state.lang))}</span></a>
          </div>
          <div class="stats-strip glass-card">
            ${hero.stats
              .map(
                (stat) => `
                  <span>
                    <strong>${escapeHTML(stat.value)}</strong>
                    <em>${escapeHTML(localized(stat.label, ctx.state.lang))}</em>
                  </span>
                `
              )
              .join("")}
          </div>
        </div>
        <div class="hero-visual reveal" data-parallax>
          <img src="${escapeHTML(hero.image)}" alt="${escapeHTML(localized(hero.title, ctx.state.lang))}">
          <div class="hero-glass glass-card">
            <span>${icon("sparkles")}</span>
            <strong>${ctx.money(ctx.data.products[0].price)}</strong>
            <em>${escapeHTML(localized(ctx.data.products[0].name, ctx.state.lang))}</em>
          </div>
          <div class="hero-metrics glass-card">
            <span>VO2</span>
            <strong>+18%</strong>
            <em>Adaptive training stack</em>
          </div>
        </div>
      </section>
    `;
  }

  function renderCategories(ctx, limit) {
    const categories = limit ? ctx.data.categories.slice(0, limit) : ctx.data.categories;
    return `
      <section class="section category-section">
        ${sectionTitle(ctx.t("pages.categoriesTitle"), localized(ctx.data.sections.story.body, ctx.state.lang))}
        <div class="category-grid">
          ${categories
            .map((category) => {
              const count = ctx.data.products.filter((product) => product.category === category.id).length;
              return `
                <a class="category-card glass-card hover-tilt reveal" href="shop.html?category=${encodeURIComponent(category.id)}" data-transition style="--cat:${escapeHTML(category.accent)}">
                  <img loading="lazy" src="${escapeHTML(category.image)}" alt="${escapeHTML(localized(category.name, ctx.state.lang))}">
                  <span class="category-icon">${icon(category.icon)}</span>
                  <strong>${escapeHTML(localized(category.name, ctx.state.lang))}</strong>
                  <p>${escapeHTML(localized(category.blurb, ctx.state.lang))}</p>
                  <em>${count} ${ctx.t("nav.shop")}</em>
                </a>
              `;
            })
            .join("")}
        </div>
      </section>
    `;
  }

  function renderShowcase(ctx) {
    const featured = ctx.data.products.slice(0, 3);
    return `
      <section class="showcase-section section">
        <div class="showcase-copy reveal">
          ${sectionTitle(localized(ctx.data.sections.showcase.title, ctx.state.lang), localized(ctx.data.sections.showcase.body, ctx.state.lang), ctx.state.lang === "ar" ? "اختيارات الجيم" : "Gym picks")}
          <div class="feature-list">
            <span>${icon("sparkles")} ${ctx.state.lang === "ar" ? "معدات للبيت والجيم" : "Home and gym gear"}</span>
            <span>${icon("theme")} ${ctx.state.lang === "ar" ? "مقاسات وألوان واضحة" : "Clear sizes and colors"}</span>
            <span>${icon("cart")} ${ctx.state.lang === "ar" ? "طلب سريع على واتساب" : "Fast WhatsApp order"}</span>
          </div>
        </div>
        <div class="showcase-stack">
          ${featured.map((product, index) => `<div class="stack-card reveal" style="--i:${index}">${productCard(product, ctx, { compact: true })}</div>`).join("")}
        </div>
      </section>
    `;
  }

  function renderProductsSection(ctx, title, products, actionHref = "shop.html") {
    return `
      <section class="section">
        <div class="title-row reveal">
          ${sectionTitle(title, ctx.t("labels.recommendations"))}
          <a class="btn btn-ghost" href="${actionHref}" data-transition>${icon("arrow")} <span>${ctx.t("actions.shopNow")}</span></a>
        </div>
        <div class="products-grid">
          ${products.map((product) => productCard(product, ctx)).join("")}
        </div>
      </section>
    `;
  }

  function renderOffersStrip(ctx) {
    return `
      <section class="section offers-strip">
        ${sectionTitle(ctx.t("pages.offersTitle"), localized(ctx.data.sections.hero.subtitle, ctx.state.lang))}
        <div class="offer-grid">
          ${ctx.data.offers
            .map(
              (offer) => `
                <article class="offer-card glass-card reveal">
                  <span class="offer-discount">${escapeHTML(offer.discount)}</span>
                  <h3>${escapeHTML(localized(offer.title, ctx.state.lang))}</h3>
                  <p>${escapeHTML(localized(offer.description, ctx.state.lang))}</p>
                  <time>${escapeHTML(offer.expires)}</time>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderStory(ctx) {
    return `
      <section class="section story-band">
        <div class="story-panel glass-card reveal">
          <span class="eyebrow">${ctx.state.lang === "ar" ? "معاك في كل تمرينة" : "With you every session"}</span>
          <h2>${escapeHTML(localized(ctx.data.sections.story.title, ctx.state.lang))}</h2>
          <p>${escapeHTML(localized(ctx.data.sections.story.body, ctx.state.lang))}</p>
          <div class="story-steps">
            <span>${ctx.state.lang === "ar" ? "01 · اختار المنتج" : "01 · Pick your gear"}</span>
            <span>${ctx.state.lang === "ar" ? "02 · حدد المقاس" : "02 · Choose size"}</span>
            <span>${ctx.state.lang === "ar" ? "03 · ابعت الطلب" : "03 · Send order"}</span>
          </div>
        </div>
      </section>
    `;
  }

  function renderFaqList(ctx, limit) {
    const items = limit ? ctx.data.pages.faq.slice(0, limit) : ctx.data.pages.faq;
    return `
      <section class="section faq-section">
        ${sectionTitle(ctx.t("nav.faq"), ctx.state.lang === "ar" ? "إجابات سريعة قبل ما تطلب." : "Quick answers before you order.")}
        <div class="faq-list">
          ${items
            .map(
              (item) => `
                <details class="glass-card faq-item reveal">
                  <summary>${escapeHTML(localized(item.q, ctx.state.lang))}<span>${icon("plus")}</span></summary>
                  <p>${escapeHTML(localized(item.a, ctx.state.lang))}</p>
                </details>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function home(ctx) {
    const sectionMap = {
      hero: () => renderHero(ctx),
      categories: () => renderCategories(ctx, 4),
      showcase: () => renderShowcase(ctx),
      products: () => renderProductsSection(ctx, ctx.t("nav.shop"), ctx.data.products.slice(0, 8)),
      offers: () => renderOffersStrip(ctx),
      story: () => renderStory(ctx),
      faq: () => renderFaqList(ctx, 3)
    };
    return ctx.data.sections.order.map((key) => (sectionMap[key] ? sectionMap[key]() : "")).join("");
  }

  function filterProducts(ctx) {
    const filters = ctx.ui.filters;
    const query = filters.query.trim().toLowerCase();
    let products = ctx.data.products.slice();
    if (filters.category !== "all") {
      products = products.filter((product) => product.category === filters.category);
    }
    if (query) {
      products = products.filter((product) => productSearchText(product, ctx.state.lang, ctx.categoryById(product.category)).includes(query));
    }
    if (filters.sort === "price-asc") products.sort((a, b) => a.price - b.price);
    if (filters.sort === "price-desc") products.sort((a, b) => b.price - a.price);
    if (filters.sort === "rating") products.sort((a, b) => b.rating - a.rating);
    return products;
  }

  function shop(ctx) {
    const products = filterProducts(ctx);
    return `
      <section class="page-hero compact reveal">
        <span class="eyebrow">${ctx.t("nav.shop")}</span>
        <h1>${ctx.t("pages.shopTitle")}</h1>
        <p>${escapeHTML(localized(ctx.data.sections.hero.subtitle, ctx.state.lang))}</p>
      </section>
      <section class="shop-layout section">
        <aside class="shop-filters glass-card reveal">
          <label class="search-field">
            ${icon("search")}
            <input type="search" value="${escapeHTML(ctx.ui.filters.query)}" data-shop-search placeholder="${ctx.t("labels.search")}">
          </label>
          <div class="filter-group">
            <strong>${ctx.t("labels.category")}</strong>
            <button class="filter-pill ${ctx.ui.filters.category === "all" ? "is-active" : ""}" data-action="set-filter" data-filter="category" data-value="all">${ctx.t("labels.all")}</button>
            ${ctx.data.categories
              .map((category) => `<button class="filter-pill ${ctx.ui.filters.category === category.id ? "is-active" : ""}" data-action="set-filter" data-filter="category" data-value="${escapeHTML(category.id)}">${escapeHTML(localized(category.name, ctx.state.lang))}</button>`)
              .join("")}
          </div>
          <label class="field">
            <span>${ctx.t("labels.sort")}</span>
            <select data-action="set-sort">
              <option value="featured" ${ctx.ui.filters.sort === "featured" ? "selected" : ""}>Featured</option>
              <option value="price-asc" ${ctx.ui.filters.sort === "price-asc" ? "selected" : ""}>Price Low</option>
              <option value="price-desc" ${ctx.ui.filters.sort === "price-desc" ? "selected" : ""}>Price High</option>
              <option value="rating" ${ctx.ui.filters.sort === "rating" ? "selected" : ""}>Rating</option>
            </select>
          </label>
        </aside>
        <div class="shop-products">
          <div class="shop-toolbar glass-card">
            <strong>${products.length} ${ctx.t("nav.shop")}</strong>
            <span>${ctx.t("labels.filter")} · ${escapeHTML(ctx.ui.filters.category)}</span>
          </div>
          <div class="products-grid" id="shopProductsGrid">
            ${products.length ? products.map((product) => productCard(product, ctx)).join("") : skeletonCards(4)}
          </div>
        </div>
      </section>
    `;
  }

  function categories(ctx) {
    return `
      <section class="page-hero compact reveal">
        <span class="eyebrow">AURAFLEX Matrix</span>
        <h1>${ctx.t("pages.categoriesTitle")}</h1>
        <p>${escapeHTML(localized(ctx.data.sections.showcase.body, ctx.state.lang))}</p>
      </section>
      ${renderCategories(ctx)}
    `;
  }

  function product(ctx) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || ctx.data.products[0].id;
    const item = ctx.productById(id) || ctx.data.products[0];
    const related = ctx.data.products.filter((candidate) => candidate.category === item.category && candidate.id !== item.id).slice(0, 4);
    const image = ctx.ui.productImage || item.images[0];
    const selectedSize = ctx.ui.selectedSize || item.sizes[0] || "";
    const selectedColor = ctx.ui.selectedColor || item.colors[0] || "";

    return `
      <section class="product-detail section">
        <div class="product-gallery reveal">
          <div class="gallery-main glass-card" data-zoom>
            <img src="${escapeHTML(image)}" alt="${escapeHTML(localized(item.name, ctx.state.lang))}">
          </div>
          <div class="thumb-row">
            ${item.images
              .map((src) => `<button class="thumb ${src === image ? "is-active" : ""}" data-action="set-product-image" data-image="${escapeHTML(src)}"><img src="${escapeHTML(src)}" alt=""></button>`)
              .join("")}
          </div>
        </div>
        <div class="product-info glass-card reveal">
          <span class="eyebrow">${escapeHTML(localized(ctx.categoryById(item.category).name, ctx.state.lang))}</span>
          <h1>${escapeHTML(localized(item.name, ctx.state.lang))}</h1>
          <p>${escapeHTML(localized(item.description, ctx.state.lang))}</p>
          <div class="price-row detail-price">
            <strong>${ctx.money(item.price)}</strong>
            ${item.oldPrice ? `<del>${ctx.money(item.oldPrice)}</del>` : ""}
          </div>
          <div class="rating-line">${icon("star")} ${item.rating} · ${item.reviews} ${ctx.t("labels.reviews")} · ${item.stock} ${ctx.t("labels.stock")}</div>
          <div class="option-block">
            <strong>${ctx.t("labels.size")}</strong>
            <div class="option-row">
              ${item.sizes.map((size) => `<button class="option-pill ${selectedSize === size ? "is-active" : ""}" data-action="set-size" data-size="${escapeHTML(size)}">${escapeHTML(size)}</button>`).join("")}
            </div>
          </div>
          <div class="option-block">
            <strong>${ctx.t("labels.color")}</strong>
            <div class="color-row">
              ${item.colors.map((color) => `<button class="color-dot ${selectedColor === color ? "is-active" : ""}" data-action="set-color" data-color="${escapeHTML(color)}" style="--dot:${escapeHTML(color)}"></button>`).join("")}
            </div>
          </div>
          <div class="qty-control">
            <button class="icon-btn" data-action="detail-qty" data-delta="-1">${icon("minus")}</button>
            <strong>${ctx.ui.detailQty}</strong>
            <button class="icon-btn" data-action="detail-qty" data-delta="1">${icon("plus")}</button>
          </div>
          <div class="detail-actions">
            <button class="btn btn-primary btn-large" data-action="add-detail-cart" data-product-id="${escapeHTML(item.id)}">${icon("cart")} <span>${ctx.t("actions.addToCart")}</span></button>
            <button class="btn btn-ghost btn-large" data-action="toggle-wishlist" data-product-id="${escapeHTML(item.id)}">${icon("wishlist")} <span>${ctx.t("nav.wishlist")}</span></button>
          </div>
          <div class="spec-grid">
            ${Object.entries(item.specs || {})
              .map(([key, value]) => `<span><em>${escapeHTML(key)}</em><strong>${escapeHTML(value)}</strong></span>`)
              .join("")}
          </div>
        </div>
      </section>
      <section class="section reviews-section">
        ${sectionTitle(ctx.t("labels.reviews"), ctx.state.lang === "ar" ? "آراء ناس جربت المنتجات." : "Feedback from people who tried the products.")}
        <div class="review-grid">
          ${["Mina", "Nour", "Omar"]
            .map((name, index) => `<article class="review-card glass-card reveal"><span>${"★".repeat(5 - (index === 2 ? 1 : 0))}</span><p>${ctx.state.lang === "ar" ? "الخامة مريحة في التمرين والطلب وصل متظبط." : "Comfortable for training and the order arrived as expected."}</p><strong>${name}</strong></article>`)
            .join("")}
        </div>
      </section>
      ${renderProductsSection(ctx, ctx.t("labels.related"), related.length ? related : ctx.data.products.slice(0, 4), "shop.html")}
    `;
  }

  function wishlist(ctx) {
    const products = ctx.data.products.filter((product) => ctx.state.wishlist.includes(product.id));
    return `
      <section class="page-hero compact reveal">
        <span class="eyebrow">${ctx.t("nav.wishlist")}</span>
        <h1>${ctx.t("pages.wishlistTitle")}</h1>
        <p>${products.length ? ctx.t("labels.recommendations") : ctx.t("labels.wishlistEmpty")}</p>
      </section>
      <section class="section">
        <div class="products-grid">
          ${products.length ? products.map((product) => productCard(product, ctx)).join("") : `<div class="empty-state glass-card">${icon("wishlist")}<h2>${ctx.t("labels.wishlistEmpty")}</h2><a class="btn btn-primary" href="shop.html" data-transition>${ctx.t("actions.continueShopping")}</a></div>`}
        </div>
      </section>
    `;
  }

  function cart(ctx) {
    const items = ctx.state.cart.map((entry) => ({ ...entry, product: ctx.productById(entry.id) })).filter((entry) => entry.product);
    return `
      <section class="page-hero compact reveal">
        <span class="eyebrow">${ctx.t("nav.cart")}</span>
        <h1>${ctx.t("pages.cartTitle")}</h1>
        <p>${items.length ? ctx.money(ctx.cartTotal()) : ctx.t("labels.cartEmpty")}</p>
      </section>
      <section class="cart-layout section">
        <div class="cart-items">
          ${items.length
            ? items
                .map(
                  (entry) => `
                    <article class="cart-row glass-card reveal">
                      <img src="${escapeHTML(entry.product.images[0])}" alt="${escapeHTML(localized(entry.product.name, ctx.state.lang))}">
                      <div>
                        <h3>${escapeHTML(localized(entry.product.name, ctx.state.lang))}</h3>
                        <p>${escapeHTML(entry.size || "")} ${entry.color ? `· ${entry.color}` : ""}</p>
                        <strong>${ctx.money(entry.product.price * entry.qty)}</strong>
                      </div>
                      <div class="qty-control">
                        <button class="icon-btn" data-action="cart-qty" data-key="${escapeHTML(ctx.cartKey(entry))}" data-delta="-1">${icon("minus")}</button>
                        <strong>${entry.qty}</strong>
                        <button class="icon-btn" data-action="cart-qty" data-key="${escapeHTML(ctx.cartKey(entry))}" data-delta="1">${icon("plus")}</button>
                      </div>
                      <button class="icon-btn danger" data-action="remove-cart" data-key="${escapeHTML(ctx.cartKey(entry))}">${icon("trash")}</button>
                    </article>
                  `
                )
                .join("")
            : `<div class="empty-state glass-card">${icon("cart")}<h2>${ctx.t("labels.cartEmpty")}</h2><a class="btn btn-primary" href="shop.html" data-transition>${ctx.t("actions.continueShopping")}</a></div>`}
        </div>
        <form id="checkoutForm" class="checkout-card glass-card reveal">
          <h2>${ctx.t("actions.checkout")}</h2>
          <label><span>${ctx.t("forms.name")}</span><input required name="name" autocomplete="name"></label>
          <label><span>${ctx.t("forms.phone")}</span><input required name="phone" inputmode="tel" autocomplete="tel"></label>
          <label><span>${ctx.t("forms.address")}</span><input required name="address" autocomplete="street-address"></label>
          <label><span>${ctx.t("forms.governorate")}</span><input required name="governorate"></label>
          <label><span>${ctx.t("forms.notes")}</span><textarea name="notes" rows="4"></textarea></label>
          <div class="checkout-total"><span>${ctx.t("labels.total")}</span><strong>${ctx.money(ctx.cartTotal())}</strong></div>
          <button class="btn btn-primary btn-large" type="submit" ${items.length ? "" : "disabled"}>${icon("contact")} <span>${ctx.t("actions.checkout")}</span></button>
          <button class="btn btn-ghost" type="button" data-action="clear-cart">${ctx.t("actions.clearCart")}</button>
        </form>
      </section>
    `;
  }

  function offers(ctx) {
    return `
      <section class="page-hero compact reveal">
        <span class="eyebrow">Limited Drops</span>
        <h1>${ctx.t("pages.offersTitle")}</h1>
        <p>${escapeHTML(localized(ctx.data.sections.hero.subtitle, ctx.state.lang))}</p>
      </section>
      ${renderOffersStrip(ctx)}
      ${renderProductsSection(ctx, ctx.t("labels.sale"), ctx.data.products.filter((product) => product.oldPrice).slice(0, 8))}
    `;
  }

  function simplePage(ctx, key) {
    const page = ctx.data.pages[key];
    return `
      <section class="page-hero compact reveal">
        <span class="eyebrow">${escapeHTML(ctx.data.site.siteName)}</span>
        <h1>${escapeHTML(localized(page.title, ctx.state.lang))}</h1>
        <p>${escapeHTML(localized(page.body, ctx.state.lang))}</p>
      </section>
      <section class="section">
        <div class="info-grid">
          ${(page.values || [])
            .map((value) => `<article class="glass-card info-card reveal"><h3>${escapeHTML(localized(value.title, ctx.state.lang))}</h3><p>${escapeHTML(localized(value.text, ctx.state.lang))}</p></article>`)
            .join("")}
        </div>
      </section>
    `;
  }

  function contact(ctx) {
    const page = ctx.data.pages.contact;
    const address = localized(page.address, ctx.state.lang);
    return `
      <section class="page-hero compact reveal">
        <span class="eyebrow">${ctx.t("nav.contact")}</span>
        <h1>${escapeHTML(localized(page.title, ctx.state.lang))}</h1>
        <p>${escapeHTML(localized(page.body, ctx.state.lang))}</p>
      </section>
      <section class="section contact-grid">
        <div class="glass-card contact-card reveal">
          <h2>${ctx.state.lang === "ar" ? "واتساب" : "WhatsApp"}</h2>
          <p>${escapeHTML(ctx.data.site.whatsapp)}</p>
          <a class="btn btn-primary" target="_blank" rel="noreferrer" href="https://wa.me/${ctx.whatsappNumber()}">${icon("contact")} <span>${ctx.t("actions.openWhatsapp")}</span></a>
        </div>
        <div class="glass-card contact-card reveal">
          <h2>Email</h2>
          <p>${escapeHTML(ctx.data.site.email)}</p>
          <a class="btn btn-ghost" href="mailto:${escapeHTML(ctx.data.site.email)}">${icon("arrow")} <span>${ctx.t("actions.send")}</span></a>
        </div>
        ${address ? `<div class="glass-card contact-card reveal">
          <h2>${ctx.t("forms.address")}</h2>
          <p>${escapeHTML(address)}</p>
          <span class="mini-map"></span>
        </div>` : ""}
      </section>
    `;
  }

  function faq(ctx) {
    return `
      <section class="page-hero compact reveal">
        <span class="eyebrow">Support</span>
        <h1>${ctx.t("nav.faq")}</h1>
        <p>${escapeHTML(localized(ctx.data.sections.story.body, ctx.state.lang))}</p>
      </section>
      ${renderFaqList(ctx)}
    `;
  }

  function notFound(ctx) {
    return `
      <section class="not-found section reveal">
        <div class="glass-card">
          <span>404</span>
          <h1>${ctx.t("pages.notFoundTitle")}</h1>
          <p>${ctx.t("pages.notFoundBody")}</p>
          <a href="index.html" class="btn btn-primary" data-transition>${ctx.t("actions.backHome")}</a>
        </div>
      </section>
    `;
  }

  const pages = {
    home,
    shop,
    categories,
    product,
    wishlist,
    cart,
    offers,
    about: (ctx) => simplePage(ctx, "about"),
    contact,
    faq,
    privacy: (ctx) => simplePage(ctx, "privacy"),
    terms: (ctx) => simplePage(ctx, "terms"),
    notFound
  };

  function render(page, ctx) {
    return (pages[page] || pages.notFound)(ctx);
  }

  window.AFPages = { render };
})();
