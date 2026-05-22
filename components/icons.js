(function () {
  const map = {
    dumbbell: "Dumbbell",
    sparkles: "Sparkles",
    shirt: "Shirt",
    watch: "Watch",
    home: "House",
    shop: "ShoppingBag",
    categories: "PanelsTopLeft",
    offers: "BadgePercent",
    about: "Sparkle",
    contact: "MessageCircle",
    wishlist: "Heart",
    cart: "ShoppingCart",
    faq: "CircleHelp",
    privacy: "ShieldCheck",
    terms: "ScrollText",
    search: "Search",
    theme: "Palette",
    language: "Languages",
    filter: "SlidersHorizontal",
    plus: "Plus",
    minus: "Minus",
    trash: "Trash2",
    upload: "Upload",
    save: "Save",
    download: "Download",
    settings: "Settings2",
    play: "Play",
    close: "X",
    star: "Star",
    arrow: "ArrowUpRight"
  };

  function icon(name, label) {
    const lucideName = map[name] || name || "Circle";
    return `<i data-lucide="${lucideName}" ${label ? `aria-label="${label}"` : "aria-hidden=\"true\""}></i>`;
  }

  function refreshIcons(root) {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons({ attrs: { "stroke-width": 1.8 }, nameAttr: "data-lucide" });
    }
    return root;
  }

  window.AFIcons = { icon, refreshIcons };
})();
