import { useCurrentNode, useMapStore, useVisibleChildren } from "../../store/useMapStore";
import { CENTER, polar, REGION_LOCAL_RADIUS } from "../../utils/geometry";
import { NodeGlyph } from "../Glyphs";

/** 区域层（海外 / 海内 / 大荒）：同环诸卷沿一圈排布 */
const REGION_LABEL_ANGLE = 225;

export function CircleLayer() {
  const current = useCurrentNode();
  const children = useVisibleChildren();
  const query = useMapStore((state) => state.query);
  const selectedNodeId = useMapStore((state) => state.selectedNodeId);
  const drillTo = useMapStore((state) => state.drillTo);

  const keyword = query.trim();
  const labelAt = polar(CENTER.x, CENTER.y, REGION_LOCAL_RADIUS, REGION_LABEL_ANGLE);
  const placed = children.filter((child) => child.map);

  return (
    <g className="layer layerCircle">
      <circle
        className="ringLine"
        cx={CENTER.x}
        cy={CENTER.y}
        r={REGION_LOCAL_RADIUS}
      />

      <g className="ringLabel is-static" transform={`translate(${labelAt.x} ${labelAt.y})`}>
        <rect x={-30} y={-17} width={60} height={34} rx={4} />
        <text y={6} textAnchor="middle">
          {current?.name}
        </text>
      </g>

      {placed.map((child, index) => (
        <g key={child.id}>
          <line
            className="spoke"
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
            selected={selectedNodeId === child.id}
            matched={Boolean(keyword)}
            onActivate={drillTo}
          />
        </g>
      ))}

      {placed.length === 0 && (
        <text className="emptyHint" x={CENTER.x} y={CENTER.y} textAnchor="middle">
          {current?.name} 之下暂无「{keyword}」
        </text>
      )}
    </g>
  );
}
