import RelightThreeCanvas from './RelightThreeCanvas';
import React from 'react';
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
      id,
      images,
      zoom,
      rendererInstructions,
      contentWidth,
      contentHeight,
      lightX,
      lightY,
      normalDepth,
      metalness,
      roughness,
      shininess,
      directionalIntensity,
      ambientIntensity,
      tileLevel,
      maxTileLevel,
      tileSets,
      tileLevels,
      helperOn,
      renderMode,
    } = this.props.threeCanvasProps;
    return (
      <RelightThreeCanvas
        id={id}
        images={images}
        zoom={zoom}
        intersection={rendererInstructions.intersection}
        contentWidth={contentWidth}
        contentHeight={contentHeight}
        lightX={lightX}
        lightY={lightY}
        normalDepth={normalDepth}
        metalness={metalness}
        roughness={roughness}
        shininess={shininess}
        directionalIntensity={directionalIntensity}
        ambientIntensity={ambientIntensity}
        tileLevel={tileLevel}
        maxTileLevel={maxTileLevel}
        tileSets={tileSets}
        tileLevels={tileLevels}
        helperOn={helperOn}
        renderMode={renderMode}
      />
    );
  }
}

RelightThreeOverlay.propTypes = {
  /** The threeCanvasProps object containing all the information we need to send to the Three canvas from Relight **/
  threeCanvasProps: shape({
    id: PropTypes.string.isRequired,
    images: PropTypes.object.isRequired,
    zoom: PropTypes.number.isRequired,
    rendererInstructions: PropTypes.object.isRequired,
    contentWidth: PropTypes.number.isRequired,
    contentHeight: PropTypes.number.isRequired,
    lightX: PropTypes.number.isRequired,
    lightY: PropTypes.number.isRequired,
    normalDepth: PropTypes.number.isRequired,
    metalness: PropTypes.number.isRequired,
    roughness: PropTypes.number.isRequired,
    shininess: PropTypes.number.isRequired,
    directionalIntensity: PropTypes.number.isRequired,
    ambientIntensity: PropTypes.number.isRequired,
    tileLevel: PropTypes.number.isRequired,
    maxTileLevel: PropTypes.number.isRequired,
    tileSets: PropTypes.object.isRequired,
    tileLevels: PropTypes.object.isRequired,
    helperOn: PropTypes.bool.isRequired,
    renderMode: PropTypes.bool.isRequired,
  }),
};
export default RelightThreeOverlay;
