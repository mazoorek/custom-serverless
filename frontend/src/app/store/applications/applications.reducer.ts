import {Application, ApplicationsState} from './applications.model';
import {Action, createReducer, on} from '@ngrx/store';
import {createEntityAdapter} from '@ngrx/entity';
import {ApplicationsActions} from './index';


export const adapter = createEntityAdapter<Application>({
  selectId: (application: Application) => application.name
});

export const applicationsSelectors = adapter.getSelectors();

export const initialState: ApplicationsState = {
  ...adapter.getInitialState(),
  loaded: false,
  loading: false
}

export const applicationsReducer = createReducer<ApplicationsState, Action>(
  initialState,
  on(ApplicationsActions.loadApplicationsSuccess,
    (state, action) => adapter.addMany(action.applications, {...state, loaded: true})
  )
);
