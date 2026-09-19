<script setup lang="ts">
import valaxyLogo from '../../../../valaxy/client/assets/images/valaxy-logo.png'

defineProps<{
  /** Prevent starting a second project operation. */
  busy: boolean
}>()
defineEmits<{
  /** Open the new-blog form. */
  create: []
  /** Choose an existing blog directory. */
  open: []
}>()
</script>

<template>
  <section class="welcome" aria-labelledby="welcome-title">
    <div class="welcome-main">
      <div class="welcome-copy">
        <p class="welcome-eyebrow">
          VALAXY DESKTOP
        </p>
        <h2 id="welcome-title" class="welcome-title">
          让你的文字，<br><span>拥有自己的星球。</span>
        </h2>
        <p class="welcome-description">
          从第一篇文章，到自己的博客。<br>在这里创建、写作、预览，再把它分享给世界。
        </p>
        <div class="welcome-actions">
          <button class="primary" :disabled="busy" @click="$emit('create')">
            创建我的博客 <span aria-hidden="true">↗</span>
          </button>
          <button :disabled="busy" @click="$emit('open')">
            打开已有博客
          </button>
        </div>
        <p class="welcome-note">
          无需安装开发工具 · 文章保存在你选择的目录
        </p>
      </div>
      <div class="welcome-visual" aria-hidden="true">
        <div class="planet-orbit orbit-outer" />
        <div class="planet-orbit orbit-inner" />
        <div class="planet-core">
          <img :src="valaxyLogo" alt="" width="120" height="120">
        </div>
        <span class="planet-caption">A SPACE FOR YOUR WORDS</span>
      </div>
    </div>
    <ol class="welcome-steps" aria-label="开始写作的三个步骤">
      <li>
        <span class="step-index">01</span><div>
          <h3 class="step-title">
            创建博客
          </h3><p class="step-description">
            选好名字，工作台准备运行环境。
          </p>
        </div>
      </li>
      <li>
        <span class="step-index">02</span><div>
          <h3 class="step-title">
            开始写作
          </h3><p class="step-description">
            编辑文章，随时查看站点效果。
          </p>
        </div>
      </li>
      <li>
        <span class="step-index">03</span><div>
          <h3 class="step-title">
            分享给世界
          </h3><p class="step-description">
            连接发布服务，获得博客网址。
          </p>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.welcome { flex: 1; min-height: 0; overflow: auto; display: flex; flex-direction: column; }
.welcome-main { flex: 1; display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(260px, .7fr); min-height: 400px; }
.welcome-copy { padding: clamp(32px, 4vw, 64px); display: flex; flex-direction: column; align-items: flex-start; justify-content: center; }
.welcome-eyebrow { font: 11px var(--mono); letter-spacing: .16em; color: var(--muted); margin: 0 0 28px; }
.welcome-title { font: 600 clamp(30px, 3.3vw, 48px)/1.4 var(--display); letter-spacing: -.04em; margin: 0; }
.welcome-title span { background: var(--brand-text); background-clip: text; color: transparent; }
.welcome-description { margin: 24px 0 30px; color: var(--muted); font-size: 14px; line-height: 1.9; }
.welcome-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.welcome-actions button { padding: 12px 18px; font-size: 13px; }
.welcome-actions span { margin-left: 12px; }
.welcome-note { font-size: 11px; color: var(--muted); margin: 22px 0 0; line-height: 1.8; }
.welcome-visual { position: relative; display: grid; place-items: center; overflow: hidden; border-left: 1px solid var(--line); background: radial-gradient(ellipse at center, var(--glow), transparent 68%); }
.planet-core { display: grid; place-items: center; width: 162px; height: 162px; border: 1px solid var(--line); border-radius: 50%; background: var(--paper); box-shadow: 0 0 72px var(--glow); }
.planet-core img { width: 102px; height: 102px; object-fit: contain; }
.planet-orbit { position: absolute; width: 310px; height: 130px; border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent); border-radius: 50%; transform: rotate(-35deg); pointer-events: none; }
.orbit-inner { width: 235px; height: 340px; transform: rotate(-35deg); border-color: var(--line); }
.planet-caption { position: absolute; bottom: 42px; font: 9px var(--mono); letter-spacing: .12em; color: var(--muted); }
.welcome-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); padding: 0; margin: 0; list-style: none; border-top: 1px solid var(--line); background: var(--paper); }
.welcome-steps li { display: flex; gap: 16px; padding: 30px 24px; }
.welcome-steps li + li { border-left: 1px solid var(--line); }
.step-index { color: var(--accent); font: 11px/1.8 var(--mono); }
.step-title { font-size: 13px; font-weight: 550; margin: 0 0 8px; }
.step-description { color: var(--muted); font-size: 11px; line-height: 1.8; margin: 0; }
@media (max-width: 1100px) {
  .welcome-main { grid-template-columns: minmax(0, 1fr); }
  .welcome-visual { display: none; }
  .welcome-steps li { padding: 24px 18px; gap: 10px; }
}
@media (max-width: 700px) {
  .welcome-main { min-height: 360px; }
  .welcome-copy { padding: 28px; }
  .welcome-steps { grid-template-columns: 1fr; }
  .welcome-steps li + li { border-left: 0; border-top: 1px solid var(--line); }
}
</style>
