const KEY = 'rc_recently_viewed';
const MAX = 12;

export const getRecentlyViewed = (): string[] => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
};

export const rememberViewed = (id: string) => {
  if (!id) return;
  try {
    localStorage.setItem(KEY, JSON.stringify([id, ...getRecentlyViewed().filter((v) => v !== id)].slice(0, MAX)));
  } catch { /* storage unavailable */ }
};
