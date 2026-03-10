import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const MAX_RECENT_WORKSPACES = 10;

interface RecentWorkspace {
  path: string;
  name: string;
  lastOpenedAt: number;
}

interface WorkspaceState {
  recentWorkspaces: RecentWorkspace[];
  showWelcome: boolean;
}

const initialState: WorkspaceState = {
  recentWorkspaces: [],
  showWelcome: true,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setRecentWorkspaces(state, action: PayloadAction<RecentWorkspace[]>) {
      state.recentWorkspaces = action.payload.slice(0, MAX_RECENT_WORKSPACES);
    },
    addRecentWorkspace(state, action: PayloadAction<RecentWorkspace>) {
      const filtered = state.recentWorkspaces.filter(
        (w) => w.path !== action.payload.path
      );
      state.recentWorkspaces = [action.payload, ...filtered].slice(
        0,
        MAX_RECENT_WORKSPACES
      );
    },
    removeRecentWorkspace(state, action: PayloadAction<string>) {
      state.recentWorkspaces = state.recentWorkspaces.filter(
        (w) => w.path !== action.payload
      );
    },
    setShowWelcome(state, action: PayloadAction<boolean>) {
      state.showWelcome = action.payload;
    },
  },
});

export const {
  setRecentWorkspaces,
  addRecentWorkspace,
  removeRecentWorkspace,
  setShowWelcome,
} = workspaceSlice.actions;
export default workspaceSlice.reducer;
