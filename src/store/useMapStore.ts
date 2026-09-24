import { useMemo } from "react";
import { create } from "zustand";
import type { FlatNode, ShanhaijingNode } from "../types";
import { flattenTree, getPath } from "../utils/tree";

type Status = "idle" | "loading" | "ready" | "error";

interface MapState {
  rootId: string | null;
  currentNodeId: string | null;
  selectedNodeId: string | null;
  nodesById: Record<string, FlatNode>;
  query: string;
  status: Status;
  error: string | null;

  loadData: () => Promise<void>;
  /** 下钻：进入该节点所在的一层，并把该节点本身作为详情展示对象 */
  drillTo: (nodeId: string) => void;
  /** 仅选中，不改变当前层 */
  selectNode: (nodeId: string | null) => void;
  goBack: () => void;
  /** 面包屑跳转 */
  goTo: (nodeId: string) => void;
  setQuery: (query: string) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  rootId: null,
  currentNodeId: null,
  selectedNodeId: null,
  nodesById: {},
  query: "",
  status: "idle",
  error: null,

  async loadData() {
    if (get().status === "loading" || get().status === "ready") return;
    set({ status: "loading", error: null });

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data/shanhaijing.json`);
      if (!response.ok) {
        throw new Error(`数据读取失败（HTTP ${response.status}）`);
      }

      const root = (await response.json()) as ShanhaijingNode;
      set({
        rootId: root.id,
        currentNodeId: root.id,
        // 首屏不展开详情面板，让地图占满视野；点击节点后再弹
        selectedNodeId: null,
        nodesById: flattenTree(root),
        status: "ready",
        error: null,
      });
    } catch (error) {
      set({
        status: "error",
        error: error instanceof Error ? error.message : "数据读取失败",
      });
    }
  },

  drillTo(nodeId) {
    const node = get().nodesById[nodeId];
    if (!node) return;

    if (node.children.length === 0) {
      set({ selectedNodeId: nodeId });
      return;
    }

    set({ currentNodeId: nodeId, selectedNodeId: nodeId, query: "" });
  },

  selectNode(nodeId) {
    set({ selectedNodeId: nodeId });
  },

  goBack() {
    const { currentNodeId, nodesById } = get();
    const current = currentNodeId ? nodesById[currentNodeId] : undefined;
    if (!current?.parentId) return;
    set({
      currentNodeId: current.parentId,
      selectedNodeId: current.parentId,
      query: "",
    });
  },

  goTo(nodeId) {
    const node = get().nodesById[nodeId];
    if (!node) return;
    if (node.children.length === 0) {
      set({ selectedNodeId: nodeId });
      return;
    }
    set({ currentNodeId: nodeId, selectedNodeId: nodeId, query: "" });
  },

  setQuery(query) {
    set({ query });
  },
}));

/* ---------- 派生数据的 hooks ---------- */

export function useCurrentNode(): FlatNode | null {
  return useMapStore((state) =>
    state.currentNodeId ? (state.nodesById[state.currentNodeId] ?? null) : null
  );
}

export function useSelectedNode(): FlatNode | null {
  return useMapStore((state) =>
    state.selectedNodeId ? (state.nodesById[state.selectedNodeId] ?? null) : null
  );
}

export function useBreadcrumbPath(): FlatNode[] {
  const currentNodeId = useMapStore((state) => state.currentNodeId);
  const nodesById = useMapStore((state) => state.nodesById);
  // 同上：getPath 每次返回新数组，只能放在 useMemo 里派生
  return useMemo(() => getPath(currentNodeId, nodesById), [currentNodeId, nodesById]);
}

/**
 * 当前层中通过搜索过滤后的子节点。
 * 过滤必须放在 useMemo 里：selector 每次返回新数组会让 useSyncExternalStore 反复判定快照变化。
 */
export function useVisibleChildren(): FlatNode[] {
  const children = useMapStore((state) =>
    state.currentNodeId
      ? (state.nodesById[state.currentNodeId]?.children ?? EMPTY)
      : EMPTY
  );
  const query = useMapStore((state) => state.query);

  return useMemo(() => {
    const keyword = query.trim();
    if (!keyword) return children;
    return children.filter((child) => child.name.includes(keyword));
  }, [children, query]);
}

const EMPTY: FlatNode[] = [];
