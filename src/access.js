const key = "star-account-access-key";
let accessToken = null;

export function initAccessToken() {
  accessToken = localStorage.getItem(key);
}

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
}

export function saveAccessToken() {
  if (accessToken !== null) {
    localStorage.setItem(key, accessToken);
  }
}

export function deactivateAccessToken() {
  localStorage.removeItem(key);
  accessToken = null;
}
