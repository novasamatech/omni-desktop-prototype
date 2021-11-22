import { ipcMain } from 'electron';

export type IpcMainHandler = {
  [channel: string]: (...args: any[]) => unknown;
};

export const registerIpcHandler = (ipcHandler: IpcMainHandler): void => {
  Object.entries(ipcHandler).forEach(([channel, listener]) => {
    ipcMain.handle(channel, (_, ...args: unknown[]) => {
      return listener(...args);
    });
  });
};
