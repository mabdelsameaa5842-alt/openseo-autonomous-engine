import { env as cfEnv } from "cloudflare:workers";

export function setGlobalWorkerEnv(env: Env): void {
  if (typeof globalThis !== "undefined") {
    (globalThis as any).__CF_ENV__ = env;
  }
}

export function getGlobalWorkerEnv(): Env {
  if (typeof globalThis !== "undefined" && (globalThis as any).__CF_ENV__) {
    return (globalThis as any).__CF_ENV__;
  }
  return cfEnv;
}
