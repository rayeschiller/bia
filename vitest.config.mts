import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Pin a DST-observing timezone so local-date tests (midnight, DST) are deterministic.
process.env.TZ = "America/Los_Angeles";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
