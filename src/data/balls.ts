import type { BallSkin } from '../types';

// Ball-skin images. Drop a PNG named after the skin (classic.png, striped.png,
// star.png, retro.png) into src/assets/balls/ and it overrides the bundled SVG
// automatically. PNGs are preferred; the SVG is the fallback.
const pngs = import.meta.glob('../assets/balls/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const svgs = import.meta.glob('../assets/balls/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

function find(map: Record<string, string>, file: string): string | undefined {
  const hit = Object.entries(map).find(([k]) => k.endsWith(`/${file}`));
  return hit?.[1];
}

export function ballUrl(skin: BallSkin): string | undefined {
  return find(pngs, `${skin}.png`) ?? find(svgs, `${skin}.svg`);
}
