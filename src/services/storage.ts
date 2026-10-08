import { SavedSignature, UserDataPresets } from '../types';

const SIGNATURES_KEY = 'instantsign_signatures_v1';
const PRESETS_KEY = 'instantsign_presets_v1';
const THEME_KEY = 'instantsign_theme_v1';

export const DEFAULT_PRESETS: UserDataPresets = {
  fullName: 'John Doe',
  idNumber: '12345678Z',
  place: 'London',
  dateFormat: 'DD/MM/YYYY',
};

// Generates a nice default demo signature SVG/PNG dataURL so the user immediately has an example signature available
export function createDefaultSignature(): SavedSignature {
  // A clean, elegant signature path rendered to a transparent canvas
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.strokeStyle = '#003366'; // Documentary blue
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw an elegant cursive J. Perez flourish
    ctx.beginPath();
    ctx.moveTo(50, 110);
    ctx.bezierCurveTo(45, 60, 85, 30, 110, 45);
    ctx.bezierCurveTo(125, 55, 120, 120, 95, 135);
    ctx.bezierCurveTo(80, 145, 65, 130, 80, 100);
    ctx.stroke();

    // Dot on J
    ctx.beginPath();
    ctx.arc(105, 35, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#003366';
    ctx.fill();

    // Loop and flourish for Perez
    ctx.beginPath();
    ctx.moveTo(130, 95);
    ctx.bezierCurveTo(145, 75, 160, 65, 175, 90);
    ctx.bezierCurveTo(185, 105, 200, 75, 215, 90);
    ctx.bezierCurveTo(225, 100, 235, 78, 245, 92);
    ctx.bezierCurveTo(255, 102, 270, 70, 280, 88);
    ctx.stroke();

    // Underline stroke flourish
    ctx.beginPath();
    ctx.moveTo(100, 120);
    ctx.bezierCurveTo(180, 115, 260, 125, 340, 105);
    ctx.bezierCurveTo(360, 100, 310, 128, 250, 132);
    ctx.stroke();
  }

  return {
    id: 'sig_default_sample',
    name: 'Default Signature (Sample)',
    dataUrl: canvas.toDataURL('image/png'),
    createdAt: Date.now(),
    width: 400,
    height: 160,
    aspectRatio: 400 / 160,
  };
}

export const StorageService = {
  getSignatures(): SavedSignature[] {
    try {
      const raw = localStorage.getItem(SIGNATURES_KEY);
      if (!raw) {
        const defaultSig = createDefaultSignature();
        this.saveSignature(defaultSig);
        return [defaultSig];
      }
      const list = JSON.parse(raw) as SavedSignature[];
      return Array.isArray(list) && list.length > 0 ? list : [createDefaultSignature()];
    } catch {
      return [createDefaultSignature()];
    }
  },

  saveSignature(sig: SavedSignature): void {
    try {
      const current = this.getSignatures().filter((s) => s.id !== sig.id);
      current.unshift(sig);
      localStorage.setItem(SIGNATURES_KEY, JSON.stringify(current));
    } catch (e) {
      console.error('Error saving signature to localStorage', e);
    }
  },

  deleteSignature(id: string): void {
    try {
      const current = this.getSignatures().filter((s) => s.id !== id);
      localStorage.setItem(SIGNATURES_KEY, JSON.stringify(current));
    } catch (e) {
      console.error('Error deleting signature', e);
    }
  },

  getPresets(): UserDataPresets {
    try {
      const raw = localStorage.getItem(PRESETS_KEY);
      if (!raw) return DEFAULT_PRESETS;
      return { ...DEFAULT_PRESETS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_PRESETS;
    }
  },

  savePresets(presets: UserDataPresets): void {
    try {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    } catch (e) {
      console.error('Error saving presets', e);
    }
  },

  getTheme(): 'light' | 'dark' {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  },

  saveTheme(theme: 'light' | 'dark'): void {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  },

  clearAllData(): void {
    localStorage.removeItem(SIGNATURES_KEY);
    localStorage.removeItem(PRESETS_KEY);
  },
};
