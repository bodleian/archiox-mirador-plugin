import RelightThreeCanvas from "./RelightThreeCanvas";
import React, { Component } from "react";

import * as THREE from 'three';

import PropTypes from 'prop-types';
class RelightThreeOverlay extends Component {
    constructor(props) {
        super(props);
    }
    render () {
        const { images, zoom, rendererInstructions, contentWidth, contentHeight, lightX, lightY, directionalIntensity,ambientIntensity, tileLevel, minTileLevel, maxTileLevel, tileSets, tileLevels } = this.props;
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
                minTileLevel={minTileLevel}
                maxTileLevel={maxTileLevel}
                tileSets={tileSets}
                tileLevels={tileLevels}
            />
        );
    }
}

RelightThreeOverlay.propTypes = {
    images: PropTypes.arrayOf(THREE.Texture.type).isRequired,
    zoom: PropTypes.number.isRequired,
    intersection: PropTypes.number.isRequired,
    contentWidth: PropTypes.number.isRequired,
    contentHeight: PropTypes.number.isRequired,
    lightX: PropTypes.number.isRequired,
    lightY: PropTypes.number.isRequired,
    directionalIntensity: PropTypes.number.isRequired,
    ambientIntensity: PropTypes.number.isRequired,
    tileLevel: PropTypes.number.isRequired,
    minTileLevel: PropTypes.number.isRequired,
    maxTileLevel: PropTypes.number.isRequired,
    tileSets: PropTypes.arrayOf(PropTypes.any).isRequired, // might need to go into this in more detail as to what this is composed of
    tileLevels: PropTypes.arrayOf(PropTypes.number).isRequired
}
export default RelightThreeOverlay;