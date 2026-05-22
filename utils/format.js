(function () {
  const numberFormatters = new Map();

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function localized(value, lang) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value[lang] || value.en || value.ar || "";
    }
    return value ?? "";
  }

  function money(value, site, lang) {
    const currency = site.currency || "EGP";
    const key = `${lang}:${currency}`;
    if (!numberFormatters.has(key)) {
      numberFormatters.set(
        key,
        new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US", {
          maximumFractionDigits: 0
        })
      );
    }
    const label = localized(site.currencyLabel, lang) || currency;
    return `${numberFormatters.get(key).format(Number(value || 0))} ${label}`;
  }

  function getPath(object, path) {
    return String(path)
      .split(".")
      .reduce((current, key) => (current && current[key] !== undefined ? current[key] : undefined), object);
  }

  function debounce(fn, wait) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function productSearchText(product, lang, category) {
    return [
      localized(product.name, lang),
      localized(product.description, lang),
      category ? localized(category.name, lang) : "",
      product.category,
      ...(product.tags || [])
    ]
      .join(" ")
      .toLowerCase();
  }

  window.AFUtils = {
    clamp,
    debounce,
    escapeHTML,
    getPath,
    localized,
    money,
    productSearchText
  };
})();
