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
import RelightAmbientLightIntensity from './RelightAmbientLightIntensity';
import RelightDirectionalLightIntensity from './RelightDirectionalLightIntensity';
import RelightLightDirection from './RelightLightDirection';
import RelightLightControls from './RelightLightControls';
import RelightToolMenu from './RelightToolMenu';
import RelightResetLights from './RelightResetLights';
import RelightLightButtons from './RelightLightButtons';
import RelightTorchButton from './RelightTorchButton';
import RelightThreeOverlay from './RelightThreeOverlay';
import RelightMenuButton from './RelightMenuButton';

/**
 * The Relight component is the parent group of the plug-in that is inserted into the Mirador viewer as a tool menu.
 * It is composed of a group of buttons and a group of controls that make up the relighting plug-in.
 * */
class Relight extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      open: false,
      visible: false,
      loaded: false,
      loadHandlerAdded: false,
      threeCanvasProps: {},
    };
    this.threeCanvasProps = {};
    this.mouseDown = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.lightX = 0;
    this.lightY = 0;
    this.directionalIntensity = 1.0;
    this.ambientIntensity = 0.1;
    this.images = {};
    this.tileSets = {};
    this.tileLevels = {};
  }
  /**
   * The onMouseMove method tracks the mouse coordinates over the RelightLightDirectionControl component to allow the
   * style of the component to change and indicate to the user which direction the light should be shining from.
   * The threeCanvasProps are updated in state to cause a re-render each time the mouse is moved whilst the button
   * is pressed over the component, this updates the props passed to the Three canvas.
   * */
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
      this.threeCanvasProps.mouseX = this.mouseX;
      this.threeCanvasProps.mouseY = this.mouseY;
      this.threeCanvasProps.lightX = this.lightX;
      this.threeCanvasProps.lightY = this.lightY;
      this.threeCanvasProps.ambientIntensity = this.ambientIntensity;
      this.threeCanvasProps.directionalIntensity = this.directionalIntensity;

      this.setState({
        threeCanvasProps: this.threeCanvasProps,
      });
    }
  }

  /**
   * The onMouseDown method sets the class variable `mouseDown` to true when the mouse button is held down over its
   * target component.
   */
  onMouseDown() {
    this.mouseDown = true;
  }

  /**
   * The onMouseUp method sets the class variable `mouseDown` to false when the mouse button is let go over its
   * target component.
   */
  onMouseUp() {
    this.mouseDown = false;
  }

  /**
   * The onMouseLeave method sets the class variable `mouseDown` to false when the mouse button leaves its target
   * component.
   */
  onMouseLeave() {
    this.mouseDown = false;
  }

  /**
   * The onDirectionalLightChange method updates the directionalIntensity threeCanvasProp in state when the target
   * component is changed, causing a re-render and updating the props sent to the Three canvas.
   * @param {event} event event being emitted by the RelightDirectionalLightChange component.
   * @param {number} value new lightIntensity value from the component to add to state.
   */
  onDirectionalLightChange(event, value) {
    this.threeCanvasProps.directionalIntensity = value;
    this.setState({
      threeCanvasProps: this.threeCanvasProps,
    });
  }

  /**
   * The onAmbientLightChange method updates the ambientIntensity threeCanvasProp in state when the target
   * component is changed, causing a re-render and updating the props sent to the Three canvas.
   * @param {event} event event being emitted by the RelightAmbientLightChange component.
   * @param {number} value new lightIntensity value from the component to add to state.
   */
  onAmbientLightChange(event, value) {
    this.threeCanvasProps.ambientIntensity = value;
    this.setState({
      threeCanvasProps: this.threeCanvasProps,
    });
  }

  /**
   * The menuHandler method updates open in state to keep track of if the Mirador sidebar is expanded or contracted.
   */
  menuHandler() {
    this.setState((prevState) => ({ open: !prevState.open }));
  }

  /**
   * The resetHandler method resets the values of the light control components when the RelightResetLights component
   * is pressed.  It updates the threeCanvasProps to state causing a re-render; the appearance and values of the light
   * controls to return to their default values; and the light positions and intensities in the Three canvas to reset.
   */
  resetHandler() {
    this.threeCanvasProps.ambientIntensity = 0.1;
    this.threeCanvasProps.directionalIntensity = 1.0;
    this.threeCanvasProps.lightX = 0;
    this.threeCanvasProps.lightY = 0;
    this.threeCanvasProps.mouseX = 50;
    this.threeCanvasProps.mouseY = 50;

    this.setState({
      threeCanvasProps: this.threeCanvasProps,
    });
  }

  /**
   * The initialiseThreeCanvasProps method sets the threeCanvasProps object with the current lighting positions,
   * zoom level, tile levels, image intersection dimensions, and maps so that the Three canvas overlay has everything
   * is need to start rendering.  It will capture the current values of the light positions and intensities even if the
   * overlay is currently switched off.
   */
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
    this.threeCanvasProps.lightX = 0;
    this.threeCanvasProps.lightY = 0;
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

  /**
   * The updateThreeCanvasProps method is used by the viewport-change event handler to keep the overlay dimensions and
   * Three camera view in sync with OpenSeaDragon and make sure the updated Three textures are sent to Three canvas.
   */
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

  /**
   * The updateLayer method is used to turn on or off any set of layers present in the viewer that you want to,
   * it can be used to turn off a set of or a singular layer by specifying the layer mapTypes in excluded_maps
   * and providing a list of the layers currently in the viewer.  You can send a boolean value to turn these on
   * or off, which means you can toggle the state of a control e.g. active: false or true to control this too.
   * @param {array} excluded_maps an array containing the mapTypes you wish to toggle visibility on
   * @param {string} canvas_id the id of the current canvas in the viewer
   * @param {object} layers an object containing all the layer ids (urls) in viewer
   * @param {boolean} value a boolean value indicating whether you want the excluded layers on or off
   */
  updateLayer(excluded_maps, canvas_id, layers, value) {
    const _props = this.props,
      updateLayers = _props.updateLayers,
      windowId = _props.windowId;

    Object.keys(layers).forEach((key) => {
      const mapType = layers[key].trim();

      if (excluded_maps.includes(mapType)) {
        // todo: if normalmap and albedo are off turn them on again!

        const payload = {
          [key]: { visibility: value },
        };
        updateLayers(windowId, canvas_id, payload);
      }
    });
  }

  /**
   * The torchHandler method is used to update the active state of the RelightTorchButton component; initialise and
   * update the threeCanvasProps, track changes to the OpenSeaDragon viewer and add or remove the Three canvas overlay
   * to the view port.
   */
  torchHandler() {
    // toggle the active state of the torchButton
    this.setState((prevState) => ({ active: !prevState.active }));

    // only turn the composite image back on
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
      // here we populate the required props for the Three canvas
      this.initialiseThreeCanvasProps();
      // create the overlay html element and add in the Three canvas component
      this.threeCanvas = document.createElement('div');
      this.threeCanvas.id = 'three-canvas';
      this.props.viewer.addOverlay(this.threeCanvas);
      this.overlay = this.props.viewer.getOverlayById(this.threeCanvas);
      // this tells the overlay where to begin in terms of x, y coordinates
      this.overlay.update(
        this.threeCanvasProps.rendererInstructions.intersectionTopLeft
      );

      // We need to call forceRedraw each time we update the overlay, if this line is remove, the overlay will
      // glitch and not re-render until we cause the viewport-change event to trigger
      this.props.viewer.forceRedraw();
      // add a custom event handler that listens for emission of the OpenSeaDragon viewport-change event
      this.props.viewer.addHandler('viewport-change', () => {
        // here we update a selection of the props for the Three canvas
        this.updateThreeCanvasProps();
        // update the threeCanvasProps state to cause a re-render and update the overlay
        this.setState({
          threeCanvasProps: this.threeCanvasProps,
        });
        // this tells the overlay where to begin in terms of x, y coordinates
        this.overlay.update(
          this.threeCanvasProps.rendererInstructions.intersectionTopLeft
        );
      });
      // add a custom event handler that listens for the emission of the OpenSeaDragon close event to clean up
      this.props.viewer.addHandler('close', () => {
        this.setState({ active: false, visible: false });
        // remove all handlers so viewport-change isn't activated!
        this.props.viewer.removeAllHandlers('viewport-change');
      });
    }
    // if the torchButton state is active render the overlay over OpenSeaDragon
    !this.state.active
      ? ReactDOM.render(
          <RelightThreeOverlay threeCanvasProps={this.threeCanvasProps} />,
          this.threeCanvas
        )
      : ReactDOM.unmountComponentAtNode(this.threeCanvas);
  }

  /**
   * The componentDidUpdate method is a standard React class method that is used to run other methods whenever state or
   * props are updated.  Here we used it to re-render the overlay if there is a change in state detected.
   * ever an update of state.  Here we use it to keep th
   * @param prevProps the previous props sent to the Relight component
   * @param prevState the previous state set in the Relight component
   * @param snapshot a snapshot of the component before the next render cycle, you can use the React class method
   * getSnapShotBeforeUpdate to create this
   */
  //  track of values stored in state and if they change if runs
  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    this.state.active
      ? ReactDOM.render(
          <RelightThreeOverlay threeCanvasProps={this.threeCanvasProps} />,
          this.threeCanvas
        )
      : null;
  }

  /**
   * Render the Relight component and all it's children, here we have a custom OpenSeaDragon event handler that allows
   * us to capture the tile images and make textures from them.
   * @returns {JSX.Element}
   */
  render() {
    // if the canvas object is available then grab define the albedo and normal maps and set them to state
    if (typeof this.props.canvas !== 'undefined' && !this.state.visible) {
      this.albedoMap = getMap(this.props.canvas.iiifImageResources, 'albedo');
      this.normalMap = getMap(this.props.canvas.iiifImageResources, 'normal');

      // if albedo or normal maps are not present set visible state to false, this will prevent the plug-in from
      // rendering at all, which is what we want.
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

    // if the viewer object, albedoMap and normalMap URLs are not available, do not render
    if (
      this.props.viewer &&
      typeof this.albedoMap !== 'undefined' &&
      typeof this.normalMap !== 'undefined'
    ) {
      // if the loaded in state is false and the loadHandlerAdded state is false then add the tile-loaded event
      // handler, and update state this prevents the handler being added each time there is a re-render
      if (!this.state.loaded && !this.state.loadHandlerAdded) {
        this.setState({ loaded: true });

        this.excluded_maps = ['depth', 'shaded'];
        this.layers = getLayers(this.props.canvas.iiifImageResources);
        this.canvasID = this.props.canvas.id;

        this.updateLayer(this.excluded_maps, this.canvasID, this.layers, false);

        // add an event handler to keep track of the tile levels being drawn, no point getting all of them
        this.props.viewer.addHandler('tile-drawn', (event) => {
          this.tileLevels[event.tile.level] = event.tile.level;
          this.tileLevel = event.tile.level;
        });

        // add an event handler to build Three textures from the tiles as they are loaded, this means they can be
        // reused and sent to the Three canvas.
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

            this.setState({
              threeCanvasProps: this.threeCanvasProps,
            });
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
            <RelightResetLights onClick={() => this.resetHandler()} />
          </RelightLightButtons>
          <RelightLightControls>
            <RelightLightDirection
              id={'LightDirectionControl'}
              tooltipTitle={'Change Light Direction'}
              mouseX={this.state.threeCanvasProps.mouseX}
              mouseY={this.state.threeCanvasProps.mouseY}
              onMouseMove={(event) => this.onMouseMove(event)}
              onMouseDown={(event) => this.onMouseDown(event)}
              onMouseUp={(event) => this.onMouseUp(event)}
              onMouseLeave={(event) => this.onMouseLeave(event)}
              onTouchMove={(event) => this.onMouseMove(event)}
            />
            <RelightDirectionalLightIntensity
              id={'DirectionalLightIntensity'}
              tooltipTitle={'Change Directional Light Intensity'}
              intensity={this.state.threeCanvasProps.directionalIntensity}
              onChange={(event, value) =>
                this.onDirectionalLightChange(event, value)
              }
            />
            <RelightAmbientLightIntensity
              id={'AmbientLightIntensity'}
              tooltipTitle={'Change Ambient Light Intensity'}
              intensity={this.state.threeCanvasProps.ambientIntensity}
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
  /** The onClick prop is a method passed to clickable child components to handle the click event **/
  onClick: PropTypes.func.isRequired,
  /** The ambientIntensity prop is the intensity level currently set for the ambient light source **/
  ambientIntensity: PropTypes.number.isRequired,
  /** The updateLayers prop is the Mirador updateLayers action to be able to set the state of layer objects **/
  updateLayers: PropTypes.func.isRequired,
  /** The windowId prop is the Mirador window ID of the current instance of Mirador **/
  windowId: PropTypes.number.isRequired,
  /** The viewer prop is the OpenSeaDragon viewer instance in the current instance of Mirador **/
  viewer: PropTypes.object.isRequired,
  /** The window prop is the Mirador window instance in the current instance of Mirador **/
  window: PropTypes.object.isRequired,
  /** The canvas prop is the Mirador canvas instance in the current instance of Mirador **/
  canvas: PropTypes.object.isRequired,
};

export default Relight;
