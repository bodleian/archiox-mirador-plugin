import lightNormals from './light-normals';
import {getCurrentCanvas} from 'mirador/dist/es/src/state/selectors';

export default {
   target: 'OpenSeadragonViewer',
   mapStateToProps: (state, {windowId}) => ({
        canvas: getCurrentCanvas(state, { windowId })
    }),
    mode: 'add',
    component: lightNormals,
}
