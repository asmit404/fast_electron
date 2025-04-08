import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld(
  'electron',
  {
    appVersion: process.versions.app,
    platform: process.platform
  }
);
