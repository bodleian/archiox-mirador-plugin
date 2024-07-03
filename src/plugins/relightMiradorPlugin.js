import Relight from './Relight';
import { getCurrentCanvas } from 'mirador/dist/es/src/state/selectors';
import { getWindow } from 'mirador/dist/es/src/state/selectors';
import * as actions from 'mirador/dist/es/src/state/actions';
import * as pluginActions from './state/actions';
import { rootSaga } from './state/sagas';
import { updateSizeReducer } from './state/reducers';

export default [
  {
    target: 'OpenSeadragonViewer',
    mapDispatchToProps: {
      updateLayers: actions.updateLayers,
      updateViewportSize: pluginActions.updateViewportSize,
      updateWindowSize: pluginActions.updateWindowSize,
    },
    mapStateToProps: function mapStateToProps(state, _ref) {
      const windowId = _ref.windowId;
      return {
        canvas: getCurrentCanvas(state, { windowId }),
        window: getWindow(state, _ref),
        state: state,
      };
    },
    saga: rootSaga,
    reducers: { screenWidth: updateSizeReducer },
    mode: 'add',
    component: Relight,
  },
];
