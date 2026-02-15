export type ModuleState = {
  id: string;
  active: boolean;
};

export interface ProjectAdapter {
  getModule(id: string): Promise<ModuleState>;
  setModule(state: ModuleState): Promise<void>;
  toggleModule(id: string): Promise<ModuleState>;
}
