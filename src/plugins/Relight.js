import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import * as THREE from 'three';
import {
  getLayers,
  getMap,
  getRendererInstructions,
  getTileSets,
} from './RelightHelpers';
import RelightLightIntensity from './RelightLightIntensity';
import RelightLightDirection from './RelightLightDirection';
import RelightLightControls from './RelightLightControls';
import RelightToolMenu from './RelightToolMenu';
import RelightResetLightPositions from './RelightResetLightPositions';
import RelightLightButtons from './RelightLightButtons';
import RelightTorchButton from './RelightTorchButton';
import RelightThreeOverlay from './RelightThreeOverlay';
import RelightMenuButton from './RelightMenuButton';

class Relight extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      open: false,
      visible: false,
      loaded: false,
      loadHandlerAdded: false,
      zoomLevel: 0,
      zoom: 0,
      mouseX: 50,
      mouseY: 50,
      lightX: 0,
      lightY: 0,
      directionalIntensity: 1,
      ambientIntensity: 0.1,
      rendererInstructions: {
        intersection: {
          width: 0,
          height: 0,
          x: 0,
          y: 0,
        },
      },
      images: {},
      tileLevel: 0,
    };
    this.threeCanvasProps = {};
    this.mouseDown = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.lightX = 0;
    this.lightY = 0;
    this.directionalIntensity = 1;
    this.ambientIntensity = 0.1;
    this.images = {};
    this.tileSets = {};
    this.tileLevels = {};
  }
  onMouseMove(event) {
    const control = document.getElementById('LightDirectionControl');
    const boundingBox = control.getBoundingClientRect();

    if (event.type === 'mousemove') {
      event.preventDefault();
      this.mouseX = event.clientX - boundingBox.left;
      this.mouseY = event.clientY - boundingBox.top;
    } else if (event.type === 'touchmove') {
      this.mouseDown = true;
      this.mouseX = event.touches[0].clientX - boundingBox.left;
      this.mouseY = event.touches[0].clientY - boundingBox.top;
    }

    if (this.mouseDown) {
      document.getElementById('LightDirectionControl').style.background =
        `radial-gradient(at ` +
        this.mouseX +
        `% ` +
        this.mouseY +
        `%, #ffffff, #000000)`;
      this.lightX = (this.mouseX / 100) * 2 - 1;
      this.lightY = (this.mouseY / 100) * 2 - 1;
      this.threeCanvasProps.lightX = this.lightX;
      this.threeCanvasProps.lightY = this.lightY;
      this.setState({ mouseX: this.mouseX });
      this.setState({ mouseY: this.mouseY });
      this.setState({ lightX: this.threeCanvasProps.lightX });
      this.setState({ lightY: this.threeCanvasProps.lightY });
    }
  }

  onMouseDown() {
    this.mouseDown = true;
  }

  onMouseUp() {
    this.mouseDown = false;
  }

  onMouseLeave() {
    this.mouseDown = false;
  }

  onDirectionalLightChange(event, value) {
    this.directionalIntensity = value;
    this.threeCanvasProps.directionalIntensity = this.directionalIntensity;
    this.setState({ directionalIntensity: value });
  }

  onAmbientLightChange(event, value) {
    this.ambientIntensity = value;
    this.threeCanvasProps.ambientIntensity = this.ambientIntensity;
    this.setState({ ambientIntensity: value });
  }

  menuHandler() {
    this.setState((prevState) => ({ open: !prevState.open }));
  }

  resetHandler() {
    this.mouseX = 50;
    this.mouseY = 50;
    this.lightX = 0;
    this.lightY = 0;
    this.ambientIntensity = 0.1;
    this.directionalIntensity = 1;
    this.threeCanvasProps.ambientIntensity = this.ambientIntensity;
    this.threeCanvasProps.directionalIntensity = this.directionalIntensity;
    this.threeCanvasProps.lightX = this.lightX;
    this.threeCanvasProps.lightY = this.lightY;

    this.setState({ mouseX: this.mouseX });
    this.setState({ mouseY: this.mouseY });
    this.setState({ lightX: this.lightX });
    this.setState({ lightY: this.lightY });
    this.setState({ ambientIntensity: this.ambientIntensity });
    this.setState({ directionalIntensity: this.directionalIntensity });
  }

  initialiseThreeCanvasProps() {
    const zoom_level = this.props.viewer.viewport.getZoom(true);
    this.threeCanvasProps = {};
    this.threeCanvasProps.contentWidth =
      this.props.viewer.viewport._contentSize.x;
    this.threeCanvasProps.contentHeight =
      this.props.viewer.viewport._contentSize.y;
    this.threeCanvasProps.rendererInstructions = getRendererInstructions(
      this.props
    );
    this.threeCanvasProps.zoom = this.props.viewer.world
      .getItemAt(0)
      .viewportToImageZoom(zoom_level);
    this.threeCanvasProps.albedoMap = this.albedoMap;
    this.threeCanvasProps.normalMap = this.normalMap;
    this.threeCanvasProps.lightX = this.lightX;
    this.threeCanvasProps.lightY = this.lightY;
    this.threeCanvasProps.directionalIntensity = this.directionalIntensity;
    this.threeCanvasProps.ambientIntensity = this.ambientIntensity;
    this.threeCanvasProps.tileLevel = this.tileLevel;
    this.threeCanvasProps.minTileLevel = Math.min.apply(this.tileLevels);
    this.threeCanvasProps.tileLevels = this.tileLevels;
    this.threeCanvasProps.maxTileLevel =
      this.props.viewer.source.scale_factors.length - 1;
    this.tileSets = getTileSets(
      this.threeCanvasProps.maxTileLevel,
      this.props.viewer.source,
      this.threeCanvasProps.albedoMap,
      this.threeCanvasProps.normalMap
    );
    this.threeCanvasProps.images = this.images;
    this.threeCanvasProps.tileSets = this.tileSets;
  }
  updateThreeCanvasProps() {
    const zoom_level = this.props.viewer.viewport.getZoom(true);
    this.threeCanvasProps.rendererInstructions = getRendererInstructions(
      this.props
    );
    this.threeCanvasProps.zoom = this.props.viewer.world
      .getItemAt(0)
      .viewportToImageZoom(zoom_level);
    this.threeCanvasProps.tileLevel = this.tileLevel;
    this.threeCanvasProps.images = this.images;
  }

  updateLayer(excluded_maps, canvas_id, layers, value) {
    const _props = this.props,
      updateLayers = _props.updateLayers,
      windowId = _props.windowId;

    Object.keys(layers).forEach((key) => {
      const mapType = layers[key].trim();

      if (excluded_maps.includes(mapType)) {
        const payload = {
          [key]: { visibility: value },
        };
        updateLayers(windowId, canvas_id, payload);
      }
    });
  }

  torchHandler() {
    // only turn the composite image back on
    this.setState((prevState) => ({ active: !prevState.active }));

    this.excluded_maps = ['composite'];
    this.updateLayer(
      this.excluded_maps,
      this.canvasID,
      this.layers,
      this.state.active
    );

    if (this.state.active) {
      this.props.viewer.removeOverlay(this.threeCanvas);
      this.props.viewer.removeAllHandlers('viewport-change');
    } else {
      // call update threeCanasProps
      this.initialiseThreeCanvasProps();

      this.threeCanvas = document.createElement('div');
      this.threeCanvas.id = 'three-canvas';
      this.props.viewer.addOverlay(this.threeCanvas);
      this.overlay = this.props.viewer.getOverlayById(this.threeCanvas);

      this.overlay.update(
        this.threeCanvasProps.rendererInstructions.intersectionTopLeft
      );

      // uncomment code below to enable debug mode in OpenSeaDragon
      // for (var i = 0; i < this.props.viewer.world.getItemCount(); i++) {
      //     this.props.viewer.world.getItemAt(i).debugMode = true;
      // }

      // We need to call forceRedraw each time we update the overlay, if this line is remove, the overlay will
      // glitch and not re-render until we cause the viewport-change event to trigger
      this.props.viewer.forceRedraw();
      this.props.viewer.addHandler('viewport-change', () => {
        // call update threeCanvasrops
        this.updateThreeCanvasProps();

        this.setState({ zoom: this.threeCanvasProps.zoom });
        this.setState({
          rendererInstructions: this.threeCanvasProps.rendererInstructions,
        });
        this.setState({
          directionalIntensity: this.threeCanvasProps.directionalIntensity,
        });
        this.overlay.update(
          this.threeCanvasProps.rendererInstructions.intersectionTopLeft
        );
        this.setState({ images: this.threeCanvasProps.images });
        this.setState({ tileLevel: this.threeCanvasProps.tileLevel });
      });

      this.props.viewer.addHandler('close', () => {
        this.setState({ active: false });
        this.setState({ visible: false });
        // remove all handlers so viewport-change isn't activated!
        this.props.viewer.removeAllHandlers('viewport-change');
      });
    }
    // this will need replacing because I think that ReacDOM.render has been depricated
    !this.state.active
      ? ReactDOM.render(
          <RelightThreeOverlay threeCanvasProps={this.threeCanvasProps} />,
          this.threeCanvas
        )
      : ReactDOM.unmountComponentAtNode(this.threeCanvas);
  }

  // this keeps track of values stored in state and compares them to the current values, if any of them change it causes
  // a rerender
  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevState.zoom !== this.threeCanvasProps.zoom ||
      prevState.rendererInstructions.intersection !==
        this.threeCanvasProps.rendererInstructions.intersection ||
      prevState.active !== this.state.active ||
      prevState.lightX !== this.threeCanvasProps.lightX ||
      prevState.lightY !== this.threeCanvasProps.lightY ||
      prevState.directionalIntensity !== this.state.directionalIntensity ||
      prevState.ambientIntensity !== this.state.ambientIntensity ||
      prevState.tileLevel !== this.threeCanvasProps.tileLevel ||
      prevState.images !== this.threeCanvasProps.images
    ) {
      this.state.active
        ? ReactDOM.render(
            <RelightThreeOverlay threeCanvasProps={this.threeCanvasProps} />,
            this.threeCanvas
          )
        : null;
    }
  }

  render() {
    if (typeof this.props.canvas !== 'undefined' && !this.state.visible) {
      this.albedoMap = getMap(this.props.canvas.iiifImageResources, 'albedo');
      this.normalMap = getMap(this.props.canvas.iiifImageResources, 'normal');

      if (
        typeof this.albedoMap !== 'undefined' &&
        typeof this.normalMap !== 'undefined' &&
        !this.state.visible
      ) {
        this.setState((prevState) => ({ visible: !prevState.visible }));
        this.map_ids = [
          this.albedoMap.split('/').pop(),
          this.normalMap.split('/').pop(),
        ];
      }
    }

    if (
      this.props.viewer &&
      typeof this.albedoMap !== 'undefined' &&
      typeof this.normalMap !== 'undefined'
    ) {
      if (!this.state.loaded && !this.state.loadHandlerAdded) {
        this.setState({ loaded: true });

        this.excluded_maps = ['depth', 'shaded'];
        this.layers = getLayers(this.props.canvas.iiifImageResources);
        this.canvasID = this.props.canvas.id;

        this.updateLayer(this.excluded_maps, this.canvasID, this.layers);

        this.props.viewer.addHandler('tile-drawn', (event) => {
          this.tileLevels[event.tile.level] = event.tile.level;
          this.tileLevel = event.tile.level;
        });

        this.props.viewer.addHandler('tile-loaded', (event) => {
          this.setState({ loadHandlerAdded: true });
          const sourceKey = event.image.currentSrc.split('/')[5];
          const canvas = document.createElement('canvas');
          const tileTexture = new THREE.Texture(event.image);
          const key = event.tile.cacheKey;

          canvas.width = event.image.width;
          canvas.height = event.image.height;
          event.tile.context2D = canvas.getContext('2d');
          event.tile.context2D.drawImage(event.image, 0, 0);

          tileTexture.needsUpdate = true;

          if (this.map_ids.includes(sourceKey)) {
            // only keep tile textures we are interested in
            this.images[key] = tileTexture;
            this.threeCanvasProps.images = this.images;
            this.setState({ images: this.threeCanvasProps.images });
          }
        });
      }
    }

    let toolMenu = null;

    if (this.state.visible && this.state.open) {
      toolMenu = (
        <RelightToolMenu
          visible={this.state.visible}
          sideBarOpen={this.props.window.sideBarOpen}
        >
          <RelightLightButtons>
            <RelightMenuButton
              open={this.state.open}
              onClick={() => this.menuHandler()}
            />
            <RelightTorchButton
              onClick={() => this.torchHandler()}
              active={this.state.active}
            />
            <RelightResetLightPositions onClick={() => this.resetHandler()} />
          </RelightLightButtons>
          <RelightLightControls>
            <RelightLightDirection
              id={'LightDirectionControl'}
              tooltipTitle={'Change Light Direction'}
              mouseX={this.state.mouseX}
              mouseY={this.state.mouseY}
              onMouseMove={(event) => this.onMouseMove(event)}
              onMouseDown={(event) => this.onMouseDown(event)}
              onMouseUp={(event) => this.onMouseUp(event)}
              onMouseLeave={(event) => this.onMouseLeave(event)}
              onTouchMove={(event) => this.onMouseMove(event)}
            />
            <RelightLightIntensity
              id={'DirectionalLightIntensity'}
              tooltipTitle={'Change Directional Light Intensity'}
              intensity={this.state.directionalIntensity}
              onChange={(event, value) =>
                this.onDirectionalLightChange(event, value)
              }
            />
            <RelightLightIntensity
              id={'AmbientLightIntensity'}
              min={0}
              tooltipTitle={'Change Ambient Light Intensity'}
              intensity={this.state.ambientIntensity}
              onChange={(event, value) =>
                this.onAmbientLightChange(event, value)
              }
            />
          </RelightLightControls>
        </RelightToolMenu>
      );
    } else if (this.state.visible && !this.state.open) {
      toolMenu = (
        <RelightToolMenu
          visible={this.state.visible}
          sideBarOpen={this.props.window.sideBarOpen}
        >
          <RelightMenuButton
            open={this.state.open}
            onClick={() => this.menuHandler()}
          />
        </RelightToolMenu>
      );
    } else if (!this.state.visible) {
      toolMenu = null;
    }

    return <>{toolMenu}</>;
  }
}

Relight.propTypes = {
  onClick: PropTypes.func.isRequired,
  ambientIntensity: PropTypes.number.isRequired,
  updateLayers: PropTypes.func.isRequired,
  windowId: PropTypes.number.isRequired,
  viewer: PropTypes.object.isRequired,
  window: PropTypes.object.isRequired,
  canvas: PropTypes.object.isRequired,
};

export default Relight;
