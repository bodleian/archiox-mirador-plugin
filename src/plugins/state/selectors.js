import { miradorSlice } from 'mirador';

/** selects layers from the Mirador state store **/
export const getLayers = (state) => miradorSlice(state).layers;
