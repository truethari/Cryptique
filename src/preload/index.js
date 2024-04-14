import { contextBridge } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

import { encrypt, decrypt } from "../../lib/crypt";

const api = {
  encrypt,
  decrypt,
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}
