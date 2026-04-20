import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import * as THREE from 'three';
import {
  updateLayer,
  getMaps,
  getMap,
  getRendererInstructions,
  getTileSets,
} from './RelightHelpers';
import RelightNormalDepth from './RelightNormalDepth';
import RelightAmbientLightIntensity from './RelightAmbientLightIntensity';
import RelightDirectionalLightIntensity from './RelightDirectionalLightIntensity';
import RelightLightDirection from './RelightLightDirection';
import RelightToolMenu from './RelightToolMenu';
import RelightResetLights from './RelightResetLights';
import RelightLightButtons from './RelightLightButtons';
import RelightTorchButton from './RelightTorchButton';
import RelightExpandSlidersButton from './RelightExpandSlidersButton';
import RelightThreeOverlay from './RelightThreeOverlay';
import RelightMenuButton from './RelightMenuButton';
import RelightMenuButtons from './RelightMenuButtons';
import RelightLightHelper from './RelightLightHelper';
import RelightRenderMode from './RelightRenderMode';
import RelightLayersMenuButton from './RelightLayersMenuButton';
import RelightShininessIntensity from './RelightShininessIntensity';
import RelightMetalnessIntensity from './RelightMetalnessIntensity';
import RelightRoughnessIntensity from './RelightRoughnessIntensity';
import RelightSnapshotButton from './RelightSnapshotButton';
import './public/styles.css';
import RelightHelpButton from './RelightHelpButton';
import RelightHelpDialog from './RelightHelpDialog';
import RelightLayersMenu from './RelightLayersMenu';
import RelightDownloadCurrentLayerButton from './RelightDownloadCurrentLayerButton';
import RelightDraggableLightButton from './RelightDraggableLightButton';

/**
 * The Relight component is the parent group of the plug-in that is inserted into the Mirador viewer as a tool menu.
 * It is composed of a group of buttons and a group of controls that make up the relighting plug-in.
 * */
class Relight extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      flipped: false,
      open: this.props.window.archioxPluginOpen || false,
      drawerOpen: true,
      loadHandlerAdded: false,
      threeCanvasProps: {},
      helpOn: false,
      layersOpen: false,
      isOver: false,
      isDragging: false,
      showRelightDraggableLightButton:
        this.props.window.showRelightDraggableLightButton || false,
    };
    this.threeCanvasProps = {};
    this.mouseDown = false;
    this.mouseX = 50;
    this.mouseY = 50;
    this.moveX = 50;
    this.moveY = 50;
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
    this.helpOn = false;
    this.renderMode = true;
    this.albedoInfo = {};
    this.loaded = false;
    this.visible = false;
    this.mouseMoving = false;
    this.draggableWidth = null;
    this.draggableHeight = null;

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
   * @param {event} event – event being emitted when the mouse moves over the RelightLightDirection component.
   * @param {number} id – ID of the RelightLightDirection component.
   * @param {number} rotation - number of degrees the OpenSeaDragon canvas has been rotated.
   * */
  onMouseMove(event, id, rotation) {
    const lightDirectionControl = document.getElementById(id);
    const boundingBox = lightDirectionControl.getBoundingClientRect();

    if (event.type === 'mousemove' && this.mouseDown) {
      this.mouseMoving = true;
      this.threeCanvasProps.mouseMoving = this.mouseMoving;
      event.preventDefault();
      this.moveX = event.clientX - boundingBox.left;
      this.moveY = event.clientY - boundingBox.top;
    } else if (event.type === 'touchmove') {
      this.mouseDown = true;
      this.mouseMoving = true;
      this.threeCanvasProps.mouseMoving = this.mouseMoving;
      this.moveX = event.touches[0].clientX - boundingBox.left;
      this.moveY = event.touches[0].clientY - boundingBox.top;
    } else {
      this.mouseMoving = false;
      this.threeCanvasProps.mouseMoving = this.mouseMoving;
    }

    // rotation is the total degrees the canvas has rotated, i.e. it stacks, we need to get this back
    // to a relative number by using modulus...
    const rotationModulus = rotation % 360;

    if (this.mouseDown) {
      switch (rotationModulus) {
        case 0:
          this.mouseX = this.moveX;
          this.mouseY = this.moveY;
          this.lightX = (this.mouseX / 100) * 2 - 1;
          this.lightY = (this.mouseY / 100) * 2 - 1;
          this.lightX = this.flipped ? -this.lightX : this.lightX;
          break;
        case -270:
        case 90:
          this.mouseX = this.moveY;
          this.mouseY = this.moveX;
          this.lightX = (this.mouseX / 100) * 2 - 1;
          this.lightY = -((this.mouseY / 100) * 2 - 1);
          this.lightY = this.flipped ? -this.lightY : this.lightY;
          break;
        case -180:
        case 180:
          this.mouseX = this.moveX;
          this.mouseY = this.moveY;
          this.lightX = -((this.mouseX / 100) * 2 - 1);
          this.lightY = -((this.mouseY / 100) * 2 - 1);
          this.lightX = this.flipped ? -this.lightX : this.lightX;
          break;
        case -90:
        case 270:
          this.mouseX = this.moveY;
          this.mouseY = this.moveX;
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
   * @param  {string} id ID of the RelightLightDirection component to be reset.
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
    this.moveX = 50;
    this.moveY = 50;

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
    this.threeCanvasProps.rotation = this.rotation;
    this.threeCanvasProps.mouseMoving = this.mouseMoving;
    this.threeCanvasProps.viewer = this.props.viewer;
    this.threeCanvasProps.helperOn = this.helperOn;
    this.threeCanvasProps.renderMode = this.renderMode;
    this.threeCanvasProps.rendererInstructions = getRendererInstructions(
      this.props
    );
    this.threeCanvasProps.id = this.props.relightThreeCanvasID;
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
   * The updateThreeCanvasProps method is used by the viewport-change event handler to keep the overlay dimensions and
   * Three camera view in sync with OpenSeaDragon and make sure the updated Three textures are sent to Three canvas.
   */
  updateThreeCanvasProps() {
    this.threeCanvasProps.renderMode = this.renderMode;
    this.threeCanvasProps.rotation = this.rotation;
    this.threeCanvasProps.mouseMoving = this.mouseMoving;
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
   * The renderHandler method when called will toggle the boolean value of this.renderMode. The renderMode boolean value
   * controls what material the three.js canvas overlay is currently using.
   **/
  renderHandler() {
    this.renderMode = !this.renderMode;

    if (!this.renderMode) {
      this.normalDepth = 10.0;
    } else {
      this.normalDepth = 1.0;
    }

    this.updateOverlay();
  }

  /**
   * The defaultLayerHandler method when called will reset the visibility of all layers, get the current layers out
   * of the Mirador state storage, shuffle their index order by one and put them back causing Mirador to change the
   * current choices layer being rendered on top of the stack.  A user can use Miradors inbuilt functions to change
   * the order of the choices layers, and this function will preserve that order when shuffling.
   **/
  defaultLayerHandler() {
    this.setState((prevState) => ({ layersOpen: !prevState.layersOpen }));
  }

  /**
   * The drawerHandler method when called will get the state of drawerOpen and toggle it.
   * **/
  drawerHandler() {
    this.setState((prevState) => ({ drawerOpen: !prevState.drawerOpen }));
  }

  /**
   * The disposeTextures method when called will empty the loaded images from memory.
   * @param {object} images the image tiles currently loaded as threejs textures in memory.
   * **/
  disposeTextures(images) {
    for (const key in images) {
      if (images[key] instanceof THREE.Texture) {
        images[key].dispose();
        delete images[key];
      }
    }
  }

  /**
   * The snapshotButtonHandler method is called when the RelightSnapshotButton is pressed, it grabs the Threejs canvas
   * and downloads the render that is currently on screen.
   * @param {string} manifestTitle the title of the current manifest loaded in the Mirador window instance.
   * **/
  snapshotButtonHandler(manifestTitle) {
    const canvas = document.querySelector('#container div canvas');
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    // todo: put in more meaningful file name here...
    link.download =
      manifestTitle.replace(/\s+/g, '-') + '_live_render_region.jpg';
    link.click();
  }

  /**
   * The helpOpenHandler method sets the helpOn value in state to true.
   * **/
  helpOpenHandler() {
    this.setState({ helpOn: true });
  }

  /**
   * The helpCloseHandler method sets the helpOn value in state to false.
   * **/
  helpCloseHandler() {
    this.setState({ helpOn: false });
  }

  /**
   * The resizeHandler method sets the state of drawerOpen to true if the window innerWidth is greater than 768px.
   * **/
  resizeHandler() {
    const isNowWide = window.innerWidth > 768;
    if (isNowWide) {
      this.setState({ drawerOpen: true });
    }
  }

  onDraggableLightButtonDragHandler(event) {
    this.mouseMoving = true;
    this.threeCanvasProps.mouseMoving = this.mouseMoving;
    const rotationModulus = this.rotation % 360;

    switch (rotationModulus) {
      case 0:
        this.mouseX = event.clientX - this.osdCanvasBoundingClientRect.left;
        this.mouseY = event.clientY - this.osdCanvasBoundingClientRect.top;
        this.lightX =
          (this.mouseX / this.osdCanvasBoundingClientRect.width) * 2 - 1;
        this.lightY =
          (this.mouseY / this.osdCanvasBoundingClientRect.height) * 2 - 1;
        this.lightX = this.flipped ? -this.lightX : this.lightX;
        break;
      case -270:
      case 90:
        this.mouseX = event.clientY - this.osdCanvasBoundingClientRect.top;
        this.mouseY = event.clientX - this.osdCanvasBoundingClientRect.left;
        this.lightX =
          (this.mouseX / this.osdCanvasBoundingClientRect.height) * 2 - 1;
        this.lightY = -(
          (this.mouseY / this.osdCanvasBoundingClientRect.width) * 2 -
          1
        );
        this.lightY = this.flipped ? -this.lightY : this.lightY;
        break;
      case -180:
      case 180:
        this.mouseX = event.clientX - this.osdCanvasBoundingClientRect.left;
        this.mouseY = event.clientY - this.osdCanvasBoundingClientRect.top;
        this.lightX = -(
          (this.mouseX / this.osdCanvasBoundingClientRect.width) * 2 -
          1
        );
        this.lightY = -(
          (this.mouseY / this.osdCanvasBoundingClientRect.height) * 2 -
          1
        );
        this.lightX = this.flipped ? -this.lightX : this.lightX;
        break;
      case -90:
      case 270:
        this.mouseX = event.clientY - this.osdCanvasBoundingClientRect.top;
        this.mouseY = event.clientX - this.osdCanvasBoundingClientRect.left;
        this.lightX = -(
          (this.mouseX / this.osdCanvasBoundingClientRect.height) * 2 -
          1
        );
        this.lightY =
          (this.mouseY / this.osdCanvasBoundingClientRect.width) * 2 - 1;
        this.lightY = this.flipped ? -this.lightY : this.lightY;
    }

    this.threeCanvasProps.lightX = this.lightX;
    this.threeCanvasProps.lightY = this.lightY;
    this.setState({
      threeCanvasProps: this.threeCanvasProps,
    });
    this.setState({ isDragging: true });
  }

  onDraggableLightButtonStopHandler() {
    this.mouseMoving = false;
    this.setState({ isDragging: false });
  }

  onDraggableLightButtonMouseOverHandler() {
    this.setState({ isOver: true });
  }

  onDraggableLightButtonMouseLeaveHandler() {
    this.setState({ isOver: false });
  }

  /**
   * The componentDidUpdate method is a standard React class method that is used to run other methods whenever state or
   * props are updated.  Here we used it to re-render the overlay if there is a change in state detected.
   * @param prevProps the previous props sent to the Relight component
   * @param prevState the previous state set in the Relight component
   * @param snapshot a snapshot of the component before the next render cycle, you can use the React class method
   * getSnapShotBeforeUpdate to create this
   **/
  //  track of values stored in state and if they change if runs
  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, _prevState, _snapshot) {
    this.state.active
      ? ReactDOM.render(
          <RelightThreeOverlay threeCanvasProps={this.threeCanvasProps} />,
          this.threeCanvas
        )
      : null;
  }

  /**
   * The componentDidMount method is a standard React class method that is used to run other methods whenever the
   * component has mounted. Here we use it to add an event listener for window resizing.
   **/
  componentDidMount() {
    window.addEventListener('resize', () => this.resizeHandler());
  }

  /**
   * The componentWillUnmount method is a standard React class method that is used to run other methods whenever the
   * component is about to be unmounted.  Here we use it to dispose of the textures so the memory they occupy can be
   * re-used and remove an event listner for window resizing.
   */
  componentWillUnmount() {
    window.removeEventListener('resize', () => this.resizeHandler());
    this.disposeTextures(this.images);
  }

  /**
   * Render the Relight component and all it's children, here we have a custom OpenSeaDragon event handler that allows
   * us to capture the tile images and make textures from them.
   * @returns {JSX.Element}
   */
  render() {
    // if the canvas object is available then grab define the albedo and normal maps and set them to state
    if (typeof this.props.canvas !== 'undefined' && !this.visible) {
      this.albedoMap = getMap(this.props.canvas.iiifImageResources, 'albedo');
      this.normalMap = getMap(this.props.canvas.iiifImageResources, 'normal');
      // if albedo or normal maps are not present set visible to false, this will prevent the plug-in from
      // rendering at all, which is what we want.
      if (
        typeof this.albedoMap !== 'undefined' &&
        typeof this.normalMap !== 'undefined' &&
        !this.visible
      ) {
        this.visible = true;
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
      if (!this.loaded && !this.state.loadHandlerAdded) {
        this.loaded = true;
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

        // disable click to zoom
        //this.props.viewer.zoomPerClick = 1;
        // disable mouseNav

        //this.props.viewer.set;

        // add a rotate event handler
        this.props.viewer.addHandler('rotate', (event) => {
          this.rotation = event.degrees;
          this.threeCanvasProps.rotation = this.rotation;
        });

        // add a flip event handler
        this.props.viewer.addHandler('flip', (event) => {
          this.flipped = event.flipped;
          this.setState({ flipped: this.flipped });
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
          this.visible = false;
          this.setState({ active: false });
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
    const osdCanvasBounds = document.querySelector('.openseadragon-canvas'); //.getBoundingClientRect()

    if (osdCanvasBounds) {
      this.osdCanvasBoundingClientRect =
        osdCanvasBounds.getBoundingClientRect();
      // draggableWidth bound will change depending on if the sidebar is open...
      this.draggableWidth = this.props.state.windows[this.props.windowId]
        .sideBarOpen
        ? this.osdCanvasBoundingClientRect.width - 45 // 48 + 24
        : this.osdCanvasBoundingClientRect.width - 16;
      this.draggableHeight = this.osdCanvasBoundingClientRect.height - 142; // might need to figure out how to exactly calculate these offsets
    }

    let toolMenu = null;
    let toolMenuLightControls = null;
    let toolMenuLightButtons = null;
    let toolMenuMaterialControls = null;
    let toolMenuSliders = null;
    let toolMenuLayersMenu = null;
    let toolMenuLightControlsAmbientIntensity;

    if (this.renderMode) {
      toolMenuLightControlsAmbientIntensity = (
        <RelightAmbientLightIntensity
          id={this.props.relightAmbientLightIntensityID}
          tooltipTitle={'Change ambient light intensity'}
          intensity={this.state.threeCanvasProps.ambientIntensity}
          onChange={(event, value) => this.onAmbientLightChange(event, value)}
        />
      );
    } else {
      toolMenuLightControlsAmbientIntensity = null;
    }

    if (this.state.layersOpen) {
      toolMenuLayersMenu = (
        <>
          <RelightLayersMenu
            id={this.props.relightLayersMenuID}
            choices={this.props.canvas.iiifImageResources}
            windowId={this.props.windowId}
            canvasId={this.canvasId}
            updateLayers={this.props.updateLayers}
            state={this.props.state}
            canvas={this.props.canvas}
          />
        </>
      );
    } else {
      toolMenuLayersMenu = null;
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
          <RelightHelpButton
            id={this.props.relightHelpButtonID}
            onClick={() => this.helpOpenHandler()}
          />
          <RelightHelpDialog
            id={this.props.relightHelpDialogID}
            helpOn={this.state.helpOn}
            onClose={() => this.helpCloseHandler()}
          />
          <RelightExpandSlidersButton
            drawerOpen={this.state.drawerOpen}
            onClick={() => this.drawerHandler()}
          />
          <RelightDraggableLightButton
            threeCanvasId={this.threeCanvas.id}
            onDrag={(event) => this.onDraggableLightButtonDragHandler(event)}
            onStop={() => this.onDraggableLightButtonStopHandler()}
            onMouseOver={() => this.onDraggableLightButtonMouseOverHandler()}
            onMouseLeave={() => this.onDraggableLightButtonMouseLeaveHandler()}
            isDragging={this.state.isDragging}
            isOver={this.state.isOver}
            isVisible={this.state.showRelightDraggableLightButton}
          />
        </RelightLightButtons>
      );

      if (this.renderMode) {
        toolMenuMaterialControls = (
          <>
            <RelightRoughnessIntensity
              id={this.props.relightRoughnessIntensityID}
              tooltipTitle={'Change object roughness'}
              intensity={this.state.threeCanvasProps.roughness}
              onChange={(event, value) => this.onRoughnessChange(event, value)}
            />
            <RelightMetalnessIntensity
              id={this.props.relightMetalnessIntensityID}
              tooltipTitle={'Change object metalness'}
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
              tooltipTitle={'Change object shininess'}
              intensity={this.state.threeCanvasProps.shininess}
              onChange={(event, value) => this.onShininessChange(event, value)}
            />
          </>
        );
      }
      if (this.state.drawerOpen) {
        toolMenuSliders = (
          <div className="relightLightSliders">
            <RelightDirectionalLightIntensity
              id={this.props.relightDirectionalLightIntensityID}
              tooltipTitle={'Change directional light intensity'}
              intensity={this.state.threeCanvasProps.directionalIntensity}
              onChange={(event, value) =>
                this.onDirectionalLightChange(event, value)
              }
            />
            {toolMenuLightControlsAmbientIntensity}
            <RelightNormalDepth
              id={this.props.relightNormalDepthID}
              tooltipTitle={'Change normal depth'}
              normalDepth={this.normalDepth}
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
        <>
          <RelightLightDirection
            id={this.props.relightLightDirectionID}
            tooltipTitle={'Move directional light trackball'}
            moveX={this.moveX}
            moveY={this.moveY}
            mouseX={this.mouseX} // mouseX isn't a part of this.state.threeCanvasProps...
            mouseY={this.mouseY} // mouseY isn't a part of this.state.threeCanvasProps...
            flipped={this.state.flipped}
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
          >
            {toolMenuSliders}
          </RelightLightDirection>
          {toolMenuLightButtons}
        </>
      );
    } else if (this.state.layersOpen) {
      toolMenuLightControls = (
        <>
          {toolMenuLayersMenu}
          <div className="relightLayersMenuHelp">
            <RelightHelpButton
              id={this.props.relightHelpButtonID}
              onClick={() => this.helpOpenHandler()}
            />
            <RelightHelpDialog
              id={this.props.relightHelpDialogID}
              helpOn={this.state.helpOn}
              onClose={() => this.helpCloseHandler()}
            />
            <RelightDownloadCurrentLayerButton
              id={this.props.relightDownloadCurrentLayerButtonID}
              choices={this.props.canvas.iiifImageResources}
              manifestTitle={this.props.manifestTitle}
              state={this.props.state}
              windowId={this.props.windowId}
              canvasId={this.canvasId}
            />
          </div>
        </>
      );
    }

    if (this.visible && this.state.open) {
      toolMenu = (
        <RelightToolMenu
          id={this.props.relightToolMenuID}
          visible={this.visible}
          sideBarOpen={this.props.window.sideBarOpen}
        >
          <RelightMenuButtons
            id={this.props.relightMenuButtonsID}
            active={this.state.active}
          >
            <RelightMenuButton
              onClick={() => this.menuHandler()}
              open={this.state.open}
            />
            <RelightTorchButton
              id={this.props.relightTorchButtonID}
              onClick={() => this.torchHandler()}
              active={this.state.active}
            />
            <RelightLayersMenuButton
              id={this.props.relightLayersMenuButtonID}
              onClick={() => this.defaultLayerHandler()}
              active={this.state.active}
              layersOpen={this.state.layersOpen}
            />
            <RelightSnapshotButton
              id={this.props.relightSnapshotButtonID}
              onClick={() =>
                this.snapshotButtonHandler(this.props.manifestTitle)
              }
              active={this.state.active}
            />
            <div className="relightLabel">2.5D</div>
          </RelightMenuButtons>
          {toolMenuLightControls}
        </RelightToolMenu>
      );
    } else if (this.visible && !this.state.open) {
      toolMenu = (
        <RelightToolMenu
          id={this.props.relightToolMenuID}
          visible={this.visible}
          sideBarOpen={this.props.window.sideBarOpen}
        >
          <RelightMenuButton
            open={this.state.open}
            onClick={() => this.menuHandler()}
          />
        </RelightToolMenu>
      );
    } else if (!this.visible) {
      toolMenu = null;
    }
    return (
      <>
        {toolMenu}
        <div
          className="draggable-container"
          style={{
            height: this.draggableHeight ? this.draggableHeight + 'px' : 0,
            width: this.draggableWidth ? this.draggableWidth + 'px' : 0,
          }}
        ></div>
      </>
    );
  }
}

Relight.propTypes = {
  /** The onClick prop is a method passed to clickable child components to handle the click event **/
  onClick: PropTypes.func,
  /** The ambientIntensity prop is the intensity level currently set for the ambient light source **/
  ambientIntensity: PropTypes.number,
  /** The updateLayers prop is the Mirador updateLayers action to be able to set the state of layer objects **/
  updateLayers: PropTypes.func,
  /** The windowId prop is the Mirador window ID of the current instance of Mirador **/
  windowId: PropTypes.string,
  /** The viewer prop is the OpenSeaDragon viewer instance in the current instance of Mirador **/
  viewer: PropTypes.object,
  /** The window prop is the Mirador window instance in the current instance of Mirador **/
  window: PropTypes.object,
  /** The canvas prop is the Mirador canvas instance in the current instance of Mirador **/
  canvas: PropTypes.object,
  /** The state prop is the Mirador state from the redux store **/
  state: PropTypes.object,
  /** The relightLightDirectionID prop is the ID for the control **/
  relightLightDirectionID: PropTypes.string,
  /** The relightThreeCanvasID prop is the ID for the control **/
  relightThreeCanvasID: PropTypes.string,
  /** The relightAmbientLightIntensityID prop is the ID for the control **/
  relightAmbientLightIntensityID: PropTypes.string,
  /** The relightRougnessIntensityID prop is the ID for the control **/
  relightRoughnessIntensityID: PropTypes.string,
  /** The relightMetalnessIntensityID prop is the ID for the control **/
  relightMetalnessIntensityID: PropTypes.string,
  /** The relightShininessIntensityID prop is the ID for the control **/
  relightShininessIntensityID: PropTypes.string,
  /** The relightDirectionalLightIntensityID prop is the ID for the control **/
  relightDirectionalLightIntensityID: PropTypes.string,
  /** The relighNormalDepthID prop is the ID for the control **/
  relightNormalDepthID: PropTypes.string,
  /** The relightToolMenuID prop is the ID for the control **/
  relightToolMenuID: PropTypes.string,
  /** The relightMenuButtonsID prop is the ID for the control **/
  relightMenuButtonsID: PropTypes.string,
  /** The relightTorchButtonID prop is the ID for the control **/
  relightTorchButtonID: PropTypes.string,
  /** The relightAnnotationButtonID prop is the ID for the control **/
  relightAnnotationButtonID: PropTypes.string,
  /** The relightLayersMenuID prop is the ID for the control **/
  relightLayersMenuID: PropTypes.string,
  /** The relightLayersMenuButtonID prop is the ID for the control **/
  relightLayersMenuButtonID: PropTypes.string,
  /** The relightSnapshotButtonID prop is the ID for the control **/
  relightSnapshotButtonID: PropTypes.string,
  /** The relightHelpButtonID prop is the ID for the control **/
  relightHelpButtonID: PropTypes.string,
  /** The relightHelpDialogID prop is the ID for the control **/
  relightHelpDialogID: PropTypes.string,
  /** The relightDownloadCurrentLayerButtonID prop is the ID for the control **/
  relightDownloadCurrentLayerButtonID: PropTypes.string,
  /** The manifestTitle prop is the title of the manifest loaded into the current Mirador window instance **/
  manifestTitle: PropTypes.string,
  /** The showRelightDraggableLightButton prop controls if RelightDraggableLightButton is visible or not **/
  showRelightDraggableLightButton: PropTypes.bool,
};

export default Relight;
