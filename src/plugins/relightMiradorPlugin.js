import Relight from './Relight';
import {
  getCurrentCanvas,
  getManifestTitle,
} from 'mirador/dist/es/src/state/selectors';
import { getWindow } from 'mirador/dist/es/src/state/selectors';
import * as actions from 'mirador/dist/es/src/state/actions';
import { rootSaga } from './state/sagas';
import { v4 as uuidv4 } from 'uuid';

export default [
  {
    target: 'OpenSeadragonViewer',
    mapDispatchToProps: {
      updateLayers: actions.updateLayers,
    },
    mapStateToProps: function mapStateToProps(state, _ref) {
      const windowId = _ref.windowId;
      return {
        relightLightDirectionID: uuidv4(),
        relightThreeCanvasID: uuidv4(),
        relightAmbientLightIntensityID: uuidv4(),
        relightRoughnessIntensityID: uuidv4(),
        relightMetalnessIntensityID: uuidv4(),
        relightShininessIntensityID: uuidv4(),
        relightDirectionalLightIntensityID: uuidv4(),
        relightNormalDepthID: uuidv4(),
        relightToolMenuID: uuidv4(),
        relightMenuButtonsID: uuidv4(),
        relightSnapShotButtonID: uuidv4(),
        relightTorchButtonID: uuidv4(),
        relightHelpButtonID: uuidv4(),
        relightAnnotationButtonID: uuidv4(),
        relightLayersMenuID: uuidv4(),
        relightLayersMenuButtonID: uuidv4(),
        relightHelpDialogId: uuidv4(),
        relightDownloadCurrentLayerButtonId: uuidv4(),
        canvas: getCurrentCanvas(state, { windowId }),
        manifestTitle: getManifestTitle(state, { windowId }),
        window: getWindow(state, _ref),
        state: state,
      };
    },
    saga: rootSaga,
    mode: 'add',
    component: Relight,
  },
];
