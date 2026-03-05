export function encodeNote(text) {
  if (!text) return '';
  try {
    return window.LZString.compressToEncodedURIComponent(text);
  } catch (_) {
    return encodeURIComponent(text);
  }
}

export function decodeNote(hash) {
  if (!hash) return '';
  try {
    const decoded = window.LZString.decompressFromEncodedURIComponent(hash);
    return decoded || decodeURIComponent(hash);
  } catch (_) {
    try {
      return decodeURIComponent(hash);
    } catch (_) {
      return '';
    }
  }
}

export function buildShareUrl(encoded) {
  return `${location.origin}${location.pathname}#${encoded}`;
}
