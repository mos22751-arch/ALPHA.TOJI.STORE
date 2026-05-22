(function () {
  const data = window.AURAFLEX_CONTENT;
  const { escapeHTML, getPath, localized, money } = window.AFUtils;
  const storage = window.AFStorage;
  const app = document.getElementById("app");

  if (!data || !app) {
    document.body.innerHTML = "<main class='fatal-error'>Missing storefront data. Run npm run build.</main>";
    return;
  }

  const page = document.body.dataset.page || "home";
  const initialTheme = data.themes.find((theme) => theme.id === data.site.defaultTheme) || data.themes[0];
  const state = {
    lang: storage.read("lang", data.site.defaultLanguage || "ar"),
    theme: storage.read("theme", initialTheme.id),
    accent: storage.read("accent", data.site.accent || initialTheme.accent),
    cart: storage.read("cart", []),
    wishlist: storage.read("wishlist", []),
    sound: storage.read("sound", Boolean(data.site.soundEnabled))
  };

  const ui = {
    filters: {
      query: "",
      category: "all",
      sort: "featured"
    },
    detailQty: 1,
    selectedSize: "",
    selectedColor: "",
    productImage: ""
  };

  const params = new URLSearchParams(window.location.search);
  if (page === "shop" && params.get("category")) {
    ui.filters.category = params.get("category");
  }

  function t(path) {
    return getPath(data.translations[state.lang], path) || getPath(data.translations.en, path) || path;
  }

  function productById(id) {
    return data.products.find((product) => product.id === id);
  }

  function categoryById(id) {
    return data.categories.find((category) => category.id === id) || data.categories[0];
  }

  function cartKey(entry) {
    return [entry.id, entry.size || "", entry.color || ""].join("::");
  }

  function persist() {
    storage.write("lang", state.lang);
    storage.write("theme", state.theme);
    storage.write("accent", state.accent);
    storage.write("cart", state.cart);
    storage.write("wishlist", state.wishlist);
    storage.write("sound", state.sound);
  }

  function cartCount() {
    return state.cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function cartTotal() {
    return state.cart.reduce((sum, item) => {
      const product = productById(item.id);
      return sum + (product ? product.price * item.qty : 0);
    }, 0);
  }

  function whatsappNumber() {
    const digits = String(data.site.whatsapp || "").replace(/[^\d]/g, "");
    if (digits.startsWith("0")) return `20${digits.slice(1)}`;
    return digits;
  }

  function ctx() {
    return {
      cartCount,
      cartKey,
      cartTotal,
      categoryById,
      data,
      money: (value) => money(value, data.site, state.lang),
      page,
      productById,
      state,
      t,
      ui,
      whatsappNumber
    };
  }

  function applyLanguage() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("is-rtl", state.lang === "ar");
  }

  function applyTheme() {
    const theme = data.themes.find((item) => item.id === state.theme) || initialTheme;
    const root = document.documentElement;
    const accent = state.accent || theme.accent;
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-rgb", hexToRgb(accent));
    root.style.setProperty("--secondary", theme.secondary);
    root.style.setProperty("--hot", theme.hot);
    root.style.setProperty("--surface", theme.surface);
    root.style.setProperty("--surface-strong", theme.surfaceStrong);
    root.style.setProperty("--text", theme.text);
    root.style.setProperty("--muted", theme.muted);
    root.style.setProperty("--line", theme.line);
    root.style.setProperty("--luxury-shadow", theme.shadow);
    root.style.setProperty("--theme-bg", theme.background);
    document.body.dataset.theme = theme.id;
    document.body.classList.toggle("light-theme", theme.mode === "light");
    applyDynamicBackground();
  }

  function hexToRgb(hex) {
    const normalized = String(hex).replace("#", "");
    const value = normalized.length === 3 ? normalized.split("").map((x) => x + x).join("") : normalized;
    const number = parseInt(value, 16);
    if (Number.isNaN(number)) return "0, 245, 212";
    return `${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}`;
  }

  function applyDynamicBackground() {
    const bg = data.site.background || {};
    document.body.classList.remove("has-bg-image", "has-bg-video");
    document.documentElement.style.removeProperty("--custom-bg-image");
    const oldVideo = document.getElementById("dynamicBgVideo");
    if (oldVideo) oldVideo.remove();

    if (bg.type === "image" && bg.image) {
      document.documentElement.style.setProperty("--custom-bg-image", `url("${bg.image}")`);
      document.body.classList.add("has-bg-image");
    }

    if (bg.type === "video" && bg.video) {
      const video = document.createElement("video");
      video.id = "dynamicBgVideo";
      video.className = "dynamic-bg-video";
      video.src = bg.video;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      document.body.prepend(video);
      document.body.classList.add("has-bg-video");
    }
  }

  function updateMeta() {
    document.title = localized(data.seo.title, state.lang) || `${data.site.siteName} | Luxury Sport Store`;
    const meta = document.querySelector("meta[name='description']");
    if (meta) meta.setAttribute("content", localized(data.seo.description, state.lang));
    let jsonLd = document.getElementById("jsonLdStore");
    if (!jsonLd) {
      jsonLd = document.createElement("script");
      jsonLd.type = "application/ld+json";
      jsonLd.id = "jsonLdStore";
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Store",
      name: data.site.siteName,
      description: localized(data.seo.description, state.lang),
      url: data.seo.canonical,
      telephone: data.site.phone,
      image: data.seo.ogImage
    });
  }

  function render() {
    applyLanguage();
    applyTheme();
    updateMeta();
    const pageHtml = window.AFPages.render(page, ctx());
    app.innerHTML = window.AFShell.renderShell(ctx(), pageHtml);
    window.AFIcons.refreshIcons(app);
    setupReveal();
    setupTilt();
    setupParallax();
    hideLoader();
  }

  function hideLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;
    window.setTimeout(() => loader.classList.add("is-hidden"), 120);
  }

  function toast(message) {
    const stack = document.getElementById("toastStack");
    if (!stack) return;
    const node = document.createElement("div");
    node.className = "toast glass-card";
    node.innerHTML = `<span>${window.AFIcons.icon("sparkles")}</span><strong>${escapeHTML(message)}</strong>`;
    stack.appendChild(node);
    window.AFIcons.refreshIcons(node);
    window.setTimeout(() => node.classList.add("is-visible"), 30);
    window.setTimeout(() => {
      node.classList.remove("is-visible");
      window.setTimeout(() => node.remove(), 260);
    }, 2800);
    playSound();
  }

  function playSound() {
    if (!state.sound) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audio = new AudioContext();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.frequency.value = 740;
      gain.gain.value = 0.025;
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.06);
    } catch (error) {
      console.warn("Sound FX unavailable", error);
    }
  }

  function addToCart(productId, qty = 1, size, color) {
    const product = productById(productId);
    if (!product) return;
    const entry = {
      id: product.id,
      qty,
      size: size || product.sizes[0] || "",
      color: color || product.colors[0] || ""
    };
    const key = cartKey(entry);
    const existing = state.cart.find((item) => cartKey(item) === key);
    if (existing) existing.qty += qty;
    else state.cart.push(entry);
    persist();
    toast(t("actions.addedToCart"));
    render();
  }

  function toggleWishlist(productId) {
    const exists = state.wishlist.includes(productId);
    state.wishlist = exists ? state.wishlist.filter((id) => id !== productId) : [...state.wishlist, productId];
    persist();
    toast(exists ? t("actions.removeWishlist") : t("actions.addWishlist"));
    render();
  }

  function updateCartQty(key, delta) {
    state.cart = state.cart
      .map((item) => (cartKey(item) === key ? { ...item, qty: Math.max(0, item.qty + delta) } : item))
      .filter((item) => item.qty > 0);
    persist();
    render();
  }

  function removeCartItem(key) {
    state.cart = state.cart.filter((item) => cartKey(item) !== key);
    persist();
    render();
  }

  function clearCart() {
    state.cart = [];
    persist();
    render();
  }

  function handleAction(event) {
    const actionNode = event.target.closest("[data-action]");
    if (!actionNode) return false;
    const action = actionNode.dataset.action;

    if (action === "toggle-theme-panel") {
      document.body.classList.toggle("theme-panel-open");
      return true;
    }

    if (action === "toggle-lang") {
      state.lang = state.lang === "ar" ? "en" : "ar";
      persist();
      render();
      return true;
    }

    if (action === "set-theme") {
      state.theme = actionNode.dataset.theme;
      const theme = data.themes.find((item) => item.id === state.theme);
      if (theme) state.accent = theme.accent;
      persist();
      render();
      return true;
    }

    if (action === "add-cart") {
      addToCart(actionNode.dataset.productId);
      return true;
    }

    if (action === "toggle-wishlist") {
      toggleWishlist(actionNode.dataset.productId);
      return true;
    }

    if (action === "set-filter") {
      ui.filters[actionNode.dataset.filter] = actionNode.dataset.value;
      render();
      return true;
    }

    if (action === "detail-qty") {
      ui.detailQty = Math.max(1, ui.detailQty + Number(actionNode.dataset.delta));
      render();
      return true;
    }

    if (action === "set-size") {
      ui.selectedSize = actionNode.dataset.size;
      render();
      return true;
    }

    if (action === "set-color") {
      ui.selectedColor = actionNode.dataset.color;
      render();
      return true;
    }

    if (action === "set-product-image") {
      ui.productImage = actionNode.dataset.image;
      render();
      return true;
    }

    if (action === "add-detail-cart") {
      addToCart(actionNode.dataset.productId, ui.detailQty, ui.selectedSize, ui.selectedColor);
      return true;
    }

    if (action === "cart-qty") {
      updateCartQty(actionNode.dataset.key, Number(actionNode.dataset.delta));
      return true;
    }

    if (action === "remove-cart") {
      removeCartItem(actionNode.dataset.key);
      return true;
    }

    if (action === "clear-cart") {
      clearCart();
      return true;
    }

    return false;
  }

  document.addEventListener("click", (event) => {
    if (handleAction(event)) {
      event.preventDefault();
      return;
    }

    const link = event.target.closest("a[data-transition]");
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || link.target) return;
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    event.preventDefault();
    document.body.classList.add("is-leaving");
    window.setTimeout(() => {
      window.location.href = href;
    }, 180);
  });

  document.addEventListener(
    "input",
    window.AFUtils.debounce((event) => {
      if (event.target.matches("[data-shop-search]")) {
        ui.filters.query = event.target.value;
        render();
      }
    }, 160)
  );

  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-action='set-accent']")) {
      state.accent = event.target.value;
      persist();
      applyTheme();
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-action='set-sort']")) {
      ui.filters.sort = event.target.value;
      render();
    }
    if (event.target.matches("[data-action='toggle-sound']")) {
      state.sound = event.target.checked;
      persist();
      toast(state.sound ? "Sound FX on" : "Sound FX off");
    }
  });

  document.addEventListener("submit", (event) => {
    if (event.target.id !== "checkoutForm") return;
    event.preventDefault();
    if (!state.cart.length) {
      toast(t("labels.cartEmpty"));
      return;
    }
    const form = new FormData(event.target);
    const required = ["name", "phone", "address", "governorate"];
    if (required.some((key) => !String(form.get(key) || "").trim())) {
      toast(t("forms.required"));
      return;
    }
    const url = buildWhatsAppUrl(form);
    window.location.href = url;
  });

  function buildWhatsAppUrl(form) {
    const ar = state.lang === "ar";
    const lines = [
      `*طلب جديد من ${data.site.siteName}*`,
      "",
      `${ar ? "الاسم" : "Name"}: ${form.get("name")}`,
      `${ar ? "الموبايل" : "Phone"}: ${form.get("phone")}`,
      `${ar ? "العنوان" : "Address"}: ${form.get("address")}`,
      `${ar ? "المحافظة" : "Governorate"}: ${form.get("governorate")}`,
      `${ar ? "ملاحظات" : "Notes"}: ${form.get("notes") || "-"}`,
      "",
      ar ? "*المنتجات:*" : "*Products:*"
    ];

    state.cart.forEach((entry, index) => {
      const product = productById(entry.id);
      if (!product) return;
      lines.push(
        `${index + 1}. ${localized(product.name, state.lang)} | ${entry.size || "-"} | ${entry.color || "-"} | Qty: ${entry.qty} | Price: ${money(product.price * entry.qty, data.site, state.lang)}`
      );
    });

    lines.push("", `*${ar ? "الإجمالي" : "Total"}:* ${money(cartTotal(), data.site, state.lang)}`);
    return `https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(lines.join("\n"))}`;
  }

  function setupReveal() {
    if (data.site.animations && data.site.animations.reveal === false) {
      app.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const items = app.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((item) => observer.observe(item));
  }

  function setupTilt() {
    if (data.site.animations && data.site.animations.hover3d === false) return;
    app.querySelectorAll(".hover-tilt").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty("--tilt-x", `${(0.5 - y) * 12}deg`);
        card.style.setProperty("--tilt-y", `${(x - 0.5) * 12}deg`);
        card.style.setProperty("--glow-x", `${x * 100}%`);
        card.style.setProperty("--glow-y", `${y * 100}%`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.removeProperty("--tilt-x");
        card.style.removeProperty("--tilt-y");
      });
    });
  }

  function setupParallax() {
    if (data.site.animations && data.site.animations.parallax === false) return;
    const items = Array.from(app.querySelectorAll("[data-parallax]"));
    if (!items.length) return;
    const update = () => {
      const y = window.scrollY * 0.06;
      items.forEach((item) => {
        item.style.transform = `translate3d(0, ${y}px, 0)`;
      });
    };
    update();
    window.removeEventListener("scroll", setupParallax._handler);
    setupParallax._handler = () => window.requestAnimationFrame(update);
    window.addEventListener("scroll", setupParallax._handler, { passive: true });
  }

  function initCursorGlow() {
    const glow = document.getElementById("cursorGlow");
    if (data.site.animations && data.site.animations.cursorGlow === false) {
      if (glow) glow.style.display = "none";
      return;
    }
    if (!glow || window.matchMedia("(pointer: coarse)").matches) return;
    document.addEventListener("pointermove", (event) => {
      glow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    });
  }

  function initParticles() {
    const canvas = document.getElementById("particleCanvas");
    if (data.site.animations && data.site.animations.particles === false) {
      if (canvas) canvas.style.display = "none";
      return;
    }
    if (page !== "home") {
      if (canvas) canvas.style.display = "none";
      return;
    }
    if (!canvas) return;
    const context = canvas.getContext("2d");
    let width;
    let height;
    let particles = [];

    function resize() {
      width = canvas.width = window.innerWidth * window.devicePixelRatio;
      height = canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const count = window.innerWidth < 700 ? 14 : 32;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: (Math.random() * 1.8 + 0.4) * window.devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.18 * window.devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.18 * window.devicePixelRatio,
        a: Math.random() * 0.5 + 0.16
      }));
    }

    function frame() {
      if (document.hidden) {
        window.requestAnimationFrame(frame);
        return;
      }
      context.clearRect(0, 0, width, height);
      context.fillStyle = `rgba(${getComputedStyle(document.documentElement).getPropertyValue("--accent-rgb") || "0,245,212"}, 0.45)`;
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;
        context.globalAlpha = particle.a;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
      window.requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", window.AFUtils.debounce(resize, 200));
    frame();
  }

  window.AFApp = {
    data,
    render,
    state,
    ui
  };

  initCursorGlow();
  initParticles();
  render();
})();
