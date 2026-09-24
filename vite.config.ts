import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages 把站点放在 https://<user>.github.io/<repo>/ 子路径下，
// 构建时必须把资源前缀设成仓库名，否则 JS/CSS 会 404。
// 本地 dev 仍用根路径，方便直接开 localhost 看效果。
const REPO_NAME = "shanhaijing-visualization-by_wherry";

export default defineConfig(({ command }) => ({
  base: command === "build" ? `/${REPO_NAME}/` : "/",
  plugins: [react()]
}));
