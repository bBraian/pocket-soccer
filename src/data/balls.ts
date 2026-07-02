import type { BallSkin } from '../types';

// Bundled ball-skin SVG URLs, drawn onto the canvas as <img> sources.
const urls = import.meta.glob('../assets/balls/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export function ballUrl(skin: BallSkin): string | undefined {
  const hit = Object.entries(urls).find(([k]) => k.endsWith(`/${skin}.svg`));
  return hit?.[1];
}
