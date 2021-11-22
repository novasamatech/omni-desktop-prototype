const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  accountStore: {
    all: () => ipcRenderer.invoke('account-store-all'),
    remove: (accountId) =>
      ipcRenderer.invoke('account-store-remove', accountId),
    add: (accountId) => ipcRenderer.invoke('account-store-add', accountId),
  },
});
