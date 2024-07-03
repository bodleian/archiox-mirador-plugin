export const PluginActionTypes = {
  UPDATE_VIEWPORT_SIZE: 'archiox-mirador-plugin/UPDATE_VIEWPORT_SIZE',
  UPDATE_WINDOW_SIZE: 'archiox-midador-plugin/UPDATE_WINDOW_SIZE',
};

/*
 *
 * */
export function updateViewportSize(windowId, viewportWidth) {
  return {
    windowId,
    viewportWidth,
    type: PluginActionTypes.UPDATE_VIEWPORT_SIZE,
  };
}

export function updateWindowSize(windowId, windowWidth) {
  return {
    windowId,
    windowWidth,
    type: PluginActionTypes.UPDATE_WINDOW_SIZE,
  };
}
