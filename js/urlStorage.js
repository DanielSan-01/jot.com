const DEFAULT_NAME = 'note.md';

function encodePayload(str) {
  try {
    return window.LZString.compressToEncodedURIComponent(str);
  } catch (_) {
    return encodeURIComponent(str);
  }
}

function decodePayload(hash) {
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

export function encodeNote(content, name = DEFAULT_NAME) {
  const payload = JSON.stringify({ n: name || DEFAULT_NAME, c: content || '' });
  return encodePayload(payload);
}

export function decodeNote(hash) {
  const raw = decodePayload(hash);
  if (!raw) return { name: DEFAULT_NAME, content: '' };
  if (raw.startsWith('{')) {
    try {
      const { n, c } = JSON.parse(raw);
      return { name: n || DEFAULT_NAME, content: c ?? '' };
    } catch (_) {}
  }
  return { name: DEFAULT_NAME, content: raw };
}

export function buildShareUrl(encoded) {
  return `${location.origin}${location.pathname}#${encoded}`;
}
