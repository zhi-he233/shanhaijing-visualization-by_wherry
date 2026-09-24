export interface Point {
  x: number;
  y: number;
}

/** 地图统一坐标系（正方形 viewBox，便于等比缩放适配任意屏幕） */
export const VIEW_SIZE = 1000;
export const CENTER: Point = { x: VIEW_SIZE / 2, y: VIEW_SIZE / 2 };

/** 区域环层：区域子节点在自身坐标系里的半径，总览层按环半径等比缩放 */
export const REGION_LOCAL_RADIUS = 330;

export function polar(
  cx: number,
  cy: number,
  radius: number,
  degrees: number
): Point {
  const rad = (degrees * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

/**
 * 把某点相对 center 的方向保留，长度缩放到 radius。
 * 总览层的海外/海内/大荒环用它把区域的子节点摆到各自的环半径上。
 */
export function projectToRadius(point: Point, center: Point, radius: number): Point {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return { ...center };
  return {
    x: center.x + (dx / len) * radius,
    y: center.y + (dy / len) * radius,
  };
}

/** Catmull-Rom 转三次贝塞尔，用于把山系的点位连成一条圆润的山径 */
export function catmullRomPath(points: Point[], tension = 0.5): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const k = (tension * 2) / 6;

    const c1 = { x: p1.x + (p2.x - p0.x) * k, y: p1.y + (p2.y - p0.y) * k };
    const c2 = { x: p2.x - (p3.x - p1.x) * k, y: p2.y - (p3.y - p1.y) * k };

    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

