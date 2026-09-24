# 山海经 · 多层下钻概念地图

一个可点击下钻的《山海经》概念地图。不追求真实经纬度，按传统方位铺陈：
**总览 → 卷 / 区域 → 山系 → 山 → 实体 → 详情**。

技术栈：React 18 + Vite + TypeScript + Zustand + Framer Motion，地图全部用 SVG 手绘，无 UI 组件库、无 D3。

## 运行

```bash
npm install
npm run dev        # http://localhost:5173（--host 已开，可用手机访问局域网地址看响应式效果）
```

其他命令：

```bash
npm run typecheck  # tsc --noEmit
npm run build      # 类型检查 + 生产构建到 dist/
npm run preview    # 预览构建产物
```

## 项目结构

```
.
├── index.html
├── vite.config.ts
├── tsconfig.json / tsconfig.node.json
├── public/
│   ├── favicon.svg
│   └── data/
│       └── shanhaijing.json      ← 唯一的数据源，组件不硬编码任何内容
└── src/
    ├── main.tsx
    ├── App.tsx                   ← 骨架：页头 / 工具条 / 工作区 / 详情面板
    ├── styles.css                ← 全部样式（宣纸、水墨、朱砂、青绿 + 类别配色变量）
    ├── types.ts                  ← NodeType 枚举、ShanhaijingNode、类别中文名
    ├── store/
    │   └── useMapStore.ts        ← Zustand：数据加载、下钻、返回、选中、搜索
    ├── utils/
    │   ├── tree.ts               ← 摊平、取路径、待补判定
    │   └── geometry.ts           ← 极坐标、投影到环半径、Catmull-Rom 平滑
    └── components/
        ├── MapCanvas.tsx         ← SVG 画布，按当前层类型分发到四个层渲染器
        ├── Glyphs.tsx            ← 节点图元：山形 / 山系岭 / 卷简牍 / 实体圆牌
        ├── Compass.tsx           ← 罗盘（上南下北）
        ├── Toolbar.tsx           ← 返回上一级、当前层标记、搜索
        ├── Breadcrumbs.tsx       ← 面包屑
        ├── Legend.tsx            ← 图例（只列当前层出现的类别）
        ├── DetailPanel.tsx       ← 右侧详情面板（窄屏为底部抽屉）
        └── layers/
            ├── OverviewLayer.tsx ← 总览：中 + 内环四山经 + 外三环
            ├── CircleLayer.tsx   ← 区域：同环诸卷沿一圈排布
            ├── ChainLayer.tsx    ← 卷 / 山系：一条按次第展开的山径
            └── EntityLayer.tsx   ← 山内：山形居中，诸物环绕
```

## 组件树

```
App
├── header.appHeader
│   ├── .brand
│   └── Breadcrumbs              ← useBreadcrumbPath() + 选中项下延的一段
├── Toolbar                      ← useCurrentNode() / useVisibleChildren()
└── .workspace  (hasPanel → 地图区让出宽度)
    ├── MapCanvas                ← svg + Compass
    │   ├── defs（纸张纹理、墨影滤镜）
    │   ├── DistantRanges        ← 远山淡影（山内层不画）
    │   └── AnimatePresence → motion.g
    │       └── CurrentLayer     ← 按 current.type 分发
    │           ├── OverviewLayer → NodeGlyph × 18 + 环层 + 印章标签
    │           ├── CircleLayer   → NodeGlyph × N + 辐条
    │           ├── ChainLayer    → motion.path 山径 + NodeGlyph × N
    │           └── EntityLayer   → MountainShape（主体）+ 牵引线 + NodeGlyph × N
    ├── Legend
    └── DetailPanel              ← 原文 / 白话 / 出处 / 所属路径
```

## JSON Schema

数据在 `public/data/shanhaijing.json`，是一棵自根开始的树。

```jsonc
{
  "id": "mount-zhaoyao",        // 唯一标识，面包屑与索引都用它
  "name": "招摇之山",            // 显示名
  "type": "mountain",           // 见下方枚举
  "parentId": "range-queshan",  // 根节点为 null
  "map": { "x": 108, "y": 545 },// 在「父节点所在层」的坐标系里的位置
  "originalText": "其首曰招摇之山，……",  // 原文，取自公版传世本
  "summary": "鹊山之首的首山，……",      // 现代白话解释，与原文分开存放
  "source": "《山海经·南山经》",         // 出处，每条必填
  "children": []                // 子节点，叶子为空数组
}
```

`type` 枚举：

| 类别 | 含义 | 图元 |
| --- | --- | --- |
| `overview` | 总览根节点 | 不绘制（作为层容器） |
| `volume` | 卷 | 简牍牌位 |
| `region` | 区域（海外 / 海内 / 大荒，按方位所作的归类） | 环 + 印章标签 |
| `range` | 山系 | 连绵的岭 |
| `mountain` | 山 | 三重峰 |
| `plant` | 草木 | 圆形字牌「草」 |
| `animal` | 鸟兽 | 圆形字牌「兽」 |
| `mineral` | 矿物 | 圆形字牌「玉」 |
| `water` | 水泽 | 圆形字牌「水」 |
| `deity` | 神祇 | 圆形字牌「神」 |
| `country` | 方国 | 圆形字牌「国」 |
| `object` | 器物 | 圆形字牌「器」 |

### 坐标约定

`map.x / map.y` 是**该节点在其父节点那一层里的位置**，统一使用 1000×1000 的虚拟坐标系，
渲染时由 `viewBox` 等比缩放到实际屏幕。所以每个层都可以独立排布，互不影响。

区域（`region`）的子节点存在自己那一层的半径 330 的圆周上；总览层渲染时只取方向，
再用 `projectToRadius()` 投到各自的环半径（250 / 342 / 430）上。

### 资料缺失的处理

- 缺失字段写 `"待补"` 或 `null`，不编造。
- 卷与区域是**归类节点**，本来就没有独立原文，`originalText` 为 `null` 属正常，详情面板会注明。
- 地图上图元用**虚线描边**表示资料待补；详情面板里用朱砂「闕」印。

## 数据录入约定

- **原文必须逐字取自公版传世本**（郭璞注、郝懿行笺疏一系），保留原标点，不改字。
  例如「其状如韭而**青华**」不作「青花」，「其名曰迷**榖**」不作「迷谷」。
- 原文与白话分列 `originalText` / `summary` 两个字段，不混写。
- 每条必须有 `source`。
- 异文用「（「鹊山」一作「䧿山」）」的形式写在 `summary` 里，不动 `originalText`。

当前已录入的最小闭环：

```
南山经 → 鹊山之首 → 招摇之山 → 祝余 / 迷榖 / 狌狌 / 育沛
```

其余八山只有山名（取自原文，未编造），原文与白话标为待补；另外十七卷只布列卷名。
`鹊山之首` 的九座山依次为：招摇之山、堂庭之山、猿翼之山、杻阳之山、柢山、亶爰之山、基山、青丘之山、箕尾之山。

## 交互

| 操作 | 结果 |
| --- | --- |
| 点击山形 / 牌位 / 岭 | 下钻一层，详情面板同步显示该节点 |
| 点击圆形字牌（实体） | 打开右侧详情面板 |
| 点击画布空白 | 收起详情面板 |
| `Esc` | 收起详情面板 |
| 面包屑任意一段 | 跳回该层 |
| 返回上一级 | 回到父层 |
| 搜索框 | 按名称过滤**当前层**，命中项标朱砂，未命中项淡出 |

## 原始数据来源

原文为公版古籍。卷名与山名均取自原书篇题，未作杜撰。
《山海经》传世十八卷在本图中全部布列：五藏山经五卷居内，海外四经、海内四经、
大荒四经与海内经共十三卷分别归入海外、海内、大荒三环。
