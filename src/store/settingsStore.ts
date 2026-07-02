import { create } from 'zustand';
import type { BallSkin, GrassSkin } from '../types';
import { load, save } from './persist';

const KEY = 'ps.settings';

interface SettingsState {
  grass: GrassSkin;
  ball: BallSkin;
  setGrass: (g: GrassSkin) => void;
  setBall: (b: BallSkin) => void;
}

const initial = load<{ grass: GrassSkin; ball: BallSkin }>(KEY, {
  grass: 'classic',
  ball: 'classic',
});

export const useSettingsStore = create<SettingsState>((set, get) => ({
  grass: initial.grass,
  ball: initial.ball,
  setGrass: (grass) => {
    set({ grass });
    save(KEY, { grass, ball: get().ball });
  },
  setBall: (ball) => {
    set({ ball });
    save(KEY, { grass: get().grass, ball });
  },
}));
