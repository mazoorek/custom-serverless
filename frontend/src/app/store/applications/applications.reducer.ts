import {Application} from './applications.model';
import {Action, createReducer} from '@ngrx/store';

export interface ApplicationsState {
  entities: { [id: number]: Application},
  loaded: boolean,
  loading: boolean
}

export const initialState: ApplicationsState = {
  entities: {},
  loaded: false,
  loading: false
}

export const applicationsReducer = createReducer<ApplicationsState, Action>(
  initialState
);
