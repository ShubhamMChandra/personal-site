/**
 * ============================================================
 * percy-snapshots.mjs - Percy visual regression test runner
 * ============================================================
 *
 * WHAT:         Serves the site locally and runs Percy snapshots
 * WHY:          Automated visual regression testing across viewports
 * DEPENDENCIES: @percy/cli, serve (npx)
 * HOW:          npm run percy:test
 *
 * OVERVIEW:
 *   1. Starts a local static server on port 3847
 *   2. Runs `percy snapshot` against the snapshots.cjs config
 *   3. Percy captures each defined page at all configured widths
 *      (320, 393, 440, 900, 901, 1200 — set in .percy.yml)
 *   4. Shuts down the server when done
 *
 * PERCY_TOKEN:
 *   - Set PERCY_TOKEN env var to upload snapshots for comparison
 *   - Without a token, Percy runs in dry-run mode (local only)
 *   - Free tier: 5,000 screenshots/month
 *
 * SNAPSHOTS CAPTURED:
 *   - Shelf (home view with all book spines)
 *   - Work book (Table of Contents)
 *   - About book (Introduction)
 *   - Contact book
 *   - References book (first reference)
 *
 * ============================================================
 */

import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = join(__dirname, '..')

const PORT = 3847
const SNAPSHOTS_FILE = join(PROJECT_ROOT, 'snapshots.cjs')

/**
 * Spawn a child process and return a promise that resolves
 * with { process, exitPromise }.
 */
function startServer () {
  return new Promise((resolve, reject) => {
    const server = spawn('npx', ['serve', '-p', String(PORT), '-s'], {
      cwd: PROJECT_ROOT,
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let started = false

    server.stdout.on('data', (data) => {
      const output = data.toString()
      if (!started && (output.includes('Accepting connections') || output.includes('http://localhost'))) {
        started = true
        resolve(server)
      }
    })

    server.stderr.on('data', (data) => {
      const output = data.toString()
      // serve prints info to stderr as well
      if (!started && (output.includes('Accepting connections') || output.includes('http://localhost'))) {
        started = true
        resolve(server)
      }
    })

    server.on('error', (err) => {
      if (!started) {
        reject(new Error(`Failed to start server: ${err.message}`))
      }
    })

    server.on('close', (code) => {
      if (!started) {
        reject(new Error(`Server exited with code ${code} before starting`))
      }
    })

    // Fallback: resolve after a generous timeout even if we don't see the message
    setTimeout(() => {
      if (!started) {
        started = true
        resolve(server)
      }
    }, 5000)
  })
}

/**
 * Run percy snapshot against the snapshots configuration file.
 * Returns a promise that resolves with the exit code.
 */
function runPercy () {
  return new Promise((resolve) => {
    const args = ['percy', 'snapshot', SNAPSHOTS_FILE]

    // If no PERCY_TOKEN is set, run in dry-run mode
    if (!process.env.PERCY_TOKEN) {
      args.push('--dry-run')
      console.log('[percy] No PERCY_TOKEN found — running in dry-run mode\n')
    }

    const percy = spawn('npx', args, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      env: { ...process.env }
    })

    percy.on('close', (code) => {
      resolve(code)
    })
  })
}

/**
 * Gracefully kill a child process.
 */
function killProcess (proc) {
  return new Promise((resolve) => {
    if (!proc || proc.killed) {
      resolve()
      return
    }

    proc.on('close', () => resolve())
    proc.kill('SIGTERM')

    // Force kill after 5 seconds
    setTimeout(() => {
      if (!proc.killed) {
        proc.kill('SIGKILL')
      }
      resolve()
    }, 5000)
  })
}

// ── Main ────────────────────────────────────────────────────

async function main () {
  let server = null

  try {
    console.log(`[percy] Starting local server on port ${PORT}...`)
    server = await startServer()
    console.log(`[percy] Server running at http://localhost:${PORT}\n`)

    console.log('[percy] Running Percy snapshots...\n')
    const exitCode = await runPercy()

    if (exitCode !== 0) {
      console.error(`\n[percy] Percy exited with code ${exitCode}`)
    } else {
      console.log('\n[percy] Percy snapshots completed successfully')
    }

    process.exitCode = exitCode
  } catch (err) {
    console.error(`[percy] Error: ${err.message}`)
    process.exitCode = 1
  } finally {
    if (server) {
      console.log('\n[percy] Shutting down server...')
      await killProcess(server)
    }
  }
}

main()
