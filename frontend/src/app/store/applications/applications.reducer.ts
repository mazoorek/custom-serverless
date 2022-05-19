import {Application, ApplicationsState} from './applications.model';
import {Action, createReducer, on} from '@ngrx/store';
import {createEntityAdapter} from '@ngrx/entity';
import {ApplicationsActions} from './index';
import {UserActions} from '../user';
import {UserState} from '../user/user.model';


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
          packageJson: action.packageJson,
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
  ),
  on(ApplicationsActions.loadEndpointSuccess, (state, action) => {
      return {
        ...state,
        selectedEndpoint: action.endpoint
      }
    }
  ),
  on(ApplicationsActions.moveToEndpointSuccess, (state, action) => {
      return {
        ...state,
        selectedEndpoint: action.endpoint
      }
    }
  ),
  on(ApplicationsActions.deleteEndpointSuccess, (state, action) => {
      return {
        ...state,
        selectedApplication: {
          ...state.selectedApplication,
          endpoints: state.selectedApplication?.endpoints.filter(endpoint => endpoint.url !== action.endpointUrl)
        } as Application
      }
    }
  ),
  on(ApplicationsActions.loadNewEndpoint, (state, action) => {
      return {
        ...state,
        selectedApplication: {
          ...state.selectedApplication,
          endpoints: state.selectedApplication?.endpoints.concat([action.endpoint])
        } as Application
      }
    }
  ),
  on(ApplicationsActions.updateEndpointSuccess, (state, action) => {
      let endpoints = [...state.selectedApplication!.endpoints];
      let updatedEndpointIndex = endpoints.findIndex((endpoint => endpoint.url === action.oldEndpointUrl));
      endpoints[updatedEndpointIndex] = action.endpoint;
      return {
        ...state,
        selectedEndpoint: action.endpoint,
        selectedApplication: {
          ...state.selectedApplication,
          endpoints
        } as Application
      }
    }
  ),
  on(ApplicationsActions.loadFunctionSuccess, (state, action) => {
      return {
        ...state,
        selectedFunction: action.function
      }
    }
  ),
  on(ApplicationsActions.moveToFunctionSuccess, (state, action) => {
      return {
        ...state,
        selectedFunction: action.function
      }
    }
  ),
  on(ApplicationsActions.loadNewFunctionSuccess, (state, action) => {
      return {
        ...state,
        selectedApplication: {
          ...state.selectedApplication,
          functions: state.selectedApplication?.functions.concat([action.function])
        } as Application
      }
    }
  ),
  on(ApplicationsActions.deleteFunctionSuccess, (state, action) => {
      return {
        ...state,
        selectedApplication: {
          ...state.selectedApplication,
          functions: state.selectedApplication?.functions.filter(func => func.name !== action.functionName)
        } as Application
      }
    }
  ),
  on(ApplicationsActions.updateFunctionSuccess, (state, action) => {
      let functions = [...state.selectedApplication!.functions];
      let updatedFunctionIndex = functions.findIndex((func => func.name === action.oldFunctionName));
      functions[updatedFunctionIndex] = {
        ...functions[updatedFunctionIndex]
        , ...action.function
      };
      return {
        ...state,
        selectedFunction: {
          ...state.selectedFunction,
          ...action.function
        },
        selectedApplication: {
          ...state.selectedApplication,
          functions
        } as Application
      }
    }
  ),
  on(UserActions.logoutSuccess, (state: ApplicationsState, action) => {
    return initialState
  }),
);
