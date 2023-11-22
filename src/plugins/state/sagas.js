import { getCanvases, getWindows } from 'mirador/dist/es/src/state/selectors';
import ActionTypes from 'mirador/dist/es/src/state/actions/action-types';
import { put, select, takeEvery } from 'redux-saga/effects';
import { getLayers } from '../RelightHelpers';
import * as actions from 'mirador/dist/es/src/state/actions';

export function* setCanvas(action) {
  const updateLayers = actions.updateLayers;
  const windowId = action.windowId;
  const excluded_maps = ['composite'];
  const windows = yield select(getWindows, windowId);
  const windowIds = Object.keys(windows).map((item) => {
    return windows[item].id;
  });

  for (let windowId of windowIds) {
    const canvas = yield select(getCanvases, { windowId });
    const layers = getLayers(canvas[0].iiifImageResources);
    const layer_keys = Object.keys(layers).map((item) => {
      return item;
    });

    for (let layer of layer_keys) {
      const mapType = layers[layer].trim();

      if (excluded_maps.includes(mapType)) {
        const payload = {
          [layer]: { visibility: true },
        };
        yield put(updateLayers(windowId, canvas[0].id, payload));
      }
    }
  }
}

export function* rootSaga() {
  yield takeEvery(ActionTypes.SET_CANVAS, setCanvas);
}
