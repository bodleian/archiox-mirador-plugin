import { miradorSlice } from 'mirador/dist/es/src/state/selectors/utils';

/** selects layers from the Mirador state store **/
export const getLayers = (state) => miradorSlice(state).layers;
