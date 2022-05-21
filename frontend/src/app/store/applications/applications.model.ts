import {EntityState} from '@ngrx/entity';

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
  outdated: boolean;
  endpoints: Endpoint[];
  functions: Function[];
  packageJson: string;
  validationResult?: DependenciesResponse;
}

export interface ApplicationsState extends EntityState<Application> {
  loaded: boolean,
  loading: boolean,
  selectedApplication?: Application,
  selectedFunction?: Function,
  selectedEndpoint?: Endpoint
  createAppError?: string;
  deleteAppError?: string;
  changeAppStateError?: string;
  editAppError?: string;
}

export interface DependenciesResponse {
  valid: boolean;
  errors: string[];
}

export interface TestFunctionRequest {
  code: string;
  args: any;
  cache: any;
  edgeResults: any;
  clientAppName: string;
}
