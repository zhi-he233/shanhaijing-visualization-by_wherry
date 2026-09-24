import { type EntityType, type FlatNode, type NodeType, type ShanhaijingNode, PENDING } from "../types";

const ENTITY_TYPES: NodeType[] = [
  "plant",
  "animal",
  "mineral",
  "water",
  "deity",
  "country",
  "object",
];

export function isEntityType(type: NodeType): type is EntityType {
  return ENTITY_TYPES.includes(type);
}

/** 把树摊平成 id -> 节点 的索引。节点对象引用只创建一次，可在 selector 中安全比较。 */
export function flattenTree(root: ShanhaijingNode): Record<string, FlatNode> {
  const byId: Record<string, FlatNode> = {};

  function visit(node: ShanhaijingNode): FlatNode {
    const flat: FlatNode = { ...node, children: [] };
    byId[node.id] = flat;
    flat.children = node.children.map(visit);
    return flat;
  }

  visit(root);
  return byId;
}

/** 自根到指定节点的一条路径 */
export function getPath(
  nodeId: string | null,
  byId: Record<string, FlatNode>
): FlatNode[] {
  const path: FlatNode[] = [];
  let cursor = nodeId ? byId[nodeId] : undefined;

  while (cursor) {
    path.unshift(cursor);
    cursor = cursor.parentId ? byId[cursor.parentId] : undefined;
  }

  return path;
}

/** 值是否缺失（null / 空串 / “待补”） */
export function isMissing(value: string | null | undefined): boolean {
  return !value || value.trim() === "" || value === PENDING;
}

/** 取可展示文本，缺失时返回统一占位符 */
export function displayText(value: string | null | undefined): string {
  return isMissing(value) ? PENDING : (value as string);
}

const CONTAINER_TYPES: NodeType[] = [
  "overview",
  "volume",
  "region",
  "range",
  "mountain",
];

/**
 * 节点资料是否待补，决定要不要盖朱砂「闕」印。
 *
 * 容器类（卷 / 区域等）本身没有独立原文，不该因此被盖印，
 * 以「其下还有没有内容」为准；内容类则以原文、白话是否有缺为准。
 */
export function isNodePending(node: {
  type: NodeType;
  children: unknown[];
  originalText: string | null;
  summary: string | null;
}): boolean {
  if (CONTAINER_TYPES.includes(node.type)) return node.children.length === 0;
  return isMissing(node.originalText) || isMissing(node.summary);
}
