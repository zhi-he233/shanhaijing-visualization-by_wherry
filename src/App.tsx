import { useEffect } from "react";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { DetailPanel } from "./components/DetailPanel";
import { Legend } from "./components/Legend";
import { MapCanvas } from "./components/MapCanvas";
import { Toolbar } from "./components/Toolbar";
import { useMapStore } from "./store/useMapStore";

function App() {
  const loadData = useMapStore((state) => state.loadData);
  const status = useMapStore((state) => state.status);
  const error = useMapStore((state) => state.error);
  const hasSelection = useMapStore((state) => state.selectedNodeId !== null);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (status === "idle" || status === "loading") {
    return (
      <main className="appState">
        <span className="appStateSeal">闕</span>
        <p>正在展卷…</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="appState is-error">
        <span className="appStateSeal">誤</span>
        <p>{error}</p>
        <p className="appStateHint">
          请确认 <code>public/data/shanhaijing.json</code> 存在，并通过 dev server 访问。
        </p>
      </main>
    );
  }

  return (
    <div className="app">
      <header className="appHeader">
        <div className="brand">
          <p className="eyebrow">SHAN HAI JING · CONCEPT ATLAS</p>
          <h1>山海经 · 多层下钻概念地图</h1>
        </div>
        <Breadcrumbs />
      </header>

      <Toolbar />

      {/* 面板展开时地图区让出宽度 —— 面板若压在图上，最外侧的大荒诸经会被遮住 */}
      <div className={`workspace${hasSelection ? " hasPanel" : ""}`}>
        <MapCanvas />
        <Legend />
        <DetailPanel />
      </div>
    </div>
  );
}

export default App;
