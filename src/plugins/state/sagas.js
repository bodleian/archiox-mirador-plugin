import { all, put, select, takeEvery } from 'redux-saga/effects';
import { getImages, getMaps, reduceLayers } from '../RelightHelpers';
import { 
  ActionTypes,
  getConfig, 
  setCompanionAreaOpen, 
  updateLayers, 
  updateConfig,  
  getCurrentCanvas,
  getWindows,
} from 'mirador';

/**
 * Saga for when the Mirador setCanvas action is triggered, such as by adding resources, layers that are switched off
 * need to be turned on again.  Here we grab all windows currently open parse out their IDs and turn all the composite
 * map type layers back on.
 * **/
export function* setCanvas(action) {
  const _setCompanionAreaOpen = setCompanionAreaOpen;
  const _updateLayers = updateLayers;
  const _updateConfig = updateConfig;
  const initialWindowId = action.windowId;
  const excluded_maps = ['composite', 'normal', 'albedo'];
  const windows = yield select(getWindows, initialWindowId);
  const windowIds = Object.keys(windows).map((item) => {
    return windows[item].id;
  });

  for (let windowId of windowIds) {
    let payload;
    const canvas = yield select(getCurrentCanvas, { windowId });
    const canvasId = canvas.id;
    const maps = getMaps(canvas.iiifImageResources);
    let images = getImages(canvas.iiifImageResources);
    // length of one image implies no choices...
    // only if the length is above one do we want to toggle layer visibility
    if (canvas.__jsonld.items[0].items[0].body.type === 'Choice') {
      // set the required views for the plug-in here...
      const views = [
        { key: 'single', behaviors: ['individuals', 'paged'] },
        { key: 'book', behaviors: ['individuals', 'paged'] },
        { key: 'scroll', behaviors: ['continuous'] },
        { key: 'gallery' },
      ];

      // get the current config
      let config = yield select(getConfig);
      let sideBarOpen = true;

      if (windowIds.length > 1 || navigator.userAgent.indexOf('Mobi') > -1) {
        sideBarOpen = false;
      }

      config['window']['views'] = views;
      config['window']['sideBarOpen'] = sideBarOpen;
      config['window']['imageToolsEnabled'] = true;

      payload = reduceLayers(images, maps, excluded_maps);
      yield put(updateLayers(windowId, canvasId, payload));
      yield put(_updateLayers(windowId, canvasId, payload));
      yield put(_setCompanionAreaOpen(windowId, sideBarOpen));
      yield put(_updateConfig(config));
    }
  }
}

export function* rootSaga() {
  yield all([takeEvery(ActionTypes.SET_CANVAS, setCanvas)]);
}
