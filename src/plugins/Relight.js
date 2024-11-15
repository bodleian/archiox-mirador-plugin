import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import * as THREE from 'three';
import {
  updateLayer,
  setLayers,
  getMaps,
  getImages,
  getMap,
  getRendererInstructions,
  getTileSets,
  reduceLayers,
  getAspect,
} from './RelightHelpers';
import RelightNormalDepth from './RelightNormalDepth';
import RelightAmbientLightIntensity from './RelightAmbientLightIntensity';
import RelightDirectionalLightIntensity from './RelightDirectionalLightIntensity';
import RelightLightDirection from './RelightLightDirection';
import RelightLightControls from './RelightLightControls';
import RelightToolMenu from './RelightToolMenu';
import RelightResetLights from './RelightResetLights';
import RelightLightButtons from './RelightLightButtons';
import RelightTorchButton from './RelightTorchButton';
import RelightExpandSlidersButton from './RelightExpandSlidersButton';
import RelightThreeOverlay from './RelightThreeOverlay';
import RelightMenuButton from './RelightMenuButton';
//import RelightAnnotationButton from './RelightAnnotations';  // disabled until we can get annotation data
import RelightMenuButtons from './RelightMenuButtons';
import RelightLightHelper from './RelightLightHelper';
import RelightRenderMode from './RelightRenderMode';
import RelightCycleDefaultLayer from './RelightCycleDefaultLayer';
import RelightShininessIntensity from './RelightShininessIntensity';
import RelightMetalnessIntensity from './RelightMetalnessIntensity';
import RelightRoughnessIntensity from './RelightRoughnessIntensity';
import { getLayers } from 'archiox-mirador-plugin/src/plugins/state/selectors';

/**
 * The Relight component is the parent group of the plug-in that is inserted into the Mirador viewer as a tool menu.
 * It is composed of a group of buttons and a group of controls that make up the relighting plug-in.
 * */
class Relight extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      open: this.props.window.archioxPluginOpen || false,
      drawerOpen: false,
      visible: false,
      loaded: false,
      loadHandlerAdded: false,
      threeCanvasProps: {},
    };
    this.threeCanvasProps = {};
    this.mouseDown = false;
    this.mouseX = 50;
    this.mouseY = 50;
    this.lightX = 0;
    this.lightY = 0;
    this.metalness = 0.0;
    this.roughness = 0.5;
    this.shininess = 30;
    this.directionalIntensity = 1.0;
    this.ambientIntensity = 0.1;
    this.images = {};
    this.tileSets = {};
    this.tileLevels = {};
    this.helperOn = false;
    this.renderMode = true;
    this.albedoInfo = {};

    if (!this.renderMode) {
      this.normalDepth = 10.0;
    } else {
      this.normalDepth = 1.0;
    }
  }
  /**
   * The onMouseMove method tracks the mouse coordinates over the RelightLightDirectionControl component to allow the
   * style of the component to change and indicate to the user which direction the light should be shining from.
   * The threeCanvasProps are updated in state to cause a re-render each time the mouse is moved whilst the button
   * is pressed over the component, this tracks the current rotation and flipped status of the canvas,
   * this also updates the props passed to the Three canvas.
   * */
  onMouseMove(event, id, rotation) {
    const lightDirectionControl = document.getElementById(id);
    const boundingBox = lightDirectionControl.getBoundingClientRect();

    let xMove;
    let yMove;

    if (event.type === 'mousemove' && this.mouseDown) {
      event.preventDefault();
      xMove = event.clientX - boundingBox.left;
      yMove = event.clientY - boundingBox.top;
    } else if (event.type === 'touchmove') {
      this.mouseDown = true;
      xMove = event.touches[0].clientX - boundingBox.left;
      yMove = event.touches[0].clientY - boundingBox.top;
    }

    if (this.mouseDown) {
      // rotation is the total degrees the canvas has rotated, i.e. it stacks, we need to get this back
      // to a relative number by using modulus...
      const rotationModulus = rotation % 360;

      switch (rotationModulus) {
        case 0:
          this.mouseX = xMove;
          this.mouseY = yMove;
          this.lightX = (this.mouseX / 100) * 2 - 1;
          this.lightY = (this.mouseY / 100) * 2 - 1;
          this.lightX = this.flipped ? -this.lightX : this.lightX;
          break;
        case -270:
        case 90:
          this.mouseX = yMove;
          this.mouseY = xMove;
          this.lightX = (this.mouseX / 100) * 2 - 1;
          this.lightY = -((this.mouseY / 100) * 2 - 1);
          this.lightY = this.flipped ? -this.lightY : this.lightY;
          break;
        case -180:
        case 180:
          this.mouseX = xMove;
          this.mouseY = yMove;
          this.lightX = -((this.mouseX / 100) * 2 - 1);
          this.lightY = -((this.mouseY / 100) * 2 - 1);
          this.lightX = this.flipped ? -this.lightX : this.lightX;
          break;
        case -90:
        case 270:
          this.mouseX = yMove;
          this.mouseY = xMove;
          this.lightX = -((this.mouseX / 100) * 2 - 1);
          this.lightY = (this.mouseY / 100) * 2 - 1;
          this.lightY = this.flipped ? -this.lightY : this.lightY;
      }
      this.threeCanvasProps.lightX = this.lightX;
      this.threeCanvasProps.lightY = this.lightY;

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
    this.directionalIntensity = value;
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
    this.ambientIntensity = value;
    this.threeCanvasProps.ambientIntensity = value;
    this.setState({
      threeCanvasProps: this.threeCanvasProps,
    });
  }

  /**
   * The onNormalDepthChange method updates the normalDepth threeCanvasProp in state when the target
   * component is changed, causing a re-render and updating the props sent to the Three canvas.
   * @param {event} event event being emitted by the RelightNormalDepthChange component.
   * @param {number} value new normalDepth value from the component to add to state.
   */
  onNormalDepthChange(event, value) {
    this.normalDepth = value;
    this.threeCanvasProps.normalDepth = value;
    this.setState({
      threeCanvasProps: this.threeCanvasProps,
    });
  }

  /**
   * The onShininessChange method updates the shininess threeCanvasProp in state when the
   * target component is changed, causing a re-render and updating the props sent to the Three canvas.
   * @param {event} event event being emitted by the RelightShininessIntensity component.
   * @param {number} value new shininess value from the component to ad to state.
   * **/
  onShininessChange(event, value) {
    this.shininess = value;
    this.threeCanvasProps.shininess = value;
    this.setState({
      threeCanvasProps: this.threeCanvasProps,
    });
  }

  /**
   * The onMetalnessChange method updates the metalness threeCanvasProp in state when the
   * target component is changed, causing a re-render and updating the props sent to the Three canvas.
   * @param {event} event event being emitted by the RelightMetalnessIntensity component.
   * @param {number} value new metalness value from the component to ad to state.
   * **/
  onMetalnessChange(event, value) {
    this.metalness = value;
    this.threeCanvasProps.metalness = value;
    this.setState({
      threeCanvasProps: this.threeCanvasProps,
    });
  }

  /**
   * The onRoughnessChange method updates the roughness threeCanvasProp in state when the
   * target component is changed, causing a re-render and updating the props sent to the Three canvas.
   * @param {event} event event being emitted by the RelightRoughnessIntensity component.
   * @param {number} value new roughness value from the component to ad to state.
   * **/
  onRoughnessChange(event, value) {
    this.roughness = value;
    this.threeCanvasProps.roughness = value;
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
  resetHandler(id) {
    if (!this.state.active) {
      return;
    }

    this.ambientIntensity = 0.1;
    this.directionalIntensity = 1.0;
    this.lightX = 0;
    this.lightY = 0;

    if (!this.renderMode) {
      this.normalDepth = 10.0;
    } else {
      this.normalDepth = 1.0;
    }
    this.metalness = 0.0;
    this.roughness = 0.5;
    this.shininess = 30.0;

    const lightDirectionControl = document.getElementById(id);
    lightDirectionControl.style.background =
      `radial-gradient(at ` + 50 + `% ` + 50 + `%, #ffffff, #000000)`;

    this.initialiseThreeCanvasProps();

    this.setState({
      threeCanvasProps: this.threeCanvasProps,
    });
  }

  /**
   * The helperHandler method when called toggles the boolean value this.helperOn and then trigger an OSD overlay
   * update to decide if the three.js directional light helper is rendered or not.
   * **/
  helperHandler() {
    this.helperOn = !this.helperOn;
    this.updateOverlay();
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
    this.threeCanvasProps.helperOn = this.helperOn;
    this.threeCanvasProps.renderMode = this.renderMode;
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
    this.threeCanvasProps.normalDepth = this.normalDepth;
    this.threeCanvasProps.metalness = this.metalness;
    this.threeCanvasProps.roughness = this.roughness;
    this.threeCanvasProps.shininess = this.shininess;
    this.threeCanvasProps.directionalIntensity = this.directionalIntensity;
    this.threeCanvasProps.ambientIntensity = this.ambientIntensity;
    this.threeCanvasProps.tileLevel = this.tileLevel;
    this.threeCanvasProps.minTileLevel = Math.min.apply(Math, this.tileLevels);
    this.threeCanvasProps.tileLevels = this.tileLevels;
    this.threeCanvasProps.maxTileLevel =
      this.albedoInfo.tiles[0].scaleFactors.length - 1;
    this.tileSets = getTileSets(
      this.threeCanvasProps.maxTileLevel,
      this.albedoInfo,
      this.threeCanvasProps.albedoMap,
      this.threeCanvasProps.normalMap
    );
    this.threeCanvasProps.contentWidth = this.tileSets[1].albedoTiles.width;
    this.threeCanvasProps.contentHeight = this.tileSets[1].albedoTiles.height;
    this.threeCanvasProps.images = this.images;
    this.threeCanvasProps.tileSets = this.tileSets;
  }

  /**
   * The updateOverlay method updates a selection of the props for the Three canvas to keep it in sync with the
   * image in Openseadragon.
   * */
  updateOverlay() {
    this.updateThreeCanvasProps();
    // update the threeCanvasProps state to cause a re-render and update the overlay
    this.setState({
      threeCanvasProps: this.threeCanvasProps,
    });
    // this tells the overlay where to begin in terms of x, y coordinates
    if (this.overlay) {
      this.overlay.update(
        this.threeCanvasProps.rendererInstructions.intersectionTopLeft
      );
    }
  }

  /**
   *
   **/
  generateMapData() {
    this.albedoMap = getMap(this.props.canvas.iiifImageResources, 'albedo');
    this.normalMap = getMap(this.props.canvas.iiifImageResources, 'normal');
    this.map_ids = [
      this.albedoMap.split('/').pop(),
      this.normalMap.split('/').pop(),
    ];
  }

  /**
   * The updateThreeCanvasProps method is used by the viewport-change event handler to keep the overlay dimensions and
   * Three camera view in sync with OpenSeaDragon and make sure the updated Three textures are sent to Three canvas.
   */
  updateThreeCanvasProps() {
    this.threeCanvasProps.renderMode = this.renderMode;

    this.threeCanvasProps.helperOn = this.helperOn;
    const zoom_level = this.props.viewer.viewport.getZoom(true);
    this.threeCanvasProps.rendererInstructions = getRendererInstructions(
      this.props
    );
    this.threeCanvasProps.zoom = this.props.viewer.viewport.viewer.world
      .getItemAt(0)
      .viewportToImageZoom(zoom_level);
    this.threeCanvasProps.tileLevel = this.tileLevel;
    this.threeCanvasProps.images = this.images;
  }

  /**
   * The torchHandler method is used to update the active state of the RelightTorchButton component; initialise and
   * update the threeCanvasProps, track changes to the OpenSeaDragon viewer and add or remove the Three canvas overlay
   * to the view port.
   */
  torchHandler() {
    // at this point in the cycle of the plug-in state should have the info.json responses available
    this.albedoInfo = this.props.state.infoResponses[this.albedoMap].json;
    // toggle the active state of the torchButton
    this.setState((prevState) => ({ active: !prevState.active }));
    // always turn on albedo and normal regardless
    let excluded_maps;

    if (this.state.active) {
      excluded_maps = ['normal', 'albedo', 'composite'];
    } else {
      excluded_maps = ['normal', 'albedo'];
    }

    updateLayer(
      this.props.state,
      this.props.canvas.iiifImageResources,
      this.props.windowId,
      this.props.updateLayers,
      excluded_maps,
      this.canvasId
    );

    if (this.state.active) {
      // todo: find a better way to removeOverlays and handlers.  Overlay works for the first instance of
      //  duplicated windows, but for the second toggle it only adds the overlay to the first window!
      this.props.viewer.removeOverlay(this.threeCanvas);
      this.props.viewer.removeAllHandlers('viewport-change');
    } else {
      // here we populate the required props for the Three canvas
      this.initialiseThreeCanvasProps();
      // create the overlay html element and add in the Three canvas component
      // this tells the overlay where to begin in terms of x, y coordinates
      this.props.viewer.addOverlay(this.threeCanvas);
      this.overlay = this.props.viewer.getOverlayById(this.threeCanvas);

      this.overlay.update(
        this.threeCanvasProps.rendererInstructions.intersectionTopLeft
      );

      // We need to call forceRedraw each time we update the overlay, if this line is remove, the overlay will
      // glitch and not re-render until we cause the viewport-change event to trigger
      this.props.viewer.forceRedraw();
      // add a custom event handler that listens for emission of the OpenSeaDragon viewport-change event
      this.props.viewer.addHandler('viewport-change', () => {
        this.updateOverlay();
      });

      this.props.viewer.addHandler('rotate', () => {
        this.updateOverlay();
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
   * The annotationsHandler method when called will get the state of annotation visibility from Mirador and toggle it.
   **/
  annotationsHandler() {
    null;
  }

  /**
   * The renderHandler method when called will toggle the boolean value of this.renderMode, trigger the resetHandler
   * method causing the UI settings to reset and cause an update of the OSD overlay.  The renderMode boolean value
   * controls what material the three.js canvas overlay is currently using.
   **/
  renderHandler() {
    this.renderMode = !this.renderMode;
    this.resetHandler(this.props.relightLightDirectionID);
    this.updateOverlay();
  }

  /**
   * The defaultLayerHandler method when called will reset the visibility of all layers, get the current layers out
   * of the Mirador state storage, shuffle their index order by one and put them back causing Mirador to change the
   * current choices layer being rendered on top of the stack.  A user can use Miradors inbuilt functions to change
   * the order of the choices layers, and this function will preserve that order when shuffling.
   **/
  defaultLayerHandler() {
    // make all the layers visible...
    const excluded_maps = [
      'composite',
      'albedo',
      'normal',
      'shaded',
      'depth',
      'none',
    ];
    const layersInState = getLayers(this.props.state)[this.props.windowId][
      this.canvasId
    ];
    let items;
    let imagesFromState;

    if (layersInState) {
      // get the current state and extract the current index values and visibilities into a sorted array
      items = Object.entries(layersInState)
        .map(([url, { index, visibility }]) => ({ url, index, visibility }))
        .sort((a, b) => a.index - b.index); // sort items based on the index property

      // transform the sorted items into the desired output format for use as a payload body for Mirador
      imagesFromState = items.map(({ url }) => ({ id: url }));
    }

    const maps = getMaps(this.props.canvas.iiifImageResources);

    if (this.layers === undefined && !layersInState) {
      this.layers = getImages(this.props.canvas.iiifImageResources);
    } else {
      this.layers = imagesFromState;
    }

    this.layers.push(this.layers.shift());
    const payload = reduceLayers(this.layers, maps, excluded_maps);

    setLayers(
      this.props.windowId,
      this.canvasId,
      this.props.updateLayers,
      payload
    ).next();
  }

  /**
   * The drawerHandler method when called will get the state of drawerOpen and toggle it.
   * **/
  drawerHandler() {
    this.setState((prevState) => ({ drawerOpen: !prevState.drawerOpen }));
  }

  disposeTextures(images) {
    for (const key in images) {
      if (images[key] instanceof THREE.Texture) {
        images[key].dispose();
        delete images[key];
      }
    }
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

  componentWillUnmount() {
    this.disposeTextures(this.images);
  }

  /**
   * Render the Relight component and all it's children, here we have a custom OpenSeaDragon event handler that allows
   * us to capture the tile images and make textures from them.
   * @returns {JSX.Element}
   */
  render() {
    this.aspect = getAspect();
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

      this.viewer = this.props.viewer;
      this.threeCanvas = document.createElement('div');
      this.threeCanvas.id = 'three-canvas-' + this.props.relightThreeCanvasID; // this needs to be unique
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

        const excluded_maps = ['composite', 'normal', 'albedo'];
        this.maps = getMaps(this.props.canvas.iiifImageResources);
        this.canvasId = this.props.canvas.id;
        this.rotation = this.props.viewer.viewport.getRotation(true);
        this.flipped = this.props.viewer.viewport.flipped;

        updateLayer(
          this.props.state,
          this.props.canvas.iiifImageResources,
          this.props.windowId,
          this.props.updateLayers,
          excluded_maps,
          this.canvasId
        );

        // add a rotate event handler
        this.props.viewer.addHandler('rotate', (event) => {
          this.rotation = event.degrees;
        });

        // add a flip event handler
        this.props.viewer.addHandler('flip', (event) => {
          this.flipped = event.flipped;
        });

        // add a custom event handler that listens for the emission of the OpenSeaDragon close event to clean up
        this.props.viewer.addHandler('close', () => {
          this.canvasId = this.props.canvas.id;
          updateLayer(
            this.props.state,
            this.props.canvas.iiifImageResources,
            this.props.windowId,
            this.props.updateLayers,
            excluded_maps,
            this.canvasId
          );
          this.generateMapData();

          this.setState({ active: false, visible: false });
          // remove all handlers so viewport-change isn't activated!
          this.props.viewer.removeAllHandlers('viewport-change');
        });

        // add an event handler to build Three textures from the tiles as they are loaded, this means they can be
        // reused and sent to the Three canvas.
        this.props.viewer.addHandler('tile-loaded', (event) => {
          this.setState({ loadHandlerAdded: true });
          this.tileLevels[event.tile.level] = event.tile.level;
          this.tileLevel = event.tile.level;

          const sourceKey = event.data.currentSrc.split('/')[5];
          const canvas = document.createElement('canvas');
          const tileTexture = new THREE.Texture(event.data);
          const key = event.tile.cacheKey;

          canvas.width = event.data.width;
          canvas.height = event.data.height;
          event.tile.context2D = canvas.getContext('2d');
          event.tile.context2D.drawImage(event.data, 0, 0);

          tileTexture.needsUpdate = true;

          if (this.map_ids.includes(sourceKey)) {
            // only keep tile textures we are interested in
            if (!(key in this.images)) {
              this.images[key] = tileTexture;
              this.threeCanvasProps.images = this.images;
            }
            this.setState({
              threeCanvasProps: this.threeCanvasProps,
            });
          }
        });
      }
    }

    let toolMenu = null;
    let toolMenuLightControls = null;
    let toolMenuLightButtons = null;
    let toolMenuMaterialControls = null;
    let toolMenuSliders = null;
    let toolMenuLightControlsAmbientIntensity;

    if (this.renderMode) {
      toolMenuLightControlsAmbientIntensity = (
        <RelightAmbientLightIntensity
          id={this.props.relightAmbientLightIntensityID}
          tooltipTitle={
            'Change the ambient light intensity (the incidental light): increasing this can help you to see the colours of the object more clearly'
          }
          intensity={this.state.threeCanvasProps.ambientIntensity}
          onChange={(event, value) => this.onAmbientLightChange(event, value)}
        />
      );
    } else {
      toolMenuLightControlsAmbientIntensity = null;
    }

    if (this.state.active) {
      toolMenuLightButtons = (
        <RelightLightButtons>
          <RelightResetLights
            onClick={() =>
              this.resetHandler(this.props.relightLightDirectionID)
            }
          />
          <RelightLightHelper
            helperOn={this.helperOn}
            onClick={() => this.helperHandler()}
          />
          <RelightRenderMode
            mode={this.renderMode}
            onClick={() => this.renderHandler()}
          />
          <RelightExpandSlidersButton
            drawerOpen={this.state.drawerOpen}
            aspect={this.aspect}
            onClick={() => this.drawerHandler()}
          />
        </RelightLightButtons>
      );

      if (this.renderMode) {
        toolMenuMaterialControls = (
          <>
            <RelightRoughnessIntensity
              id={this.props.relightRoughnessIntensityID}
              tooltipTitle={
                'Change material roughness: change the roughness to model how polished the material is, glass is highly polished (low roughness) and a corroded piece of metal is not (high roughness).'
              }
              intensity={this.state.threeCanvasProps.roughness}
              onChange={(event, value) => this.onRoughnessChange(event, value)}
            />
            <RelightMetalnessIntensity
              id={this.props.relightMetalnessIntensityID}
              tooltipTitle={
                'Change material metalness: change the metalness to model how metalic the material is, generally a metal has a metalness of 1, however I highly corroded metal and a none metal would have a metalness of 0.'
              }
              intensity={this.state.threeCanvasProps.metalness}
              onChange={(event, value) => this.onMetalnessChange(event, value)}
            />
          </>
        );
      } else {
        toolMenuMaterialControls = (
          <>
            <RelightShininessIntensity
              id={this.props.relightShininessIntensityID}
              tooltipTitle={
                'Change the shininess of the object: increasing this can enhance the reflective highlights to bring out more features'
              }
              intensity={this.state.threeCanvasProps.shininess}
              onChange={(event, value) => this.onShininessChange(event, value)}
            />
          </>
        );
      }
      if (this.state.drawerOpen) {
        let sliderStyle = {
          textAlign: 'center',
        };

        if (this.aspect === 'landscape') {
          sliderStyle = {
            textAlign: 'center',
            marginRight: '13px',
          };
        }

        toolMenuSliders = (
          <div style={sliderStyle}>
            <RelightDirectionalLightIntensity
              id={this.props.relightDirectionalLightIntensityID}
              tooltipTitle={
                'Change the directional light intensity (the torch): decreasing this can help you to see more features if the light is over saturated'
              }
              intensity={this.state.threeCanvasProps.directionalIntensity}
              onChange={(event, value) =>
                this.onDirectionalLightChange(event, value)
              }
            />
            {toolMenuLightControlsAmbientIntensity}
            <RelightNormalDepth
              id={this.props.relightNormalDepthID}
              tooltipTitle={
                'Change normal map depth: increasing this exagerates the depth of the details helping to bring out more features'
              }
              normalDepth={this.state.threeCanvasProps.normalDepth}
              onChange={(event, value) =>
                this.onNormalDepthChange(event, value)
              }
            />
            {toolMenuMaterialControls}
          </div>
        );
      } else {
        toolMenuSliders = null;
      }

      toolMenuLightControls = (
        <RelightLightControls aspect={this.aspect}>
          <div
            style={{
              maxWidth: 'fit-content',
              marginInline: 'auto',
            }}
          >
            <RelightLightDirection
              id={this.props.relightLightDirectionID}
              aspect={this.aspect}
              tooltipTitle={
                'Change the directional light direction by dragging your mouse over this control: more raking light can help to reveal hidden details'
              }
              mouseX={this.mouseX} // mouseX isn't a part of this.state.threeCanvasProps...
              mouseY={this.mouseY} // mouseY isn't a part of this.state.threeCanvasProps...
              onMouseMove={(event) =>
                this.onMouseMove(
                  event,
                  this.props.relightLightDirectionID,
                  this.rotation
                )
              }
              onMouseDown={(event) => this.onMouseDown(event)}
              onMouseUp={(event) => this.onMouseUp(event)}
              onMouseLeave={(event) => this.onMouseLeave(event)}
              onTouchMove={(event) =>
                this.onMouseMove(
                  event,
                  this.props.relightLightDirectionID,
                  this.rotation
                )
              }
              rotation={this.rotation}
            />
          </div>
          {toolMenuSliders}
        </RelightLightControls>
      );
    }

    if (this.state.visible && this.state.open) {
      toolMenu = (
        <RelightToolMenu
          id={this.props.relightToolMenuID}
          visible={this.state.visible}
          sideBarOpen={this.props.window.sideBarOpen}
        >
          <RelightMenuButtons id={this.props.relightMenuButtonsID}>
            <RelightMenuButton
              onClick={() => this.menuHandler()}
              open={this.state.open}
            />
            <RelightTorchButton
              id={this.props.relightTorchButtonID}
              onClick={() => this.torchHandler()}
              active={this.state.active}
            />
            {/*<RelightAnnotationButton*/}
            {/*  id={this.props.relightAnnotationButtonID}*/}
            {/*  onClick={() => this.annotationsHandler()}*/}
            {/*  active={this.annotationsOn}*/}
            {/*/>*/}
            <RelightCycleDefaultLayer
              id={this.props.relightCycleDefaultLayerID}
              onClick={() => this.defaultLayerHandler()}
              active={this.state.active}
            />
          </RelightMenuButtons>
          {toolMenuLightButtons}
          {toolMenuLightControls}
        </RelightToolMenu>
      );
    } else if (this.state.visible && !this.state.open) {
      toolMenu = (
        <RelightToolMenu
          id={this.props.relightToolMenuID}
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
  /** The state prop is the Mirador state from the redux store **/
  state: PropTypes.object.isRequired,
  /** The relightLightDirectionID prop is the ID for the control **/
  relightLightDirectionID: PropTypes.string.isRequired,
  /** The relightThreeCanvasID prop is the ID for the control **/
  relightThreeCanvasID: PropTypes.string.isRequired,
  /** The relightAmbientLightIntensityID prop is the ID for the control **/
  relightAmbientLightIntensityID: PropTypes.string.isRequired,
  /** The relightRougnessIntensityID prop is the ID for the control **/
  relightRoughnessIntensityID: PropTypes.string.isRequired,
  /** The relightMetalnessIntensityID prop is the ID for the control **/
  relightMetalnessIntensityID: PropTypes.string.isRequired,
  /** The relightShininessIntensityID prop is the ID for the control **/
  relightShininessIntensityID: PropTypes.string.isRequired,
  /** The relightDirectionalLightIntensityID prop is the ID for the control **/
  relightDirectionalLightIntensityID: PropTypes.string.isRequired,
  /** The relighNormalDepthID prop is the ID for the control **/
  relightNormalDepthID: PropTypes.string.isRequired,
  /** The relightToolMenuID prop is the ID for the control **/
  relightToolMenuID: PropTypes.string.isRequired,
  /** The relightMenuButtonID prop is the ID for the control **/
  relightMenuButtonsID: PropTypes.string.isRequired,
  /** The relightTorchButtonID prop is the ID for the control **/
  relightTorchButtonID: PropTypes.string.isRequired,
  /** The relightAnnotationButtonID prop is the ID for the control **/
  relightAnnotationButtonID: PropTypes.string.isRequired,
  /** The relightCycleDefaultLayerID prop is the ID for the control **/
  relightCycleDefaultLayerID: PropTypes.string.isRequired,
};

export default Relight;
