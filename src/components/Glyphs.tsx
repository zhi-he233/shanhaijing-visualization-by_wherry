import { motion } from "framer-motion";
import type React from "react";
import type { FlatNode } from "../types";
import { TYPE_LABEL } from "../types";
import { isNodePending } from "../utils/tree";

export interface NodeGlyphProps {
  node: FlatNode;
  x: number;
  y: number;
  layout?: CardLayout;
  selected?: boolean;
  dimmed?: boolean;
  matched?: boolean;
  order?: number;
  scale?: number;
  onActivate: (nodeId: string) => void;
}

type CardLayout = "horizontal" | "vertical" | "square";

function getCardLayout(node: FlatNode): CardLayout {
  if (node.id === "volume-zhongshan") return "square";
  return "horizontal";
}

function cardSize(name: string, scale: number, layout: CardLayout) {
  if (layout === "square") {
    return {
      width: Math.max(92, 92 * scale),
      height: Math.max(92, 92 * scale),
    };
  }

  if (layout === "vertical") {
    const baseHeight = Math.max(130, Math.min(178, name.length * 24 + 54));
    return {
      width: Math.max(58, 58 * scale),
      height: Math.max(130, baseHeight * scale),
    };
  }

  const baseWidth = Math.max(108, Math.min(176, name.length * 24 + 48));
  return {
    width: baseWidth * scale,
    height: 80 * scale,
  };
}

function VerticalName({ name, height }: { name: string; height: number }) {
  const chars = Array.from(name);
  const step = Math.min(22, Math.max(17, (height - 66) / Math.max(chars.length - 1, 1)));
  const start = -((chars.length - 1) * step) / 2 + 6;

  return (
    <text className="nodeLabel is-vertical" textAnchor="middle">
      {chars.map((char, index) => (
        <tspan key={`${char}-${index}`} x="0" y={start + index * step}>
          {char}
        </tspan>
      ))}
    </text>
  );
}

export function NodeGlyph({
  node,
  x,
  y,
  layout: forcedLayout,
  selected = false,
  dimmed = false,
  matched = false,
  order = 0,
  scale = 1,
  onActivate,
}: NodeGlyphProps) {
  const pending = isNodePending(node);
  const layout = forcedLayout ?? getCardLayout(node);
  const { width, height } = cardSize(node.name, scale, layout);
  const hasChildren = node.children.length > 0;

  const className = [
    "node",
    `type-${node.type}`,
    selected ? "is-selected" : "",
    dimmed ? "is-dimmed" : "",
    matched ? "is-matched" : "",
    pending ? "is-pending" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const activate = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation();
    onActivate(node.id);
  };

  return (
    <g transform={`translate(${x} ${y})`}>
      <motion.g
        className={className}
        initial={{ opacity: 0, y: 6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.22,
          delay: Math.min(order, 14) * 0.03,
          ease: "easeOut",
        }}
        whileHover={{ y: -3 }}
        onClick={activate}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activate(event);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`${node.name}${hasChildren ? "，可下钻" : ""}`}
      >
        <rect
          className="hitArea"
          x={-width / 2 - 12}
          y={-height / 2 - 12}
          width={width + 24}
          height={height + 24}
          rx={10}
        />
        <rect
          className={`nodeFrame is-${layout}`}
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          rx={8}
        />
        <line
          className="nodeRule"
          x1={-width / 2 + 12}
          x2={width / 2 - 12}
          y1={-height / 2 + 24}
          y2={-height / 2 + 24}
        />
        <text className="nodeKind" x={-width / 2 + 14} y={-height / 2 + 17}>
          {TYPE_LABEL[node.type]}
        </text>
        {hasChildren && layout !== "vertical" && (
          <text className="nodeCount" x={width / 2 - 14} y={-height / 2 + 17} textAnchor="end">
            {node.children.length}项
          </text>
        )}

        {layout === "vertical" ? (
          <VerticalName name={node.name} height={height} />
        ) : (
          <text className="nodeLabel" y={layout === "square" ? 5 : height * 0.12} textAnchor="middle">
            {node.name}
          </text>
        )}

        <text
          className="nodeMeta"
          y={layout === "vertical" ? height / 2 - 12 : layout === "square" ? 30 : height * 0.33}
          textAnchor="middle"
        >
          {pending ? "待补" : hasChildren ? "点击下钻" : "查看详情"}
        </text>
      </motion.g>
    </g>
  );
}
