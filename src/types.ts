/** 节点类别枚举 */
export type NodeType =
  | "overview"
  | "volume"
  | "region"
  | "range"
  | "mountain"
  | "plant"
  | "animal"
  | "mineral"
  | "water"
  | "deity"
  | "country"
  | "object";

/** 实体类：山中/水中具体名物的类别，均为叶子节点 */
export type EntityType = Extract<
  NodeType,
  "plant" | "animal" | "mineral" | "water" | "deity" | "country" | "object"
>;

export interface MapPoint {
  x: number;
  y: number;
}

/** JSON 中每个节点的结构 */
export interface ShanhaijingNode {
  id: string;
  name: string;
  type: NodeType;
  parentId: string | null;
  map: MapPoint | null;
  originalText: string | null;
  summary: string | null;
  source: string | null;
  children: ShanhaijingNode[];
}

/** 扁平化后的节点：children 指向同样被扁平化的子节点，引用在一次会话内保持稳定 */
export interface FlatNode extends Omit<ShanhaijingNode, "children"> {
  children: FlatNode[];
}

/** 资料缺失的统一占位符 */
export const PENDING = "待补";

/** 类别中文名，用于图例、标签与详情面板 */
export const TYPE_LABEL: Record<NodeType, string> = {
  overview: "总览",
  volume: "卷",
  region: "区域",
  range: "山系",
  mountain: "山",
  plant: "草木",
  animal: "鸟兽",
  mineral: "矿物",
  water: "水泽",
  deity: "神祇",
  country: "方国",
  object: "器物",
};

/** 实体类别内嵌的单字标记，用于地图上的圆形节点 */
export const TYPE_GLYPH: Record<NodeType, string> = {
  overview: "图",
  volume: "卷",
  region: "域",
  range: "系",
  mountain: "山",
  plant: "草",
  animal: "兽",
  mineral: "玉",
  water: "水",
  deity: "神",
  country: "国",
  object: "器",
};
