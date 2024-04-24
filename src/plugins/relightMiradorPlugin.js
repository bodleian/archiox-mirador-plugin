import Relight from './Relight';
import { getCurrentCanvas } from 'mirador/dist/es/src/state/selectors';
import { getWindow } from 'mirador/dist/es/src/state/selectors';
import * as actions from 'mirador/dist/es/src/state/actions';
import { rootSaga } from './state/sagas';

export default [
  {
    target: 'OpenSeadragonViewer',
    mapDispatchToProps: {
      updateLayers: actions.updateLayers,
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
    mode: 'add',
    component: Relight,
  },
];
