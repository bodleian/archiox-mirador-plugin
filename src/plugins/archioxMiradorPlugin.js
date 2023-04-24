import LightNormals from './lightNormals';
import { getCurrentCanvas } from 'mirador/dist/es/src/state/selectors';
import * as actions from 'mirador/dist/es/src/state/actions';

export default [{
    target: 'OpenSeadragonViewer',
    mapDispatchToProps: {
        updateLayers: actions.updateLayers
    },
    mapStateToProps: function mapStateToProps(state, _ref) {
        const windowId = _ref.windowId;
        return {
            canvas: getCurrentCanvas(state, { windowId })
        };
    },
    mode: 'add',
    component: LightNormals,
}]
