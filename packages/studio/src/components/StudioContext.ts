import { createContext, useContext, type Dispatch } from 'react';
import type { StudioMessages } from '../i18n';
import type { StudioAction, StudioState } from '../state/studioReducer';

export interface StudioContextValue {
  state: StudioState;
  dispatch: Dispatch<StudioAction>;
  ui: StudioMessages;
}

export const StudioContext = createContext<StudioContextValue | null>(null);

export function useStudio(): StudioContextValue {
  const value = useContext(StudioContext);
  if (!value) throw new Error('useStudio must be used inside <CvStudio>');
  return value;
}
