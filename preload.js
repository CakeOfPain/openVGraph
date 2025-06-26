const { contextBridge, ipcRenderer } = require("electron");
const gremlin = require("gremlin");
const {driver} = gremlin;

contextBridge.exposeInMainWorld("nav", {
  goTo: (page) => ipcRenderer.send("navigate-to", page),
});

const { DriverRemoteConnection } = gremlin.driver;
const { PlainTextSaslAuthenticator } = gremlin.driver.auth;

contextBridge.exposeInMainWorld('gremlinApi', {
  createAuthenticator: (username, password) =>
    new PlainTextSaslAuthenticator(username, password),

  checkSchema: async (endpoint, options) => {
    try {
        const connection = new DriverRemoteConnection(endpoint, options);
        const traversal = gremlin.process.AnonymousTraversalSource.traversal();
        const g = traversal.withRemote(connection);
        await g.V().limit(1).toList();
        await connection.close();
    } catch(e) {
        return false;
    }
    return true;
  }
});

// pull saved JanusGraph connection info
const cfg = JSON.parse(localStorage.getItem('connection_config') || '{}');
const protocol = cfg.useSSL ? 'wss' : 'ws';
const url = `${protocol}://${cfg.host}:${cfg.port}${cfg.path}`;
const options = {
  mimeType: 'application/json'
};

if (cfg.username && cfg.password) {
  // uses PlainTextSaslAuthenticator under the hood
  options.auth = { username: cfg.username, password: cfg.password };
}

const client = new driver.Client(url, options);

contextBridge.exposeInMainWorld('api', {
  executeQuery: async (query) => {
    try {
      const result = await client.submit(query);
      // in newer gremlin-js, result._items is the array; else result is already array-like
      return result._items || result;
    } catch (err) {
      console.error('Gremlin error:', err);
      throw err;
    }
  }
});