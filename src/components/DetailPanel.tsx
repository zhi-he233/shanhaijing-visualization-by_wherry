import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMapStore, useSelectedNode } from "../store/useMapStore";
import { TYPE_LABEL, type NodeType } from "../types";
import { getPath, isMissing } from "../utils/tree";

const CONTAINER_NOTE: Partial<Record<NodeType, string>> = {
  overview: "总览是编排入口，原文见其下各卷。",
  volume: "卷是归类节点，原文见其下各条。",
  region: "区域是按方位做的概念归类，不是原书篇名。",
};

function Field({
  title,
  value,
  classical = false,
  note,
}: {
  title: string;
  value: string | null | undefined;
  classical?: boolean;
  note?: string;
}) {
  const missing = isMissing(value);
  return (
    <section className="panelField">
      <h3>{title}</h3>
      {missing ? (
        <p className="pendingLine">
          <span className="pendingChip">缺</span>
          待补
          {note && <span className="fieldNote">{note}</span>}
        </p>
      ) : (
        <p className={classical ? "classical" : "vernacular"}>{value}</p>
      )}
    </section>
  );
}

export function DetailPanel() {
  const selected = useSelectedNode();
  const nodesById = useMapStore((state) => state.nodesById);
  const selectNode = useMapStore((state) => state.selectNode);
  const drillTo = useMapStore((state) => state.drillTo);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") selectNode(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, selectNode]);

  const path = selected ? getPath(selected.id, nodesById) : [];
  const isContainer = selected ? selected.children.length > 0 : false;

  return (
    <AnimatePresence>
      {selected && (
        <motion.aside
          key={selected.id}
          className="detailPanel"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
          aria-label={`${selected.name} 详情`}
        >
          <header className="panelHead">
            <div>
              <span className={`typePill type-${selected.type}`}>
                {TYPE_LABEL[selected.type]}
              </span>
              <h2>{selected.name}</h2>
            </div>
            <button
              type="button"
              className="panelClose"
              onClick={() => selectNode(null)}
              aria-label="关闭详情"
            >
              ×
            </button>
          </header>

          <p className="panelPath">
            {path
              .slice(0, -1)
              .map((node) => node.name)
              .join(" › ") || "总览"}
          </p>

          <div className="panelBody">
            <Field
              title="原文"
              value={selected.originalText}
              classical
              note={CONTAINER_NOTE[selected.type]}
            />
            <Field title="白话" value={selected.summary} />
            <Field title="出处" value={selected.source} />
          </div>

          <footer className="panelFoot">
            {isContainer ? (
              <button
                type="button"
                className="primaryButton"
                onClick={() => drillTo(selected.id)}
              >
                进入 {selected.name} · {selected.children.length} 项
              </button>
            ) : (
              <p className="leafNote">此条为最末一层，已无下钻内容。</p>
            )}
            <p className="idNote">节点 ID：{selected.id}</p>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
