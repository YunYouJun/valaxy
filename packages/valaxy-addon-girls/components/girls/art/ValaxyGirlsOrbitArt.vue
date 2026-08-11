<template>
  <svg
    class="valaxy-girls-orbit-art-svg"
    viewBox="0 0 800 360"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
    focusable="false"
  >
    <g class="valaxy-girls-orbit-art-rings">
      <ellipse cx="400" cy="180" rx="338" ry="102" />
      <ellipse cx="400" cy="180" rx="290" ry="136" transform="rotate(-8 400 180)" />
      <ellipse cx="400" cy="180" rx="238" ry="154" transform="rotate(9 400 180)" />
    </g>
    <g class="valaxy-girls-orbit-art-nodes">
      <circle cx="68" cy="180" r="4" />
      <circle cx="178" cy="89" r="3" />
      <circle cx="622" cy="92" r="3" />
      <circle cx="732" cy="180" r="4" />
      <circle cx="204" cy="281" r="3" />
      <circle cx="594" cy="284" r="3" />
    </g>
    <g class="valaxy-girls-orbit-art-sparks">
      <path d="M116 108v16M108 116h16" />
      <path d="M681 245v18M672 254h18" />
      <path d="M405 24v12M399 30h12" />
    </g>
  </svg>
</template>

<style scoped>
.valaxy-girls-orbit-art-svg {
  color: var(--valaxy-girls-sky);
}

.valaxy-girls-orbit-art-rings {
  fill: none;
  stroke: color-mix(in srgb, currentcolor 36%, transparent);
  stroke-width: 1.5;
}

.valaxy-girls-orbit-art-rings ellipse:nth-child(2) {
  stroke-dasharray: 3 8;
}

.valaxy-girls-orbit-art-nodes {
  fill: var(--valaxy-girls-paper);
  stroke: color-mix(in srgb, currentcolor 66%, transparent);
  stroke-width: 1.5;
}

.valaxy-girls-orbit-art-sparks {
  fill: none;
  stroke: color-mix(in srgb, var(--valaxy-girls-blush) 68%, currentcolor);
  stroke-linecap: round;
  stroke-width: 1.5;
}
</style>
