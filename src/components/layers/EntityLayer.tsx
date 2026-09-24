import { useCurrentNode, useMapStore, useVisibleChildren } from "../../store/useMapStore";
import { CENTER } from "../../utils/geometry";
import { NodeGlyph } from "../Glyphs";

export function EntityLayer() {
  const current = useCurrentNode();
  const children = useVisibleChildren();
  const query = useMapStore((state) => state.query);
  const selectedNodeId = useMapStore((state) => state.selectedNodeId);
  const drillTo = useMapStore((state) => state.drillTo);

  const keyword = query.trim();
  const placed = children.filter((child) => child.map);

  return (
    <g className="layer layerEntity">
      <g className="hostTextBlock" transform={`translate(${CENTER.x} ${CENTER.y})`}>
        <rect x={-150} y={-54} width={300} height={108} rx={10} />
        <text className="hostEyebrow" y={-20} textAnchor="middle">
          当前山名
        </text>
        <text className="hostName" y={18} textAnchor="middle">
          {current?.name}
        </text>
        <text className="hostMeta" y={42} textAnchor="middle">
          山中实体 · 点击查看出处
        </text>
      </g>

      {placed.map((child, index) => (
        <g key={child.id}>
          <line
            className="heritageLine"
            x1={CENTER.x}
            y1={CENTER.y}
            x2={child.map!.x}
            y2={child.map!.y}
          />
          <NodeGlyph
            node={child}
            x={child.map!.x}
            y={child.map!.y}
            order={index}
            scale={0.98}
            selected={selectedNodeId === child.id}
            matched={Boolean(keyword)}
            onActivate={drillTo}
          />
        </g>
      ))}

      {placed.length === 0 && (
        <text className="emptyHint" x={CENTER.x} y={CENTER.y + 160} textAnchor="middle">
          {current?.name} 之中暂无「{keyword}」
        </text>
      )}
    </g>
  );
}
