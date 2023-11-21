import { getCanvases } from 'mirador/dist/es/src/state/selectors';

import ActionTypes from 'mirador/dist/es/src/state/actions/action-types';
import { takeEvery, select } from 'redux-saga/effects';
import { updateLayer, getLayers } from '../RelightHelpers';
import * as actions from 'mirador/dist/es/src/state/actions';

export function* resourceAdded(action) {
  const windowId = action.windowId;
  const canvasId = action.canvasId;
  const canvas = yield select(getCanvases, { windowId });
  const layers = getLayers(canvas[0].iiifImageResources);
  const excluded_maps = ['composite'];
  updateLayer(
    windowId,
    actions.updateLayers,
    excluded_maps,
    canvasId,
    layers,
    true
  );
}

export function* rootSaga() {
  yield takeEvery(ActionTypes.SET_CANVAS, resourceAdded);
}
