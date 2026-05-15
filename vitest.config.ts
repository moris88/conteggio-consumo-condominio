import { defineConfig } from 'vitest/config'
import path from "path"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Questo è essenziale per risolvere gli import con @
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    include: ["src/__tests__/**/*.test.ts", "src/__tests__/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "json-summary", "html"],
      include: [
        "src/utils/calcoli.ts",
        "src/utils/cn.ts",
        "src/utils/esporta.ts",
        "src/store/useAppStore.ts",
        "src/components/BollettaStep.tsx",
        "src/components/BollettaLuceStep.tsx",
        "src/components/CondominiStep.tsx",
        "src/components/RisultatiStep.tsx",
        "src/components/ConsumiStep.tsx",
        "src/components/ui/Button.tsx",
        "src/components/ui/Input.tsx",
        "src/components/ui/NumberInput.tsx",
        "src/components/ui/Alert.tsx",
        "src/components/ui/Card.tsx",
        "src/components/ui/Separator.tsx",
        "src/components/ui/Badge.tsx",
        "src/components/ui/Stepper.tsx",
        "src/components/ui/Select.tsx",
        "src/components/ui/Modal.tsx",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
