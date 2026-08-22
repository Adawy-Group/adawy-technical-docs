/*
 * Deepen a shallow clone before the build, if it is one.
 *
 * Nextra reads each page's last-modified date from git history. CI already
 * checks out with `fetch-depth: 0` for this reason — but the Vercel build is a
 * different clone, and it is shallow. The visible symptom is a page reporting a
 * date from before the file existed: on the first deploy of this script's own
 * PR, `/architecture/patterns` claimed 4 August for a file created on the 22nd.
 *
 * A wrong date is worse than no date, because it reads as a maintained page.
 *
 * This never fails the build. If there is no git directory, no remote, or no
 * credentials, the dates degrade to what they were and everything else ships.
 */
import { execFileSync } from "node:child_process"

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim()
}

try {
  if (git(["rev-parse", "--is-shallow-repository"]) !== "true") {
    process.exit(0)
  }

  console.log("[unshallow] shallow clone detected — fetching full history for page timestamps")
  git(["fetch", "--unshallow", "--quiet"])
  console.log("[unshallow] done")
} catch (error) {
  // Deliberately non-fatal: see the header.
  console.warn(`[unshallow] skipped (${error.message.split("\n")[0]}) — page dates may be wrong`)
}
