/**
 * custom easing
 */
export const cubicBezier: Record<string, [number, number, number, number]> = {
  /**
   * 慢速开始，然后加速
   */
  easeIn: [0.18, 0.66, 0.05, 0.96],
  /**
   * 慢速开始和结束
   */
  easeInOut: [0.77, 0, 0.17, 1.02],
}
