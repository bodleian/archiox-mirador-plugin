import { miradorSlice } from 'mirador/dist/es/src/state/selectors/utils';

export const getLayers = (state) => miradorSlice(state).layers;
