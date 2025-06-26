const { contextBridge, ipcRenderer } = require("electron");
const gremlin = require("gremlin");


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