// Shim que reproduz a API window.storage (get/set/delete/list) usada nos
// artifacts do Claude, mas persistindo em localStorage — necessário porque
// GitHub Pages é hospedagem estática, sem backend de storage próprio.
// Efeito: o histórico fica salvo só no navegador do usuário, não sincroniza
// entre dispositivos.

export const storage = {
  async get(key) {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      throw new Error(`key not found: ${key}`);
    }
    return { key, value: raw };
  },

  async set(key, value) {
    try {
      localStorage.setItem(key, value);
      return { key, value };
    } catch (e) {
      return null;
    }
  },

  async delete(key) {
    localStorage.removeItem(key);
    return { key, deleted: true };
  },

  async list(prefix = "") {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix));
    return { keys };
  },
};
