// use-icon-index.store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IconState {
  iconIndex: number;
  setIconIndex: (index: number) => void;
}

interface SectionRefState {
  sectionRefs: React.MutableRefObject<Element[]>;
}

export const useIconIndexStore = create<IconState>()(
  persist(
    (set) => ({
      iconIndex: 0,
      setIconIndex: (index) => set({ iconIndex: index })
    }),
    { name: 'icon-index' }
  )
);

export const useSectionRefStore = create<SectionRefState>(() => ({
  sectionRefs: { current: [] },
}));

