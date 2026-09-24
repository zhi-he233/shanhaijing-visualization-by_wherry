import { useCurrentNode, useMapStore, useVisibleChildren } from "../store/useMapStore";
import { TYPE_LABEL } from "../types";
import { displayText } from "../utils/tree";

export function Toolbar() {
  const current = useCurrentNode();
  const rootId = useMapStore((state) => state.rootId);
  const query = useMapStore((state) => state.query);
  const setQuery = useMapStore((state) => state.setQuery);
  const goBack = useMapStore((state) => state.goBack);
  const visible = useVisibleChildren();

  const atRoot = !current || current.id === rootId;
  const total = current?.children.length ?? 0;
  const filtering = query.trim().length > 0;

  return (
    <div className="toolbar">
      <button
        type="button"
        className="backButton"
        onClick={goBack}
        disabled={atRoot}
        title="返回上一级"
      >
        <span aria-hidden="true">←</span>
        返回上一级
      </button>

      <div className="levelTag">
        <span className={`levelDot type-${current?.type ?? "overview"}`} aria-hidden="true" />
        <span className="levelName">{displayText(current?.name)}</span>
        <span className="levelKind">{TYPE_LABEL[current?.type ?? "overview"]}</span>
      </div>

      <label className="searchBox">
        <span className="searchIcon" aria-hidden="true">⌕</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="按名称过滤当前层…"
          aria-label="按名称过滤当前层"
        />
        {filtering && (
          <button
            type="button"
            className="searchClear"
            onClick={() => setQuery("")}
            aria-label="清空搜索"
          >
            ×
          </button>
        )}
      </label>

      {filtering && (
        <p className="searchMeta">
          当前层命中 <b>{visible.length}</b> / {total} 项
        </p>
      )}
    </div>
  );
}
