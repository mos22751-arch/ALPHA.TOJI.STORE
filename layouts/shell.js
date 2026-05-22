(function () {
  const { escapeHTML, localized } = window.AFUtils;
  const { icon } = window.AFIcons;

  const pageFiles = {
    home: "index.html",
    shop: "shop.html",
    categories: "categories.html",
    offers: "offers.html",
    about: "about.html",
    contact: "contact.html",
    wishlist: "wishlist.html",
    cart: "cart.html",
    faq: "faq.html",
    privacy: "privacy.html",
    terms: "terms.html"
  };

  function navLink(key, ctx) {
    const active = ctx.page === key ? " is-active" : "";
    return `<a class="nav-link${active}" href="${pageFiles[key]}" data-transition>${ctx.t(`nav.${key}`)}</a>`;
  }

  function renderThemePanel(ctx) {
    const themes = ctx.data.themes
      .map((theme) => {
        const active = ctx.state.theme === theme.id ? " is-active" : "";
        return `
          <button class="theme-swatch${active}" data-action="set-theme" data-theme="${escapeHTML(theme.id)}" style="--swatch:${escapeHTML(theme.accent)}; --swatch2:${escapeHTML(theme.secondary)}">
            <span></span>
            <strong>${escapeHTML(localized(theme.name, ctx.state.lang))}</strong>
          </button>
        `;
      })
      .join("");

    return `
      <aside id="themePanel" class="theme-panel glass-card" aria-label="${ctx.t("labels.theme")}">
        <div class="panel-head">
          <span>${icon("theme")}</span>
          <strong>${ctx.t("labels.theme")}</strong>
          <button class="icon-btn" data-action="toggle-theme-panel" title="Close">${icon("close")}</button>
        </div>
        <div class="theme-grid">${themes}</div>
        <label class="field accent-field">
          <span>${ctx.t("labels.accent")}</span>
          <input type="color" value="${escapeHTML(ctx.state.accent)}" data-action="set-accent">
        </label>
        <label class="switch-row">
          <input type="checkbox" data-action="toggle-sound" ${ctx.state.sound ? "checked" : ""}>
          <span></span>
          <em>Sound FX</em>
        </label>
      </aside>
    `;
  }

  function renderHeader(ctx) {
    const nav = ctx.data.site.navOrder.map((key) => navLink(key, ctx)).join("");
    const cartCount = ctx.cartCount();
    const wishCount = ctx.state.wishlist.length;
    return `
      <header class="glass-nav">
        <a href="index.html" class="brand" data-transition aria-label="${escapeHTML(ctx.data.site.siteName)}">
          <span class="brand-mark">${escapeHTML(ctx.data.site.logoText)}</span>
          <span>
            <strong>${escapeHTML(ctx.data.site.siteName)}</strong>
            <em>${escapeHTML(localized(ctx.data.site.tagline, ctx.state.lang))}</em>
          </span>
        </a>
        <nav class="primary-nav" aria-label="Primary navigation">${nav}</nav>
        <div class="nav-tools">
          <button class="icon-btn" data-action="toggle-theme-panel" title="${ctx.t("labels.theme")}">${icon("theme")}</button>
          <button class="pill-btn" data-action="toggle-lang">${icon("language")} <span>${ctx.state.lang === "ar" ? "EN" : "AR"}</span></button>
          <a class="icon-btn nav-counter" href="wishlist.html" data-transition title="${ctx.t("nav.wishlist")}">${icon("wishlist")}<span>${wishCount}</span></a>
          <a class="icon-btn nav-counter" href="cart.html" data-transition title="${ctx.t("nav.cart")}">${icon("cart")}<span>${cartCount}</span></a>
        </div>
      </header>
    `;
  }

  function renderDock(ctx) {
    const items = ["home", "shop", "categories", "wishlist", "cart"];
    return `
      <nav class="dock-nav glass-card" aria-label="Floating navigation">
        ${items
          .map((key) => {
            const active = ctx.page === key ? " is-active" : "";
            const count = key === "cart" ? ctx.cartCount() : key === "wishlist" ? ctx.state.wishlist.length : "";
            return `
              <a class="dock-item${active}" href="${pageFiles[key]}" data-transition title="${ctx.t(`nav.${key}`)}">
                ${icon(key)}
                ${count !== "" ? `<span>${count}</span>` : ""}
              </a>
            `;
          })
          .join("")}
      </nav>
    `;
  }

  function renderFloatingCart(ctx) {
    const total = ctx.cartTotal();
    return `
      <a class="floating-cart glass-card" href="cart.html" data-transition>
        <span>${icon("cart")}</span>
        <strong>${ctx.cartCount()}</strong>
        <em>${ctx.money(total)}</em>
      </a>
    `;
  }

  function renderFooter(ctx) {
    return `
      <footer class="site-footer">
        <div class="footer-grid">
          <div>
            <a href="index.html" class="brand footer-brand" data-transition>
              <span class="brand-mark">${escapeHTML(ctx.data.site.logoText)}</span>
              <span><strong>${escapeHTML(ctx.data.site.siteName)}</strong><em>${escapeHTML(localized(ctx.data.site.tagline, ctx.state.lang))}</em></span>
            </a>
            <p>${escapeHTML(localized(ctx.data.sections.story.body, ctx.state.lang))}</p>
          </div>
          <div>
            <h3>${ctx.t("nav.shop")}</h3>
            <a href="shop.html" data-transition>${ctx.t("nav.shop")}</a>
            <a href="categories.html" data-transition>${ctx.t("nav.categories")}</a>
            <a href="offers.html" data-transition>${ctx.t("nav.offers")}</a>
          </div>
          <div>
            <h3>${ctx.t("nav.contact")}</h3>
            ${ctx.data.site.email ? `<a href="mailto:${escapeHTML(ctx.data.site.email)}">${escapeHTML(ctx.data.site.email)}</a>` : ""}
            ${ctx.data.site.phone ? `<a href="tel:${escapeHTML(ctx.data.site.phone)}">${escapeHTML(ctx.data.site.phone)}</a>` : ""}
            <a href="https://wa.me/${ctx.whatsappNumber()}" target="_blank" rel="noreferrer">${ctx.t("actions.openWhatsapp")}</a>
          </div>
          <div>
            <h3>Legal</h3>
            ${ctx.data.site.footerLinks.map((key) => `<a href="${pageFiles[key]}" data-transition>${ctx.t(`nav.${key}`)}</a>`).join("")}
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} ${escapeHTML(ctx.data.site.legalName || ctx.data.site.siteName)}</span>
          <span>${ctx.state.lang === "ar" ? "معدات ومكملات للتمرين" : "Gym gear and supplements"}</span>
        </div>
      </footer>
    `;
  }

  function renderShell(ctx, pageHtml) {
    return `
      ${renderHeader(ctx)}
      ${renderThemePanel(ctx)}
      <main id="pageHost" class="page-shell">${pageHtml}</main>
      ${renderFooter(ctx)}
      ${renderFloatingCart(ctx)}
      ${renderDock(ctx)}
      <div id="toastStack" class="toast-stack" aria-live="polite"></div>
      <div id="pageTransition" class="page-transition" aria-hidden="true"></div>
    `;
  }

  window.AFShell = { pageFiles, renderShell };
})();
