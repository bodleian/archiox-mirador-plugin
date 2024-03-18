import RelightThreeCanvas from './RelightThreeCanvas';
import React from 'react';

import * as THREE from 'three';

import PropTypes, { shape } from 'prop-types';

/**
 * The RelightThreeOverlay component is the parent component of the RelightThreeCanvas component.  It allows for us to
 * simplify passing in a bunch of props to the Three canvas via the ReactDom.render() method which would otherwise be
 * more difficult to read due to the high number of props being passed into it.
 */
class RelightThreeOverlay extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {
      images,
      zoom,
      rendererInstructions,
      contentWidth,
      contentHeight,
      lightX,
      lightY,
      normalDepth,
      shininess,
      directionalIntensity,
      ambientIntensity,
      tileLevel,
      maxTileLevel,
      tileSets,
      tileLevels,
      helperOn,
    } = this.props.threeCanvasProps;
    return (
      <RelightThreeCanvas
        images={images}
        zoom={zoom}
        intersection={rendererInstructions.intersection}
        contentWidth={contentWidth}
        contentHeight={contentHeight}
        lightX={lightX}
        lightY={lightY}
        normalDepth={normalDepth}
        shininess={shininess}
        directionalIntensity={directionalIntensity}
        ambientIntensity={ambientIntensity}
        tileLevel={tileLevel}
        maxTileLevel={maxTileLevel}
        tileSets={tileSets}
        tileLevels={tileLevels}
        helperOn={helperOn}
      />
    );
  }
}

RelightThreeOverlay.propTypes = {
  /** The threeCanvasProps object containing all the information we need to send to the Three canvas from Relight **/
  threeCanvasProps: shape({
    images: PropTypes.arrayOf(THREE.Texture.type).isRequired,
    zoom: PropTypes.number.isRequired,
    intersection: PropTypes.shape({
      height: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }).isRequired,
    contentWidth: PropTypes.number.isRequired,
    contentHeight: PropTypes.number.isRequired,
    lightX: PropTypes.number.isRequired,
    lightY: PropTypes.number.isRequired,
    normalDepth: PropTypes.number.isRequired,
    shininess: PropTypes.number.isRequired,
    directionalIntensity: PropTypes.number.isRequired,
    ambientIntensity: PropTypes.number.isRequired,
    tileLevel: PropTypes.number.isRequired,
    maxTileLevel: PropTypes.number.isRequired,
    tileSets: PropTypes.arrayOf(PropTypes.any).isRequired,
    tileLevels: PropTypes.arrayOf(PropTypes.number).isRequired,
    helperOn: PropTypes.bool.isRequired,
  }),
};
export default RelightThreeOverlay;
