import { useCurrentNode, useMapStore } from "../../store/useMapStore";
import { CENTER, polar, projectToRadius } from "../../utils/geometry";
import { NodeGlyph } from "../Glyphs";

/**
 * 总览层：中为中山经，内环为四山经，外圈由内向外依次是海外、海内、大荒。
 * 环半径属于版式常量，与数据无关；海外/海内/大荒的成员由各自的 map 坐标定方向。
 * 方位注记不画在环上（会与环成员标签打架），改用画布角上的罗盘。
 */
const RING_RADII = [250, 342, 430];
/** 环标签放在左上斜向 —— 四个正方位都被环上成员占满了 */
const REGION_LABEL_ANGLE = 225;
const HORIZONTAL_ROW_TOLERANCE = 54;

function ringRadiusFor(index: number): number {
  if (index < RING_RADII.length) return RING_RADII[index];
  return RING_RADII[RING_RADII.length - 1] + (index - RING_RADII.length + 1) * 92;
}

function cardLayoutForOverviewPoint(nodeId: string, y: number) {
  if (nodeId === "volume-zhongshan") return "square" as const;
  return Math.abs(y - CENTER.y) <= HORIZONTAL_ROW_TOLERANCE ? "vertical" as const : "horizontal" as const;
}

export function OverviewLayer() {
  const current = useCurrentNode();
  const query = useMapStore((state) => state.query);
  const selectedNodeId = useMapStore((state) => state.selectedNodeId);
  const drillTo = useMapStore((state) => state.drillTo);

  if (!current) return null;

  const keyword = query.trim();
  const volumes = current.children.filter((node) => node.type === "volume" && node.map);
  const regions = current.children.filter((node) => node.type === "region" && node.map);

  return (
    <g className="layer layerOverview">
      <g className="ringGuides" aria-hidden="true">
        {RING_RADII.map((radius) => (
          <circle key={radius} cx={CENTER.x} cy={CENTER.y} r={radius} />
        ))}
      </g>

      {regions.map((region, regionIndex) => {
        const radius = ringRadiusFor(regionIndex);
        const labelAt = polar(CENTER.x, CENTER.y, radius, REGION_LABEL_ANGLE);
        const regionHit =
          !keyword ||
          region.name.includes(keyword) ||
          region.children.some((child) => child.name.includes(keyword));

        return (
          <g key={region.id} className="regionGroup">
            <circle className="ringLine" cx={CENTER.x} cy={CENTER.y} r={radius} />

            {region.children.map((child, childIndex) => {
              if (!child.map) return null;
              const point = projectToRadius(child.map, CENTER, radius);
              const hit = !keyword || child.name.includes(keyword);

              return (
                <NodeGlyph
                  key={child.id}
                  node={child}
                  x={point.x}
                  y={point.y}
                  layout={cardLayoutForOverviewPoint(child.id, point.y)}
                  scale={0.66}
                  order={childIndex + regionIndex * 2}
                  selected={selectedNodeId === child.id}
                  dimmed={!hit}
                  matched={Boolean(keyword) && hit}
                  onActivate={drillTo}
                />
              );
            })}

            <g
              className={`ringLabel${regionHit ? "" : " is-dimmed"}`}
              transform={`translate(${labelAt.x} ${labelAt.y})`}
              onClick={() => drillTo(region.id)}
              role="button"
              tabIndex={0}
              aria-label={`进入${region.name}`}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  drillTo(region.id);
                }
              }}
            >
              <rect x={-30} y={-17} width={60} height={34} rx={4} />
              <text y={6} textAnchor="middle">
                {region.name}
              </text>
            </g>
          </g>
        );
      })}

      {/* 五藏山经：中山经居中，南西北东分居四方 */}
      {volumes.map((node, index) =>
        node.map ? (
          <NodeGlyph
            key={node.id}
            node={node}
            x={node.map.x}
            y={node.map.y}
            layout={cardLayoutForOverviewPoint(node.id, node.map.y)}
            scale={node.id === "volume-zhongshan" ? 1.05 : 0.92}
            order={index}
            selected={selectedNodeId === node.id}
            dimmed={Boolean(keyword) && !node.name.includes(keyword)}
            matched={Boolean(keyword) && node.name.includes(keyword)}
            onActivate={drillTo}
          />
        ) : null
      )}
    </g>
  );
}
