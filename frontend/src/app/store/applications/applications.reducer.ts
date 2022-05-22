import {Application, ApplicationsState, Endpoint} from './applications.model';
import {Action, createReducer, on} from '@ngrx/store';
import {createEntityAdapter} from '@ngrx/entity';
import {ApplicationsActions} from './index';
import {UserActions} from '../user';


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
        loaded: true,
        createAppError: undefined,
        deleteAppError: undefined,
        changeAppStateError: undefined
      }
    )
  ),
  on(ApplicationsActions.createApplicationFailed, (state, action) => {
      return {
        ...state,
        createAppError: action.message,
        deleteAppError: undefined,
        changeAppStateError: undefined,
        editAppError: undefined
      }
    }
  ),
  on(ApplicationsActions.editSelectedApplicationNameFailed, (state, action) => {
      return {
        ...state,
        createAppError: undefined,
        deleteAppError: undefined,
        changeAppStateError: undefined,
        editAppError: action.message
      }
    }
  ),
  on(ApplicationsActions.deleteApplicationFailed, (state, action) => {
      return {
        ...state,
        deleteAppError: action.message,
        createAppError: undefined,
        changeAppStateError: undefined,
        editAppError: undefined
      }
    }
  ),
  on(ApplicationsActions.deleteSelectedApplicationFailed, (state, action) => {
      return {
        ...state,
        deleteAppError: action.message,
        createAppError: undefined,
        changeAppStateError: undefined,
        editAppError: undefined
      }
    }
  ),
  on(ApplicationsActions.startApplicationFailed, (state, action) => {
      return {
        ...state,
        deleteAppError: undefined,
        createAppError: undefined,
        editAppError: undefined,
        changeAppStateError: action.message,
      }
    }
  ),
  on(ApplicationsActions.startSelectedApplicationFailed, (state, action) => {
      return {
        ...state,
        deleteAppError: undefined,
        createAppError: undefined,
        editAppError: undefined,
        changeAppStateError: action.message,
      }
    }
  ),
  on(ApplicationsActions.stopApplicationFailed, (state, action) => {
      return {
        ...state,
        deleteAppError: undefined,
        createAppError: undefined,
        editAppError: undefined,
        changeAppStateError: action.message,
      }
    }
  ),
  on(ApplicationsActions.stopSelectedApplicationFailed, (state, action) => {
      return {
        ...state,
        deleteAppError: undefined,
        createAppError: undefined,
        editAppError: undefined,
        changeAppStateError: action.message,
      }
    }
  ),
  on(ApplicationsActions.loadNewApplicationSuccess, (state, action) =>
    adapter.addOne(
      {
        name: action.application.name,
        up: action.application.up
      } as Application,
      {
        ...state,
        createAppError: undefined,
        deleteAppError: undefined,
        changeAppStateError: undefined,
        editAppError: undefined,
        selectedApplication: action.application
      }
    )
  ),
  on(ApplicationsActions.deleteApplicationSuccess, (state, action) =>
    adapter.removeOne(action.appName, {
      ...state,
      createAppError: undefined,
      deleteAppError: undefined,
      changeAppStateError: undefined,
      editAppError: undefined
    })
  ),
  on(ApplicationsActions.deleteSelectedApplicationSuccess, (state, action) =>
    adapter.removeOne(action.appName, {
      ...state,
      createAppError: undefined,
      deleteAppError: undefined,
      changeAppStateError: undefined,
      editAppError: undefined
    })
  ),
  on(ApplicationsActions.loadApplicationSuccess, (state, action) => {
      return {
        ...state,
        createAppError: undefined,
        deleteAppError: undefined,
        changeAppStateError: undefined,
        editAppError: undefined,
        selectedApplication: action.application
      }
    }
  ),
  on(ApplicationsActions.startApplicationSuccess,
    (state, action) =>
      adapter.updateOne(action.application, {
        ...state,
        createAppError: undefined,
        deleteAppError: undefined,
        changeAppStateError: undefined,
        editAppError: undefined
      })
  ),
  on(ApplicationsActions.stopApplicationSuccess,
    (state, action) =>
      adapter.updateOne(action.application, {
        ...state,
        createAppError: undefined,
        deleteAppError: undefined,
        changeAppStateError: undefined,
        editAppError: undefined
      })
  ),
  on(ApplicationsActions.startSelectedApplicationSuccess,
    (state, action) =>
      adapter.updateOne(
        action.application,
        {
          ...state,
          createAppError: undefined,
          deleteAppError: undefined,
          changeAppStateError: undefined,
          editAppError: undefined,
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
          createAppError: undefined,
          deleteAppError: undefined,
          changeAppStateError: undefined,
          editAppError: undefined,
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
          createAppError: undefined,
          deleteAppError: undefined,
          changeAppStateError: undefined,
          editAppError: undefined,
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
        selectedEndpoint: action.endpoint,
        addEndpointError: undefined,
        deleteEndpointError: undefined
      }
    }
  ),
  on(ApplicationsActions.moveToEndpointSuccess, (state, action) => {
      return {
        ...state,
        selectedEndpoint: action.endpoint,
        addEndpointError: undefined,
        deleteEndpointError: undefined
      }
    }
  ),
  on(ApplicationsActions.deleteEndpointSuccess, (state, action) => {
      return {
        ...state,
        selectedApplication: {
          ...state.selectedApplication,
          endpoints: state.selectedApplication?.endpoints.filter(endpoint => endpoint.url !== action.endpointUrl),
          addEndpointError: undefined,
          deleteEndpointError: undefined
        } as Application
      }
    }
  ),
  on(ApplicationsActions.loadNewEndpoint, (state, action) => {
      return {
        ...state,
        selectedApplication: {
          ...state.selectedApplication,
          endpoints: state.selectedApplication?.endpoints.concat([action.endpoint]),
          addEndpointError: undefined,
          deleteEndpointError: undefined
        } as Application
      }
    }
  ),
  on(ApplicationsActions.createEndpointFailed, (state, action) => {
      return {
        ...state,
        selectedApplication: {
          ...state.selectedApplication,
          addEndpointError: action.message,
          deleteEndpointError: undefined
        } as Application
      }
    }
  ),
  on(ApplicationsActions.deleteEndpointFailed, (state, action) => {
      return {
        ...state,
        selectedApplication: {
          ...state.selectedApplication,
          addEndpointError: undefined,
          deleteEndpointError: action.message
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
        selectedEndpoint: {...action.endpoint, editEndpointError: undefined},
        selectedApplication: {
          ...state.selectedApplication,
          endpoints
        } as Application
      }
    }
  ),
  on(ApplicationsActions.updateEndpointFailed, (state, action) => {
      return {
        ...state,
        selectedEndpoint: {...state.selectedEndpoint, editEndpointError: action.message} as Endpoint,
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

      let endpoints = [...state.selectedApplication!.endpoints];
      if (action.function.name) {
        endpoints = endpoints.map(endpoint => {
          endpoint = {...endpoint};
          if (action.oldFunctionName === endpoint.functionName) {
            endpoint.functionName = action.function.name;
          }
          return endpoint;
        });
      }
      return {
        ...state,
        selectedFunction: {
          ...state.selectedFunction,
          ...action.function
        },
        selectedApplication: {
          ...state.selectedApplication,
          functions,
          endpoints
        } as Application
      }
    }
  ),
  on(UserActions.logoutSuccess, (state: ApplicationsState, action) => {
    return initialState
  }),
);
