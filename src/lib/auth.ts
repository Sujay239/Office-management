// Utility functions for handling JWT in cookies

export function setTokenCookie(token: string) {
  document.cookie = `token=${token}; path=/; max-age=86400; secure; samesite=strict`;
}

export function getTokenCookie(): string | null {
  const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function removeTokenCookie() {
  document.cookie = 'token=; path=/; max-age=0;';
}
