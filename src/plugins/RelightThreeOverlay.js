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
      directionalIntensity,
      ambientIntensity,
      tileLevel,
      maxTileLevel,
      tileSets,
      tileLevels,
      fragmentShader,
      vertexShader,
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
        directionalIntensity={directionalIntensity}
        ambientIntensity={ambientIntensity}
        tileLevel={tileLevel}
        maxTileLevel={maxTileLevel}
        tileSets={tileSets}
        tileLevels={tileLevels}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
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
      topLeft: PropTypes.number.isRequired,
      bottomLeft: PropTypes.number.isRequired,
    }).isRequired,
    contentWidth: PropTypes.number.isRequired,
    contentHeight: PropTypes.number.isRequired,
    lightX: PropTypes.number.isRequired,
    lightY: PropTypes.number.isRequired,
    directionalIntensity: PropTypes.number.isRequired,
    ambientIntensity: PropTypes.number.isRequired,
    tileLevel: PropTypes.number.isRequired,
    maxTileLevel: PropTypes.number.isRequired,
    tileSets: PropTypes.arrayOf(PropTypes.any).isRequired, // might need to go into this in more detail as to what this is composed of
    tileLevels: PropTypes.arrayOf(PropTypes.number).isRequired,
    fragmentShader: PropTypes.string,
    vertexShader: PropTypes.string,
  }),
};
export default RelightThreeOverlay;
