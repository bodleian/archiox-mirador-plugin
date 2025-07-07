import React from 'react';
import PropTypes from 'prop-types';
import { getMaps, getImages, setLayers, reduceLayers } from './RelightHelpers';
import { getLayers } from './state/selectors';
import Tooltip from '@material-ui/core/Tooltip';

/**
 * The RelightLayersMenu component is a plug-in tool menu that allows the user to select the current top layer in
 * Mirador, it uses the same Redux Saga functions that moving layers through other methods does.  When a user selects
 * a thumbnail representation of the layer they wish to be on top, we grab the layers from state and rotate them until
 * the desired one is on top of the stack.  There is also a button to allow users to download the current layer at 40%,
 * which is the current size allowed for restricted resolution downloads without being signed in to Digital Bodleian.
 * **/
class RelightLayersMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lastClicked: null,
    };
  }

  /**
   * The rotateUntilMatch method takes the current layers from state and rotates the order of the layers until the top
   * one matches the provided id.
   * @param {array} layers is an array of the iiifImageResources
   * @param {string} id is the id of the image we want to be at index 0 of the layers array
   * @returns {array} the layers array in the requested ordering
   **/
  rotateUntilMatch(layers, id) {
    const exists = layers.some((layer) => layer.id === id);
    if (!exists) return layers;

    while (layers[0].id !== id) {
      layers.push(layers.shift());
    }
    return layers;
  }

  /**
   * The onClick method gets the state of layers, re-orders them and puts them back into the Mirador state using
   * the Redux/Saga system according to the user selection of the layer they want moving to the top of the layers
   * stack
   * @param {string} url a string containing the IIIF image id/URL of the layer
   * @param {number} id a number containing the order index of the layer
   * @param {object} state the Mirador state object
   * @param {string} windowId the WindowId of the current Mirador instance
   * @param {string} canvasId the CanvasId of the current Mirador instance
   * @param {object} canvas the current Mirador instance canvas object
   * @param updateLayers the Mirador saga method for updating layers in Mirador state
   **/
  onClick(url, id, state, windowId, canvasId, canvas, updateLayers) {
    this.setState({ lastClicked: id });
    const excluded_maps = [
      'composite',
      'albedo',
      'normal',
      'shaded',
      'depth',
      'none',
    ];
    const layersInState = getLayers(state)[windowId][canvasId];
    let items;
    let layers;
    let imagesFromState;

    if (layersInState) {
      // get the current state and extract the current index values and visibilities into a sorted array
      items = Object.entries(layersInState)
        .map(([url, { index, visibility }]) => ({ url, index, visibility }))
        .sort((a, b) => a.index - b.index); // sort items based on the index property

      // transform the sorted items into the desired output format for use as a payload body for Mirador
      imagesFromState = items.map(({ url }) => ({ id: url }));
    }

    const maps = getMaps(canvas.iiifImageResources);

    if (layers === undefined && !layersInState) {
      layers = getImages(this.props.canvas.iiifImageResources);
    } else {
      layers = imagesFromState;
    }

    // shift layers until the matching ID is on top... then add to layers below
    const newLayers = this.rotateUntilMatch(layers, url);
    const payload = reduceLayers(newLayers, maps, excluded_maps);

    setLayers(windowId, canvasId, updateLayers, payload).next();
  }

  /**
   * The getThumbnailUrl method formats the supplied image id/URL into a URL that can be used to request a 120px wide
   * thumbnail image from the image server.
   * @param {string} iiifUrl a string containing the original IIIF image id/URL
   * @returns {string} the formatted URL used for making an image thumbnail request from the image server
   **/
  getThumbnailUrl(iiifUrl) {
    return `${iiifUrl.split('/full')[0]}/full/120,/0/default.jpg`;
  }

  getLabels(choices) {
    return choices.reduce((accumulator, item) => {
      const key = item.__jsonld.id;
      const value = item.__jsonld.label.en[0];
      accumulator[key] = value;
      return accumulator;
    }, {});
  }

  render() {
    const { id, choices, windowId, canvasId, state, canvas, updateLayers } =
      this.props;
    const urls = Object.keys(getMaps(choices));
    const labels = this.getLabels(choices);
    return (
      <div id={id} className="relightLayersMenu">
        {urls.map((url, index) => (
          <Tooltip title={labels[url]}>
            <button
              className="relightLayerButton"
              key={index}
              style={{
                background:
                  this.state.lastClicked === index
                    ? 'rgb(0,0,0,0.2)'
                    : 'rgb(0,0,0,0)',
              }}
              onClick={() =>
                this.onClick(
                  url,
                  index,
                  state,
                  windowId,
                  canvasId,
                  canvas,
                  updateLayers
                )
              }
            >
              <img
                className="relightLayerThumbnail"
                src={this.getThumbnailUrl(url)}
                alt={`Thumbnail ${index}`}
              />
            </button>
          </Tooltip>
        ))}
      </div>
    );
  }
}

RelightLayersMenu.propTypes = {
  /** The id prop is used to populate the html id property so that we can keep track of the controls state **/
  id: PropTypes.string.isRequired,
  /** The onClick prop is a function used to manage component behaviour when the component is clicked **/
  onClick: PropTypes.func.isRequired,
  /** The windowId prop is the Mirador window ID of the current instance of Mirador **/
  windowId: PropTypes.string.isRequired,
  /** The canvasId prop is the Mirador canvas ID of the current instance of the window in Mirador **/
  canvasId: PropTypes.string.isRequired,
  /** The state prop is the Mirador state from the redux store **/
  state: PropTypes.object.isRequired,
  /** The canvas prop is the canvas object from the current instance of the window in Mirador **/
  canvas: PropTypes.object.isRequired,
  /** The update layers prop is the Mirador function for updating the layers in state **/
  updateLayers: PropTypes.func.isRequired,
  /** The choices prop are the canvas.iiifImageResources object from the current instance of the window in Mirador **/
  choices: PropTypes.object.isRequired,
};

export default RelightLayersMenu;
