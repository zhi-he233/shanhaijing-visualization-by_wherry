import { motion } from "framer-motion";
import { useCurrentNode, useMapStore, useVisibleChildren } from "../../store/useMapStore";
import { catmullRomPath, CENTER, type Point } from "../../utils/geometry";
import { NodeGlyph } from "../Glyphs";

/**
 * 链层：卷下的诸山系、山系下的诸山，都是一条按次第展开的山径。
 * 连线用 Catmull-Rom 平滑，节点位置全部来自数据里的 map 坐标。
 */
export function ChainLayer() {
  const current = useCurrentNode();
  const children = useVisibleChildren();
  const query = useMapStore((state) => state.query);
  const selectedNodeId = useMapStore((state) => state.selectedNodeId);
  const drillTo = useMapStore((state) => state.drillTo);

  const keyword = query.trim();
  const placed = children.filter((child) => child.map);
  const points: Point[] = placed.map((child) => child.map as Point);
  const trail = catmullRomPath(points);
  const isRange = current?.type === "range";

  return (
    <g className="layer layerChain">
      {points.length > 1 && (
        <>
          <path className="trailUnderlay" d={trail} />
          <motion.path
            className="trail"
            d={trail}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          />
        </>
      )}

      {/* 山径上的里程点 */}
      {points.map((point) => (
        <circle
          key={`tick-${point.x}-${point.y}`}
          className="trailTick"
          cx={point.x}
          cy={point.y}
          r={3}
        />
      ))}

      {placed.map((child, index) => (
        <NodeGlyph
          key={child.id}
          node={child}
          x={child.map!.x}
          y={child.map!.y}
          order={index}
          scale={isRange ? 1.15 : 0.9}
          selected={selectedNodeId === child.id}
          matched={Boolean(keyword)}
          onActivate={drillTo}
        />
      ))}

      {placed.length === 0 && (
        <text className="emptyHint" x={CENTER.x} y={CENTER.y} textAnchor="middle">
          {current?.name} 之下暂无「{keyword}」
        </text>
      )}
    </g>
  );
}
