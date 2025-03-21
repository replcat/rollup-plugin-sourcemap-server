# rollup-plugin-sourcemap-server

A minimal rollup plugin to add a local HTTP server for hosting source files in watch mode.

## Why?

Firefox (and maybe other browsers) block web extensions from accessing the `file://` protocol for security reasons. This makes sourcemaps and other local files unreachable without hosting them in some other way.

This bit me enough times that I wrote this plugin as a drop-in solution, provided that you're happy to run rollup in watch mode while debugging.

## Installation

```bash
npm install --save-dev rollup-plugin-sourcemap-server
```

## Usage

```javascript
// rollup.config.js

import sourcemap_server from "rollup-plugin-sourcemap-server"

export default {
  input: "src/index.js",

  output: {
    file: "dist/bundle.js",

    // additional sourcemap config is optional...
    // ... note that any value for `sourcemapBaseUrl` will be ignored in watch mode.
  },

  plugins: [
    // plugin config is optional (default values are shown)
    sourcemap_server({
      host: "localhost",
      port: 8080
    }),
  ]
}
```

```
$ rollup -c --watch

rollup v4.x.x
bundles src/index.js → dist/bundle.js...
[plugin sourcemap-server] listening on http://localhost:8080
created dist/bundle.js in 500ms

[<timestamp>] waiting for changes...
[plugin sourcemap-server] request: /dist/bundle.js.map → ./dist/bundle.js.map (OK)
[plugin sourcemap-server] request: /src/index.js → ./src/index.js (OK)
```

## License

MIT
