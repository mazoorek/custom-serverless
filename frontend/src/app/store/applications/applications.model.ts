export interface Endpoint {
  url: string;
  functionName: string;
}

export interface Function {
  name: string;
  content: string;
  idempotent: boolean;
}

export interface Application {
  name: string;
  up: boolean;
  endpoints: Endpoint[];
  functions: Function[];
  packageJson: string;
}
