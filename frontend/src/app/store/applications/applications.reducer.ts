import {Application, ApplicationsState} from './applications.model';
import {Action, createReducer, on} from '@ngrx/store';
import {createEntityAdapter} from '@ngrx/entity';
import {ApplicationsActions} from './index';
import {selectApplication} from './applications.selectors';


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
  on(ApplicationsActions.loadApplicationsSuccess, (state, action) =>
    adapter.upsertMany(
      action.applications,
      {
        ...state,
        loaded: true
      }
    )
  ),
  on(ApplicationsActions.loadNewApplicationSuccess, (state, action) =>
    adapter.addOne(
      {
        name: action.application.name,
        up: action.application.up
      } as Application,
      {
        ...state,
        selectedApplication: action.application
      }
    )
  ),
  on(ApplicationsActions.deleteApplicationSuccess, (state, action) =>
    adapter.removeOne(action.appName, state)
  ),
  on(ApplicationsActions.deleteSelectedApplicationSuccess, (state, action) =>
    adapter.removeOne(action.appName, state)
  ),
  on(ApplicationsActions.loadApplicationSuccess, (state, action) => {
      return {
        ...state,
        selectedApplication: action.application
      }
    }
  ),
  on(ApplicationsActions.startApplicationSuccess,
    (state, action) =>
    adapter.updateOne(action.application, state)
  ),
  on(ApplicationsActions.stopApplicationSuccess,
    (state, action) =>
      adapter.updateOne(action.application, state)
  ),
  on(ApplicationsActions.startSelectedApplicationSuccess,
    (state, action) =>
      adapter.updateOne(
        action.application,
        {
          ...state,
          selectedApplication: {...state.selectedApplication, up: true} as Application
        }
      )
  ),
  on(ApplicationsActions.stopSelectedApplicationSuccess,
    (state, action) =>
      adapter.updateOne(
        action.application,
        {
          ...state,
          selectedApplication: {...state.selectedApplication, up: false} as Application
        }
      )
  ),
  on(ApplicationsActions.editSelectedApplicationNameSuccess,
    (state, action) =>
      adapter.updateOne(
        action.application,
        {
          ...state,
          selectedApplication: {...state.selectedApplication, name: action.application.changes.name} as Application
        }
      )
  ),
  on(ApplicationsActions.saveDependenciesSuccessResponse, (state, action) => {
      return {
        ...state,
        selectedApplication: {
          ...state.selectedApplication,
          validationResult: action.validationResult
        } as Application
      }
    }
  ),
  on(ApplicationsActions.saveDependenciesFailedResponse, (state, action) => {
      return {
        ...state,
        selectedApplication: {
          ...state.selectedApplication,
          validationResult: action.validationResult
        } as Application
      }
    }
  )
);
