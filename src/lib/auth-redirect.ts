export function getSafeAuthCallbackUrl(search: string, fallback = '/dashboard') {
  const callbackUrl = new URLSearchParams(search).get('callbackUrl')

  if (!callbackUrl) {
    return fallback
  }

  const allowedPrefixes = ['/dashboard', '/store/', '/stores/']

  if (allowedPrefixes.some((prefix) => callbackUrl.startsWith(prefix))) {
    return callbackUrl
  }

  return fallback
}
