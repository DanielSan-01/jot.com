function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function renderMarkdown(text) {
  let html = escapeHtml(text);

  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, _lang, code) =>
    `<pre><code>${code.trim()}</code></pre>`);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/^---+$/gm, '<hr>');

  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  html = html.replace(/^(\s*[-*+] .+(\n|$))+/gm, match => {
    const items = match.trim().split('\n').map(line =>
      `<li>${line.replace(/^\s*[-*+] /, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });
  html = html.replace(/^(\s*\d+\. .+(\n|$))+/gm, match => {
    const items = match.trim().split('\n').map(line =>
      `<li>${line.replace(/^\s*\d+\. /, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });

  html = html.replace(/^(?!<[a-z]).+$/gm, line => line ? `<p>${line}</p>` : '');
  return html;
}
