// Bundled flag-icons square (1x1) SVG URLs, so flags can be drawn onto the
// canvas as <img> sources. Everything is local (works offline in the PWA).
const urls = import.meta.glob('/node_modules/flag-icons/flags/1x1/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export function flagUrl(code: string): string | undefined {
  return urls[`/node_modules/flag-icons/flags/1x1/${code}.svg`];
}
