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
  endpoints: Endpoint[];
  functions: Function[];
  packageJson: string;
}

export interface ApplicationsState extends EntityState<Application> {
  loaded: boolean,
  loading: boolean,
  selectedApplication?: Application,
  selectedFunction?: Function,
  selectedEndpoint?: Endpoint
}
