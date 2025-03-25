import Relight from './plugins/Relight';
import { getCurrentCanvas, getWindow, updateLayers} from 'mirador';
import { rootSaga } from './plugins/state/sagas';
import { v4 as uuidv4 } from 'uuid';

export const relightMiradorPlugin = [
    {
        target: 'OpenSeadragonViewer',
        mapDispatchToProps: {
            updateLayers,
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
                relightTorchButtonID: uuidv4(),
                relightAnnotationButtonID: uuidv4(),
                relightCycleDefaultLayerID: uuidv4(),
                canvas: getCurrentCanvas(state, { windowId })  || {},
                window: getWindow(state, _ref)  || {},
                state: state,
            };
        },
        saga: rootSaga,
        mode: 'add',
        component: Relight,
    },
];
