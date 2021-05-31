export interface Package {
  name: string;
  version: string;
  dependencies: Package[];
}
