const fs = require("node:fs/promises")
const http = require("node:http")
const path = require("node:path")

/**
 * @import {PluginImpl} from "rollup"
 * @import {Server} from "node:http"
 * @import {Stats} from "node:fs"
 *
 * @type {PluginImpl<{ host?: string, port?: number }>}
 */
module.exports = function ({ host, port } = {}) {
  host = host ?? "localhost"
  port = port ?? 8080

  /** @type {Server|null} */
  let server = null

  return {
    name: "sourcemap-server",

    options(opts) {
      if (!server && this.meta.watchMode) {
        server = http.createServer(async (req, res) => {
          let resolved_url = path.join(".", req.url ?? "")

          /** @type {Stats|null} */
          let stats = null
          try {
            stats = await fs.stat(resolved_url)
          } catch (_) {}

          let not_found = stats == null
          let not_a_file = stats?.isFile() !== true
          let stats_summary = not_found ? "not found" : not_a_file ? "not a file" : "OK"

          this.info(`request: ${req.url} → ./${resolved_url} (${stats_summary})`)

          if (not_found || not_a_file) {
            res.writeHead(404)
          } else {
            res.writeHead(200, { "Content-Type": "text/plain" })
            res.write(await fs.readFile(resolved_url))
          }

          res.end()
        })

        server.listen(port, host, () => {
          this.info(`listening on http://${host}:${port}`)
        })
      }

      return opts
    },

    outputOptions(opts) {
      if (this.meta.watchMode && opts.file) {
        opts.sourcemap = opts.sourcemap ?? true
        opts.sourcemapBaseUrl = `http://${host}:${port}/${path.dirname(opts.file)}`
      }

      return opts
    },

    async closeWatcher() {
      return new Promise((resolve, reject) => {
        this.info("shutting down...")
        server?.close(err => err ? reject(err) : resolve())
      })
    },
  }
}
