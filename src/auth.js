// src/auth.js — Модуль управління автентифікацією OpenID Connect
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

const AUTHORITY = import.meta.env.VITE_AUTH_URL || 'http://localhost:8080/oidc';
const CLIENT_ID = 'sentinel-spa';

const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

export const userManager = new UserManager({
  authority: AUTHORITY,
  client_id: CLIENT_ID,
  redirect_uri: origin,
  post_logout_redirect_uri: origin,
  response_type: 'code',
  scope: 'openid profile',
  userStore: typeof window !== 'undefined'
    ? new WebStorageStateStore({ store: window.sessionStorage })
    : undefined,
  automaticSilentRenew: true,
});

export async function accessToken() {
  const user = await userManager.getUser();
  return user?.access_token ?? null;
}

export async function renewToken() {
  try {
    const user = await userManager.signinSilent();
    return user?.access_token ?? null;
  } catch {
    return null;
  }
}

export function signIn() {
  return userManager.signinRedirect();
}

export async function signOut(onSignOut) {
  if (typeof onSignOut === 'function') {
    onSignOut();
  }
  await userManager.removeUser();
  try {
    await userManager.signoutRedirect();
  } catch {
    if (typeof window !== 'undefined') {
      window.location.href = origin;
    }
  }
}

export async function getUser() {
  return await userManager.getUser();
}
