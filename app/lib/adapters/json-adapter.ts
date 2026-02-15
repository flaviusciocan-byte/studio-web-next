import { ProjectAdapter, ModuleState } from 
"../project-adapter";
import { getStoredModule, setStoredModule } from 
"../project-store";

export const JsonProjectAdapter: ProjectAdapter = {
  async getModule(id: string): Promise<ModuleState> {
    return getStoredModule(id);
  },

  async setModule(state: ModuleState): Promise<void> {
    setStoredModule(state);
  },

  async toggleModule(id: string): Promise<ModuleState> {
    const current = getStoredModule(id);
    const next = { id, active: !current.active };
    setStoredModule(next);
    return next;
  }
};
