import {EntityState} from '@ngrx/entity';

export interface Endpoint {
  url: string;
  functionName: string;
  editEndpointError?: string;
}

export interface Function {
  name: string;
  content: string;
  idempotent: boolean;
  editFunctionError?: string;
}

export interface Application {
  name: string;
  up: boolean;
  outdated: boolean;
  endpoints: Endpoint[];
  functions: Function[];
  packageJson: string;
  validationResult?: DependenciesResponse;
  deleteEndpointError?: string;
  createEndpointError?: string;
  deleteFunctionError?: string;
  createFunctionError?: string;
}

export interface ApplicationsState extends EntityState<Application> {
  loaded: boolean,
  loading: boolean,
  selectedApplication?: Application,
  selectedFunction?: Function,
  selectedEndpoint?: Endpoint
  createAppError?: string;
  deleteAppError?: string;
  editAppError?: string;
  changeAppStateError?: string;
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
