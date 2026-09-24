import { useMemo, useState } from "react";
import { useCurrentNode } from "../store/useMapStore";
import { TYPE_LABEL, type NodeType } from "../types";

/** 图例按固定顺序排列，只列出当前层实际出现的类别 */
const ORDER: NodeType[] = [
  "volume",
  "region",
  "range",
  "mountain",
  "plant",
  "animal",
  "mineral",
  "water",
  "deity",
  "country",
  "object",
];

const FALLBACK: NodeType[] = [
  "volume",
  "region",
  "range",
  "mountain",
  "plant",
  "animal",
  "mineral",
  "water",
];

export function Legend() {
  const current = useCurrentNode();
  // 窄屏默认收起：展开的图例会盖住本来就不多的地图区域
  const [open, setOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth > 900
  );

  const types = useMemo(() => {
    const present = new Set<NodeType>();
    current?.children.forEach((child) => present.add(child.type));
    const listed = ORDER.filter((type) => present.has(type));
    return listed.length > 0 ? listed : FALLBACK;
  }, [current]);

  return (
    <aside className={`legend${open ? "" : " is-collapsed"}`} aria-label="图例">
      <button
        type="button"
        className="legendToggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        图例
        <span aria-hidden="true">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <ul className="legendList">
          {types.map((type) => (
            <li key={type}>
              <i className={`swatch type-${type}`} aria-hidden="true" />
              {TYPE_LABEL[type]}
            </li>
          ))}
          <li className="legendPending">
            <i className="swatch is-pending" aria-hidden="true" />
            虚线描边＝资料待补
          </li>
          <li className="legendPending">
            <i className="swatch is-drillable" aria-hidden="true">▸</i>
            可继续下钻
          </li>
          <li className="legendHint">点击图元下钻 · 空白处收起详情</li>
        </ul>
      )}
    </aside>
  );
}
