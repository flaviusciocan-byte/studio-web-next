import fs from "fs";
import path from "path";

const STORE_PATH = path.join(process.cwd(), 
"project-state.json");

export type StoredModuleState = {
  id: string;
  active: boolean;
};

export type ProjectStore = {
  modules: Record<string, StoredModuleState>;
};

export function loadStore(): ProjectStore {
  if (!fs.existsSync(STORE_PATH)) {
    return { modules: {} };
  }
  const raw = fs.readFileSync(STORE_PATH, "utf-8");
  return JSON.parse(raw);
}

export function saveStore(store: ProjectStore) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 
2), "utf-8");
}

export function getStoredModule(moduleId: string): 
StoredModuleState {
  const store = loadStore();
  return store.modules[moduleId] || { id: moduleId, active: 
false };
}

export function setStoredModule(module: StoredModuleState) {
  const store = loadStore();
  store.modules[module.id] = module;
  saveStore(store);
}

