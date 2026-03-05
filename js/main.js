import { encodeNote, decodeNote, buildShareUrl } from './urlStorage.js';

const MAX_URL_LENGTH = 2000;
const COPY_BUTTON_RESET_MS = 2000;
const TOAST_DURATION_MS = 2200;

const COPY_ICON = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.3"/><path d="M1 8V1h7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHECK_ICON = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6l3.5 3.5L11 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const editor = document.getElementById('editor');
const urlDisplay = document.getElementById('urlDisplay');
const btnCopy = document.getElementById('btnCopy');
const btnNew = document.getElementById('btnNew');
const introHint = document.getElementById('introHint');
const toast = document.getElementById('toast');
const confirmOverlay = document.getElementById('confirmOverlay');
const confirmOk = document.getElementById('confirmOk');
const confirmCancel = document.getElementById('confirmCancel');

let toastTimeout = null;
let limitToastShown = false;

function syncUrlFromEditor() {
  const text = editor.value;
  const encoded = encodeNote(text);
  const fullUrl = encoded ? buildShareUrl(encoded) : location.origin + location.pathname;
  const urlLen = fullUrl.length;
  const overLimit = urlLen > MAX_URL_LENGTH;

  if (overLimit && !limitToastShown) {
    limitToastShown = true;
    showToast('URL limit reached — copy your note or shorten it to share');
  }
  if (!overLimit) limitToastShown = false;

  if (!overLimit) {
    history.replaceState(null, '', encoded ? `#${encoded}` : location.pathname);
  }

  const hashPreview = encoded
    ? `${encoded.slice(0, 40)}${encoded.length > 40 ? '…' : ''}`
    : '';
  urlDisplay.innerHTML = encoded
    ? `<span class="url-base">${location.origin}${location.pathname}</span><span class="url-hash">#${hashPreview}</span>`
    : `<span class="url-base">${location.origin}${location.pathname}</span><span class="url-hash">#</span>`;

  const chars = text.length;
  const lines = text ? text.split('\n').length : 1;
  const pct = Math.min(100, Math.round((urlLen / MAX_URL_LENGTH) * 100));

  document.getElementById('statChars').textContent = chars;
  document.getElementById('statLines').textContent = lines;

  const urlStat = document.getElementById('statUrl');
  const fill = document.getElementById('sizeFill');
  const pctEl = document.getElementById('statPct');

  urlStat.textContent = urlLen > 999 ? `${(urlLen / 1000).toFixed(1)}kb` : `${urlLen}b`;
  urlStat.className = 'stat-value' + (pct > 90 ? ' danger' : pct > 70 ? ' warn' : '');

  fill.style.width = `${pct}%`;
  fill.style.background = pct > 90 ? 'var(--red)' : pct > 70 ? 'var(--amber)' : 'var(--green)';
  pctEl.textContent = `${pct}%`;

  if (chars > 0) introHint.classList.add('hidden');
  else introHint.classList.remove('hidden');
}

function loadNoteFromHash() {
  const hash = location.hash.slice(1);
  if (hash) {
    const text = decodeNote(hash);
    if (text) {
      editor.value = text;
      syncUrlFromEditor();
      return;
    }
  }
  syncUrlFromEditor();
}

function copyUrlToClipboard() {
  const url = location.href;
  navigator.clipboard.writeText(url).then(() => {
    btnCopy.classList.add('copied');
    btnCopy.innerHTML = `${CHECK_ICON} copied!`;
    showToast('URL copied to clipboard');
    setTimeout(() => {
      btnCopy.classList.remove('copied');
      btnCopy.innerHTML = `${COPY_ICON} copy url`;
    }, COPY_BUTTON_RESET_MS);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('URL copied!');
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), TOAST_DURATION_MS);
}

function askNewNote() {
  if (!editor.value.trim()) {
    startNewNote();
    return;
  }
  confirmOverlay.classList.add('show');
}

function startNewNote() {
  editor.value = '';
  history.replaceState(null, '', location.pathname);
  syncUrlFromEditor();
  editor.focus();
  confirmOverlay.classList.remove('show');
}

editor.addEventListener('keydown', function (e) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = editor.selectionStart;
    const value = editor.value;
    editor.value = value.slice(0, start) + '  ' + value.slice(editor.selectionEnd);
    editor.selectionStart = editor.selectionEnd = start + 2;
    syncUrlFromEditor();
  }
});

editor.addEventListener('input', syncUrlFromEditor);
btnCopy.addEventListener('click', copyUrlToClipboard);
btnNew.addEventListener('click', askNewNote);
urlDisplay.addEventListener('click', copyUrlToClipboard);
confirmOk.addEventListener('click', startNewNote);
confirmCancel.addEventListener('click', () => confirmOverlay.classList.remove('show'));

document.addEventListener('keydown', function (e) {
  if (e.ctrlKey && e.shiftKey && e.key === 'C') {
    e.preventDefault();
    copyUrlToClipboard();
  }
  if (e.ctrlKey && e.shiftKey && e.key === 'N') {
    e.preventDefault();
    askNewNote();
  }
  if (e.key === 'Escape') {
    confirmOverlay.classList.remove('show');
  }
});

loadNoteFromHash();
if (!editor.value) editor.focus();
