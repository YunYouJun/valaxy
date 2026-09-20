import process from 'node:process'

/** Opt-in phase timings for the build benchmark; silent in normal builds. */
export async function profileBuildPhase<T>(phase: string, run: () => T | Promise<T>): Promise<T> {
  if (!process.env.VALAXY_BUILD_PROFILE)
    return run()
  const started = performance.now()
  try {
    return await run()
  }
  finally {
    process.stdout.write(`[valaxy:build] ${JSON.stringify({ phase, durationMs: performance.now() - started, rssMiB: process.memoryUsage().rss / 1024 / 1024 })}\n`)
  }
}
