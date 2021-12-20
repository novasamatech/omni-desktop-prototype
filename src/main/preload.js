const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  accountStore: {
    all: () => ipcRenderer.invoke('account-store-all'),
    remove: (address) => ipcRenderer.invoke('account-store-remove', address),
    add: (address) => ipcRenderer.invoke('account-store-add', address),
  },
});
