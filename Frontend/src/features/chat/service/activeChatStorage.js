const ACTIVE_CHAT_STORAGE_PREFIX = "perplexity.activeChat.";

const getStorageKey = (userId) =>
  `${ACTIVE_CHAT_STORAGE_PREFIX}${userId}`;

export const getActiveChatId = (userId) =>
  window.localStorage.getItem(getStorageKey(userId));

export const setActiveChatId = (userId, chatId) =>
  window.localStorage.setItem(getStorageKey(userId), chatId);

export const clearActiveChatId = (userId) =>
  window.localStorage.removeItem(getStorageKey(userId));
