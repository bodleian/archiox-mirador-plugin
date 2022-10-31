import LightNormals from './lightNormals';
import {getCurrentCanvas} from 'mirador/dist/es/src/state/selectors';

export default [{
   target: 'WindowTopBarPluginMenu',
   mapStateToProps: (state, {windowId}) => ({
        canvas: getCurrentCanvas(state, { windowId })
    }),
    mode: 'add',
    component: LightNormals,
}]
