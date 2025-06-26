# OpenVGraph

**OpenVGraph** is an Electron-based desktop application that lets you connect to a JanusGraph database, run arbitrary Gremlin queries, and visualize the results as an interactive D3 force-directed graph. It also features an integrated Monaco-based Gremlin editor with autocomplete and a JSON viewer pane.

---

## Features

- **Live Gremlin querying** against JanusGraph over WebSocket  
- **Monaco Editor** for your Gremlin scripts (Java mode)  
  - Single-line input  
  - Autocomplete for common Gremlin steps (Ctrl+Space)  
- **D3 Force-Directed Graph**  
  - Pan & zoom  
  - “Zoom-to-fit” on query completion  
  - Node and edge tooltips showing full property maps  
- **Raw JSON viewer** using Monaco in JSON mode  
- **Bootstrap**-powered responsive UI with tabs for Graph / JSON  
- **Auto-fetch** of all vertices & edges when your query returns only vertices

---

## Prerequisites

- **Node.js** ≥ 14  
- **npm** (bundled with Node.js)  
- A running **JanusGraph** instance with WebSocket/Gremlin Server enabled

---

## Installation

1. Clone the repo:  
   ```bash
   git clone https://github.com/your-org/OpenVGraph.git
   cd OpenVGraph
   ```
2. Install dependencies:  
   ```bash
   npm install
   ```
   This pulls in:
   - `electron`  
   - `gremlin` (Gremlin-JS)  
   - `d3`  
   - `bootstrap`  
   - `monaco-editor`

---

## Configuration

Before running the app, configure your JanusGraph connection in the UI:

1. Launch the **Connection** form on first run (or via the menu).  
2. Fill in:
   - **Host** (e.g. `localhost`)  
   - **Port** (e.g. `8182`)  
   - **Use SSL** toggle  
   - **Path** (e.g. `/gremlin`)  
   - **Username** / **Password** (if your server requires authentication)  
3. Click **Save**. Connection settings are persisted in `localStorage`.

---

## Running the App

### Development

```bash
npm run start
```

This will launch the Electron app in development mode. Any changes to renderer files will require a reload.

### Production Build

```bash
npm run build
npm run package
```

Depending on your platform, this generates installers or executables under `dist/`.

---

## Usage

1. Enter a Gremlin query in the single-line editor (e.g. `g.V().limit(20).bothE().bothV().path()`).  
2. Press **Run** or hit `Ctrl+Enter`.  
3. The **Graph** tab will render the force-directed layout.  
   - Drag nodes, pan & zoom with mouse.  
   - Hover for full property tooltips.  
4. Switch to the **Raw JSON** tab to inspect the exact payload returned by JanusGraph.  
5. To delete data, run Gremlin `drop()` queries (e.g. `g.V(123).drop().iterate()`).

---

## Architecture

```
├── main.js           # Electron main process
├── preload.js        # Context-isolated API bridge (Gremlin client)
├── index.html        # Renderer entry
├── renderer.js       # Renderer logic (D3 + Monaco + IPC)
└── package.json
```

- **`preload.js`** uses `contextBridge` to expose `window.api.executeQuery()`  
- **Renderer** loads D3, Monaco, Bootstrap and implements:
  - Query submission → Gremlin over WebSocket  
  - Flattening of GraphSON / Path results  
  - Auto-fetch of all vertices for full graph  
  - Force simulation, zoom/pan, auto-fit  

---

## Gremlin Tips

- To see _only_ vertices:  
  ```groovy
  g.V().toList()
  ```
- To include edges & endpoints:
  ```groovy
  g.V().bothE().bothV().path()
  ```
- To delete a vertex (and its incident edges):
  ```groovy
  g.V(4176).drop().iterate()
  ```

---

## Troubleshooting

- **“Query error”** → Check your JanusGraph server logs, verify WebSocket endpoint & credentials.  
- **Empty graph** → Ensure your query returns both vertices & edges (or let the app auto-fetch edges).  
- **Monaco not loading** → Confirm `monaco-editor` is installed and `vs/loader.js` is present under `node_modules/monaco-editor/min/vs`.

---

## License

MIT © Your Name / Your Organization  
Feel free to adapt, extend, or contribute back via pull requests!