import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FileTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileTreeNode[];
  isExpanded?: boolean;
  isLoading?: boolean;
}

interface FileExplorerState {
  rootPath: string;
  tree: FileTreeNode[];
  selectedFilePath: string | null;
  expandedPaths: Set<string>;
  searchQuery: string;
  isVisible: boolean;
}

const initialState: FileExplorerState = {
  rootPath: '',
  tree: [],
  selectedFilePath: null,
  expandedPaths: new Set<string>() as any, // Redux Toolkit uses Immer, Set handled via array
  searchQuery: '',
  isVisible: true,
};

const fileExplorerSlice = createSlice({
  name: 'fileExplorer',
  initialState,
  reducers: {
    setRootPath(state, action: PayloadAction<string>) {
      state.rootPath = action.payload;
      state.tree = [];
      state.selectedFilePath = null;
    },
    setTree(state, action: PayloadAction<FileTreeNode[]>) {
      state.tree = action.payload;
    },
    setSelectedFile(state, action: PayloadAction<string | null>) {
      state.selectedFilePath = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    toggleVisibility(state) {
      state.isVisible = !state.isVisible;
    },
    setVisible(state, action: PayloadAction<boolean>) {
      state.isVisible = action.payload;
    },
    updateNodeChildren(state, action: PayloadAction<{ path: string; children: FileTreeNode[] }>) {
      const { path, children } = action.payload;
      const updateChildren = (nodes: FileTreeNode[]): boolean => {
        for (const node of nodes) {
          if (node.path === path) {
            node.children = children;
            node.isExpanded = true;
            node.isLoading = false;
            return true;
          }
          if (node.children && updateChildren(node.children)) {
            return true;
          }
        }
        return false;
      };
      updateChildren(state.tree);
    },
    toggleNodeExpanded(state, action: PayloadAction<string>) {
      const path = action.payload;
      const toggleExpand = (nodes: FileTreeNode[]): boolean => {
        for (const node of nodes) {
          if (node.path === path) {
            node.isExpanded = !node.isExpanded;
            return true;
          }
          if (node.children && toggleExpand(node.children)) {
            return true;
          }
        }
        return false;
      };
      toggleExpand(state.tree);
    },
    setNodeLoading(state, action: PayloadAction<{ path: string; isLoading: boolean }>) {
      const { path, isLoading } = action.payload;
      const setLoading = (nodes: FileTreeNode[]): boolean => {
        for (const node of nodes) {
          if (node.path === path) {
            node.isLoading = isLoading;
            return true;
          }
          if (node.children && setLoading(node.children)) {
            return true;
          }
        }
        return false;
      };
      setLoading(state.tree);
    },
  },
});

export const {
  setRootPath,
  setTree,
  setSelectedFile,
  setSearchQuery,
  toggleVisibility,
  setVisible,
  updateNodeChildren,
  toggleNodeExpanded,
  setNodeLoading,
} = fileExplorerSlice.actions;
export default fileExplorerSlice.reducer;
