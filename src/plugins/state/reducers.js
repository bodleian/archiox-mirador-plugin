import { PluginActionTypes } from './actions';

const initialState = {
  viewportWidth: window.innerWidth,
  windowWidth: window.innerWidth,
};

export const updateSizeReducer = (state = initialState, action) => {
  switch (action.type) {
    case PluginActionTypes.UPDATE_VIEWPORT_SIZE:
      return {
        ...state,
        [action.windowId]: {
          ...state[action.windowId],
          viewportWidth: action.viewportWidth,
        },
      };
    case PluginActionTypes.UPDATE_WINDOW_SIZE:
      return {
        ...state,
        [action.windowId]: {
          ...state[action.windowId],
          windowWidth: action.windowWidth,
        },
      };
    default:
      return state;
  }
};
