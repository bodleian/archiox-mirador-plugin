import { getCanvases, getWindows } from 'mirador/dist/es/src/state/selectors';
import ActionTypes from 'mirador/dist/es/src/state/actions/action-types';
import { all, put, select, takeEvery } from 'redux-saga/effects';
import { getImages, getMaps, reduceLayers } from '../RelightHelpers';
import * as actions from 'mirador/dist/es/src/state/actions';
import { getLayers } from 'archiox-mirador-plugin/src/plugins/state/selectors';

/**
 * Saga for when the Mirador setCanvas action is triggered, such as by adding resources, layers that are switched off
 * need to be turned on again.  Here we grab all windows currently open parse out their IDs and turn all the composite
 * map type layers back on.
 * **/
export function* setCanvas(action) {
  const updateLayers = actions.updateLayers;
  const windowId = action.windowId;
  const excluded_maps = ['composite', 'normal', 'albedo'];
  const windows = yield select(getWindows, windowId);
  const windowIds = Object.keys(windows).map((item) => {
    return windows[item].id;
  });

  for (let windowId of windowIds) {
    let payload;
    const canvas = yield select(getCanvases, { windowId });
    const canvasId = canvas[0].id;
    const maps = getMaps(canvas[0].iiifImageResources);
    let images = getImages(canvas[0].iiifImageResources);

    payload = reduceLayers(images, maps, excluded_maps);
    yield put(updateLayers(windowId, canvasId, payload));
  }
}

export function* rootSaga() {
  yield takeEvery(
    takeEvery(ActionTypes.SET_CANVAS, setCanvas),
  );
}
