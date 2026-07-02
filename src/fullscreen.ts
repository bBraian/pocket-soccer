// Fullscreen helpers. On Android/desktop the Fullscreen API removes the
// browser chrome from a normal tab. iOS Safari does NOT support it for regular
// elements — there the only true fullscreen is installing the PWA (Compartilhar
// -> Adicionar à Tela de Início), which honors the apple-mobile-web-app metas.

type FsEl = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};
type FsDoc = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

export function fullscreenSupported(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.documentElement as FsEl;
  return Boolean(el.requestFullscreen || el.webkitRequestFullscreen);
}

export function isFullscreen(): boolean {
  const d = document as FsDoc;
  return Boolean(d.fullscreenElement || d.webkitFullscreenElement);
}

// Best-effort request. Must be called from within a user gesture (tap/click).
export function enterFullscreen(): void {
  const el = document.documentElement as FsEl;
  const req = el.requestFullscreen ?? el.webkitRequestFullscreen;
  try {
    const r = req?.call(el);
    if (r && typeof (r as Promise<void>).catch === 'function') {
      (r as Promise<void>).catch(() => {});
    }
  } catch {
    /* ignore */
  }
}

export function exitFullscreen(): void {
  const d = document as FsDoc;
  const exit = d.exitFullscreen ?? d.webkitExitFullscreen;
  try {
    exit?.call(d);
  } catch {
    /* ignore */
  }
}

export function toggleFullscreen(): void {
  if (isFullscreen()) exitFullscreen();
  else enterFullscreen();
}
