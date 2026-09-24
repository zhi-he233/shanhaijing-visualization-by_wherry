import { AnimatePresence, motion } from "framer-motion";
import { useCurrentNode, useMapStore } from "../store/useMapStore";
import { VIEW_SIZE } from "../utils/geometry";
import { ChainLayer } from "./layers/ChainLayer";
import { CircleLayer } from "./layers/CircleLayer";
import { EntityLayer } from "./layers/EntityLayer";
import { OverviewLayer } from "./layers/OverviewLayer";

function CurrentLayer({ type }: { type: string }) {
  switch (type) {
    case "overview":
      return <OverviewLayer />;
    case "region":
      return <CircleLayer />;
    case "volume":
    case "range":
      return <ChainLayer />;
    default:
      return <EntityLayer />;
  }
}

function AxisLabels() {
  return (
    <g className="axisLabels" aria-hidden="true">
      <text x="500" y="30" textAnchor="middle">北</text>
      <text x="500" y="985" textAnchor="middle">南</text>
      <text x="20" y="510" textAnchor="middle">西</text>
      <text x="980" y="510" textAnchor="middle">东</text>
    </g>
  );
}

export function MapCanvas() {
  const current = useCurrentNode();
  const selectNode = useMapStore((state) => state.selectNode);

  return (
    // 点击空白处（含 SVG 两侧的留白）收起详情面板；
    // 节点自身会 stopPropagation，不会误触
    <section
      className="mapShell"
      aria-label="山海经概念地图"
      onClick={() => selectNode(null)}
    >
      <svg
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-labelledby="mapTitle"
      >
        <title id="mapTitle">山海经多层下钻概念地图</title>
        <defs>
          <filter id="inkShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#3a2c18" floodOpacity="0.18" />
          </filter>
          <pattern id="paperFiber" width="90" height="90" patternUnits="userSpaceOnUse">
            <path d="M0 22 H90 M14 0 V90 M0 63 H90 M61 0 V90" />
          </pattern>
        </defs>

        <rect
          className="paperFiber"
          width={VIEW_SIZE}
          height={VIEW_SIZE}
          fill="url(#paperFiber)"
          pointerEvents="none"
        />
        <AxisLabels />

        <AnimatePresence mode="wait">
          <motion.g
            key={current?.id ?? "empty"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <CurrentLayer type={current?.type ?? "overview"} />
          </motion.g>
        </AnimatePresence>
      </svg>
    </section>
  );
}
