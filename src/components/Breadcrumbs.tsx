import { useBreadcrumbPath, useMapStore, useSelectedNode } from "../store/useMapStore";
import { getPath } from "../utils/tree";

/**
 * 面包屑：总览 > 南山经 > 鹊山之首 > 招摇之山 > 祝余
 * 末段是详情面板里选中的那个实体，前面各段是当前所在的层。
 */
export function Breadcrumbs() {
  const path = useBreadcrumbPath();
  const selected = useSelectedNode();
  const nodesById = useMapStore((state) => state.nodesById);
  const goTo = useMapStore((state) => state.goTo);
  const current = path[path.length - 1];

  // 选中项比当前层更深时，把它到当前层之间的一段接到面包屑尾部
  let fullPath = path;
  if (selected && current && selected.id !== current.id) {
    const selectedPath = getPath(selected.id, nodesById);
    const isDescendant =
      selectedPath.length > path.length &&
      selectedPath[path.length - 1]?.id === current.id;
    if (isDescendant) fullPath = selectedPath;
  }

  return (
    <nav className="breadcrumbs" aria-label="当前位置">
      <ol>
        {fullPath.map((node, index) => {
          const isLast = index === fullPath.length - 1;
          const canEnter = node.children.length > 0;
          return (
            <li key={node.id}>
              {index > 0 && <span className="crumbSep" aria-hidden="true">›</span>}
              <button
                type="button"
                className={`crumb${isLast ? " is-current" : ""}`}
                onClick={() => goTo(node.id)}
                disabled={isLast && !canEnter}
                aria-current={isLast ? "page" : undefined}
                title={canEnter ? `进入 ${node.name}` : node.name}
              >
                {index === 0 && <span className="crumbRootMark" aria-hidden="true">⌂</span>}
                {node.name}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
