(function () {
  const prefix = "auraflex:";

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(prefix + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
      console.warn("Storage read failed", key, error);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(prefix + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("Storage write failed", key, error);
      return false;
    }
  }

  function remove(key) {
    localStorage.removeItem(prefix + key);
  }

  window.AFStorage = { read, remove, write };
})();
