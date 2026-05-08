/**
 * Next.js 開発サーバーで `localStorage.getItem is not a function` になる環境向けの
 * 起動前プリロード（`npm run dev` から `node --require` で読み込む）。
 * 本番 `next build` / `next start` では使わない。
 */
function createMemoryStorage() {
  const store = new Map();

  return {
    getItem(key) {
      const normalizedKey = String(key);
      return store.has(normalizedKey) ? store.get(normalizedKey) : null;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(String(key));
    },
    clear() {
      store.clear();
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    get length() {
      return store.size;
    },
  };
}

function needsStorageShim(storageName) {
  try {
    const storage = globalThis[storageName];
    return !storage || typeof storage.getItem !== 'function';
  } catch {
    return true;
  }
}

function installStorageShim(storageName) {
  if (!needsStorageShim(storageName)) {
    return;
  }

  const storage = createMemoryStorage();

  try {
    Object.defineProperty(globalThis, storageName, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: storage,
    });
  } catch {
    globalThis[storageName] = storage;
  }
}

installStorageShim('localStorage');
installStorageShim('sessionStorage');
