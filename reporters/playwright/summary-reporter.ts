import { appendFileSync } from "node:fs";
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
} from "@playwright/test/reporter";

class SummaryReporter implements Reporter {
  private suite!: Suite;

  onBegin(_config: FullConfig, suite: Suite) {
    this.suite = suite;
  }

  onEnd(result: FullResult) {
    const file = process.env.GITHUB_STEP_SUMMARY;
    if (!file) return; // not running in GitHub Actions

    const counts = { expected: 0, unexpected: 0, flaky: 0, skipped: 0 };
    const failures: string[] = [];
    const flaky: string[] = [];

    for (const test of this.suite.allTests()) {
      const outcome = test.outcome();
      counts[outcome]++;
      const name = `\`${test.titlePath().slice(1).join(" › ")}\``;
      if (outcome === "unexpected") failures.push(`- ${name}`);
      if (outcome === "flaky") flaky.push(`- ${name}`);
    }

    const md = [
      "## Playwright Test Report",
      "",
      "### Summary",
      "",
      "| ✅ Passed | ❌ Failed | ⚠️ Flaky | ⏭️ Skipped |",
      "|:---:|:---:|:---:|:---:|",
      `| ${counts.expected} | ${counts.unexpected} | ${counts.flaky} | ${counts.skipped} |`,
      "",
      ...(failures.length ? ["### Failures", ...failures, ""] : []),
      ...(flaky.length ? ["### Flaky", ...flaky, ""] : []),
      `Duration: ${(result.duration / 1000).toFixed(1)}s`,
      "",
    ].join("\n");

    appendFileSync(file, md);
  }
}

export default SummaryReporter;
