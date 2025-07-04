import React from 'react';
import PropTypes from 'prop-types';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import { getLayers } from './state/selectors';

import GetAppOutlined from '@material-ui/icons/GetAppOutlined';

class RelightDownloadCurrentLayerButton extends React.Component {
  constructor(props) {
    super(props);
  }

  getDownloadUrl(iiifUrl, fileName) {
    return `${
      iiifUrl.split('/full')[0]
    }/full/pct:40/0/default.jpg?filename=${fileName}.webp`;
  }

  onClick(state, windowId, canvasId) {
    let layers;
    const layersInState = getLayers(state)[windowId][canvasId];

    // get the current state and extract the current index values and visibilities into a sorted array
    layers = Object.entries(layersInState)
      .map(([url, { index, visibility }]) => ({ url, index, visibility }))
      .sort((a, b) => a.index - b.index); // sort items based on the index property

    const layer = layers[0].url;
    // todo: put in more meaningful file name here...
    const layerUrl = this.getDownloadUrl(layer, 'archiox_layer_download');
    const link = document.createElement('a');
    link.href = layerUrl;
    link.click();
  }

  render() {
    const { id, state, windowId, canvasId } = this.props;
    return (
      <MiradorMenuButton
        id={id}
        aria-label={'Download current selected layer'}
        onClick={() => this.onClick(state, windowId, canvasId)}
      >
        <GetAppOutlined />
      </MiradorMenuButton>
    );
  }
}

RelightDownloadCurrentLayerButton.propTypes = {
  /** The id prop is used to populate the html id property so that we can keep track of the controls state **/
  id: PropTypes.string.isRequired,
  /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
  onClick: PropTypes.func.isRequired,
  /** The windowId prop is the Mirador window ID of the current instance of Mirador **/
  windowId: PropTypes.string,
  /** The canvasId prop is the Mirador canvas ID of the current instance of the window in Mirador **/
  canvasId: PropTypes.string,
  /** The state prop is the Mirador state from the redux store **/
  state: PropTypes.object,
};

export default RelightDownloadCurrentLayerButton;
