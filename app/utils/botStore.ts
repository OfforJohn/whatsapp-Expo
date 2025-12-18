import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface BotStore {
  botCount: number;
  delays: Record<string | number, number>;
  setBotCount: (count: number) => void;
  setDelay: (id: string | number, seconds: number) => void;
  resetDelays: () => void;
  loadFromStorage: () => Promise<void>;
}

export const useBotStore = create<BotStore>((set, get) => ({
  botCount: 1,
  delays: {},

  setBotCount: async (count) => {
    set({ botCount: count });
    try {
      await AsyncStorage.setItem("botCount", count.toString());
    } catch (err) {
      console.warn("Failed to save botCount", err);
    }
  },

  setDelay: async (id, seconds) => {
    const updated = { ...get().delays, [id]: seconds };
    set({ delays: updated });
    try {
      await AsyncStorage.setItem(`delay_${id}`, (seconds * 1000).toString());
    } catch (err) {
      console.warn("Failed to save delay", err);
    }
  },

  resetDelays: async () => {
    const keys = await AsyncStorage.getAllKeys();
    const delayKeys = keys.filter((k) => k.startsWith("delay_"));
    await AsyncStorage.multiRemove(delayKeys);
    const cleared: Record<string | number, number> = {};
    set({ delays: cleared });
  },

  loadFromStorage: async () => {
    try {
      const botCountStr = await AsyncStorage.getItem("botCount");
      if (botCountStr) set({ botCount: parseInt(botCountStr, 10) });

      const keys = await AsyncStorage.getAllKeys();
      const delayKeys = keys.filter((k) => k.startsWith("delay_"));
      const kv = await AsyncStorage.multiGet(delayKeys);
      const delayObj: Record<string | number, number> = {};
      kv.forEach(([k, v]) => {
        if (!k || !v) return;
        const id = k.replace("delay_", "");
        const ms = parseInt(v, 10);
        if (!Number.isNaN(ms)) delayObj[id] = Math.round(ms / 1000);
      });
      set({ delays: delayObj });
    } catch (err) {
      console.warn("Failed to load botStore from storage", err);
    }
  },
}));
