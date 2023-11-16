import Relight from './Relight';
import { getCurrentCanvas } from 'mirador/dist/es/src/state/selectors';
import { getWindow } from 'mirador/dist/es/src/state/selectors';
import * as actions from 'mirador/dist/es/src/state/actions';
import ActionTypes from "mirador/dist/es/src/state/actions/action-types";
import { takeEvery } from 'redux-saga/effects';

function resourceAdded(action) {
  if (action.type === ActionTypes.ADD_WINDOW) {
    try { console.log("Resource Added"); } catch (error) {
      console.log(error);
    }
  }
}

// Worker saga will be fired on ADD_RESOURCE and ADD_WINDOW action
function* rootSaga() {
  yield takeEvery(
      [
        ActionTypes.ADD_RESOURCE,
        ActionTypes.ADD_WINDOW,
      ],
      resourceAdded
  )
}

export default [
  {
    saga: rootSaga,
    target: 'OpenSeadragonViewer',
    mapDispatchToProps: {
      updateLayers: actions.updateLayers,
    },
    mapStateToProps: function mapStateToProps(state, _ref) {
      const windowId = _ref.windowId;
      return {
        canvas: getCurrentCanvas(state, { windowId }),
        window: getWindow(state, _ref),
      };
    },
    mode: 'add',
    component: Relight,
  },
];
