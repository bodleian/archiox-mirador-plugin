import React from 'react';
import PropTypes from 'prop-types';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import { getLayers } from './state/selectors';
import { getLabels } from './RelightHelpers';
import GetAppOutlined from '@material-ui/icons/GetAppOutlined';

/**
 * The RelightDownloadCurrentLayerButton is a plug-in button that will get the current IIIF choices layer  at index 0
 * (on top) and prepare it to download at 40% of its original width when it is clicked.
 * **/
class RelightDownloadCurrentLayerButton extends React.Component {
  constructor(props) {
    super(props);
  }

  /**
   * The getDownloadUrl method takes the IIIF choices ID and converts it into a URL to instruct IIP to get a downsized
   * version of the image.
   * @param {string} iiifUrl IIIF choices ID URL
   * @param {string} fileName the name we want to download the image as
   * @returns {string} a URL formatted for use in an image request to request a downsized version of the image
   * **/
  getDownloadUrl(iiifUrl, fileName) {
    return `${
      iiifUrl.split('/full')[0]
    }/full/pct:40/0/default.jpg?filename=${fileName}_reduced.webp`;
  }

  /**
   * The onClick method gets the current top layer and prepares it for download via the browser.
   * @param {object} state the Mirador state object
   * @param {string} windowId the WindowId of the current Mirador instance
   * @param {string} canvasId the CanvasId of the current Mirador instance
   * @param {object} choices the Choices object of the current Mirador instance
   * @param {string} manifestTitle the title of the current manifest of the current Mirador instance
   * **/
  onClick(state, windowId, canvasId, choices, manifestTitle) {
    let layers;
    const layersInState = getLayers(state)[windowId][canvasId];
    const labels = getLabels(choices);
    // get the current state and extract the current index values and visibilities into a sorted array
    layers = Object.entries(layersInState)
      .map(([url, { index, visibility }]) => ({ url, index, visibility }))
      .sort((a, b) => a.index - b.index); // sort items based on the index property
    const layer = layers[0].url;
    // todo: put in more meaningful file name here...
    const layerUrl = this.getDownloadUrl(
      layer,
      manifestTitle.replace(/\s+/g, '-') + '_' + labels[layers[0].url]
    );
    const link = document.createElement('a');
    link.href = layerUrl;
    link.click();
  }

  render() {
    const { id, choices, state, windowId, canvasId, manifestTitle } =
      this.props;
    return (
      <MiradorMenuButton
        id={id}
        aria-label={'Download current selected layer'}
        onClick={() =>
          this.onClick(state, windowId, canvasId, choices, manifestTitle)
        }
      >
        <GetAppOutlined />
      </MiradorMenuButton>
    );
  }
}

RelightDownloadCurrentLayerButton.propTypes = {
  /** The id prop is used to populate the html id property so that we can keep track of the controls state **/
  id: PropTypes.string.isRequired,
  /** The choices prop are the canvas.iiifImageResources object from the current instance of the window in Mirador **/
  choices: PropTypes.object.isRequired,
  /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
  onClick: PropTypes.func.isRequired,
  /** The windowId prop is the Mirador window ID of the current instance of Mirador **/
  windowId: PropTypes.string,
  /** The canvasId prop is the Mirador canvas ID of the current instance of the window in Mirador **/
  canvasId: PropTypes.string,
  /** The state prop is the Mirador state from the redux store **/
  state: PropTypes.object,
  /** The manifestTitle prop is the title of the manifest loaded into the current Mirador window instance **/
  manifestTitle: PropTypes.string,
};

export default RelightDownloadCurrentLayerButton;
