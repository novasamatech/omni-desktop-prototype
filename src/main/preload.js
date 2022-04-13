/* eslint-disable promise/catch-or-return */
const { contextBridge, ipcRenderer } = require('electron');
const Olm = require('@matrix-org/olm/olm');

contextBridge.exposeInMainWorld('electron', {
  accountStore: {
    all: () => ipcRenderer.invoke('account-store-all'),
    remove: (address) => ipcRenderer.invoke('account-store-remove', address),
    add: (address) => ipcRenderer.invoke('account-store-add', address),
  },
});

Olm.init();

contextBridge.exposeInMainWorld('Olm', Olm);
