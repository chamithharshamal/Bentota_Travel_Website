"use client";

/** Short chime generated with the Web Audio API, so no sound file is needed. */
export function playChime(priority: boolean) {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const notes = priority ? [880, 1175, 880, 1175] : [660, 880];
    notes.forEach((freq, i) => {
      const start = ctx.currentTime + i * 0.18;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.17);
    });
    setTimeout(() => void ctx.close(), 1500);
  } catch {
    // Browsers block audio until the user has interacted with the page.
  }
}

export function showDesktopNotification(title: string, body: string, onClick: () => void) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    const n = new Notification(title, { body, tag: title });
    n.onclick = () => {
      window.focus();
      onClick();
      n.close();
    };
  } catch {
    // Some mobile browsers only allow notifications from a service worker.
  }
}

const SOUND_KEY = "bsj-admin-sound";

export function getSoundPreference(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(SOUND_KEY) !== "off";
}

export function setSoundPreference(on: boolean) {
  window.localStorage.setItem(SOUND_KEY, on ? "on" : "off");
}
