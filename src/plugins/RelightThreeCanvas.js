import React from 'react';
import * as THREE from 'three';
import PropTypes from 'prop-types';

/**
 * The RelightThreeCanvas component is a Three canvas object containing a scene with orthographic camera, ambient and
 * directional lights, and a series of tiled planes rendering the albedo and normal texture tiles.  The scene will
 * match the image intersection, zoom, and pan of the OpenSeaDragon viewer so that the rendered scene is directly
 * overlaid.  Moving the mouse over the RelightLightDirection component will cause the directional light to change
 * position in the Three scene and therefore change what is being seen in the render thanks to the normal mapping.
 */
class RelightThreeCanvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lightX: this.props.lightX,
      lightY: this.props.lightY,
      directionalIntensity: this.props.directionalIntensity,
      ambientIntensity: this.props.ambientIntensity,
      zoom: this.props.zoom,
      width: this.props.intersection.width,
      height: this.props.intersection.height,
      contentWidth: this.props.contentWidth,
      contentHeight: this.props.contentHeight,
      x: this.props.intersection.x,
      y: this.props.intersection.y,
      topLeft: this.props.intersection.topLeft,
      bottomLeft: this.props.intersection.bottomLeft,
    };
    this.lightDirection = new THREE.Vector3(0.0);
    this.threeResources = {};
    this.groups = {};
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(
        this.state.width * this.state.zoom,
        this.state.height * this.state.zoom
    );

    this.vertexShader = this.props.vertexShader;
    this.fragmentShader = this.props.fragmentShader;

    // define an orthographic camera
    this.camera = new THREE.OrthographicCamera(
        this.props.contentWidth / -2,
        this.props.contentWidth / 2,
        this.props.contentHeight / 2,
        this.props.contentHeight / -2,
        -1,
        1
    );

    this.camera.position.set(0, 0, 1);

    // only show a part of the orthographic camera that matches the zoom and intersection of OpenSeaDragon
    this._cameraOffset(this.camera, this.props);

    for (let i = 1; i < this.props.maxTileLevel + 1; i++) {
      this.threeResources[i] = {};
      this.threeResources[i]['geometries'] = {};
      this.threeResources[i]['materials'] = {};
      this.threeResources[i]['meshes'] = {};
    }

    // define a group so that we can handle all the tiles together
    this.generateTiles();

    this.ambientLight = new THREE.AmbientLight(
        0xffffff,
        this.state.ambientIntensity
    );
    this.directionalLight = new THREE.DirectionalLight(
        0xffffff,
        this.state.directionalIntensity
    );
    this.directionalLight.position.set(0, 0, 1);
    this.directionalLight.castShadow = true;
    this.moveLight();
    this.scene.add(this.camera);
    this.scene.add(this.directionalLight);
    this.scene.add(this.ambientLight);
  }

  generateMaterial(albedo, normal){
    const uniforms = THREE.UniformsUtils.merge([
      THREE.UniformsLib.lights,
      {
        iResolution: {value: new THREE.Vector2(1.0, 1.0)},
        iTime: {type: 'f', value: 0.0},

        texDiffuse: {value: albedo},
        texNormal: {value: normal},

        useDiffuseTexture: {type: 'b', value: true},

        lightPosition: {value: new THREE.Vector3(0.0, 0.0, 10.0).normalize()},
        lightColor: {value: new THREE.Color(1, 1, 1)},


        ambientColor: {value: new THREE.Color(1, 1, 1)},

        lightDirection: {value: new THREE.Vector3(0.0, 0.0, 1.0).normalize()},


        material_param_1: {type: 'f', value: 32.0},// 1.00 - Range (0.0 - 40.0)
        material_param_2: {type: 'f', value: 0.65},// 0.65 - Range (0.0 - 2.0)
        material_param_3: {type: 'f', value: 0.50},// 0.50 - Range (0.0, 1.0)

        material_param_4: {type: 'f', value: 1.00},// 0.50 - Range (0.0, 4.0)

        param_2: {type: 'f', value: 0.95},
        param_3: {type: 'f', value: 0.19},
        param_4: {type: 'f', value: 0.025},
        param_5: {type: 'f', value: 5.0},
        param_6: {type: 'f', value: 0.001},
        param_7: {type: 'f', value: 5.0}
      }
    ]);
    return new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      lights: true,
      name: 'ARCHIOxCustomShader',
      //blending: NoBlending
    })
  }

  /**
   * The _cameraOffset method uses the camera.setViewOffset method provided by Three to only show a part of the camera
   * view by setting an offset in a larger frustum.  This allows us to fake moving things in the scene, when in fact
   * the objects in the scene are static except for the directionalLight.
   * @param {object} camera an object containing an instance of a Three camera.
   * @param {object} props an object containing props passed to RelightThreeCanvas.
   * @private
   */
  _cameraOffset(camera, props) {
    camera.setViewOffset(
        props.contentWidth * props.zoom,
        props.contentHeight * props.zoom,
        props.intersection.x * props.zoom,
        props.intersection.y * props.zoom,
        props.intersection.width * props.zoom,
        props.intersection.height * props.zoom
    );
  }

  /**
   * The updateTextures method updates the textures of the pre-generated meshes, this gets called each time new
   * textures are added.
   * @private
   */
  _updateTextures() {
    // loop through the materials and update with new textures
    for (
        let i = 0;
        i < this.props.tileSets[this.props.tileLevel].albedoTiles.urls.length;
        i++
    ) {
      this.threeResources[this.props.tileLevel]['materials'][
          this.props.tileSets[this.props.tileLevel].albedoTiles.urls[i]
          ].uniforms.texDiffuse.value =
          this.props.images[
              this.props.tileSets[this.props.tileLevel].albedoTiles.urls[i]
              ] || null;
      this.threeResources[this.props.tileLevel]['materials'][
          this.props.tileSets[this.props.tileLevel].albedoTiles.urls[i]
          ].uniforms.texNormal.value =
          this.props.images[
              this.props.tileSets[this.props.tileLevel].normalTiles.urls[i]
              ] || null;

      this.threeResources[this.props.tileLevel]['materials'][
          this.props.tileSets[this.props.tileLevel].albedoTiles.urls[i]
          ].needsUpdate = true;

      this.threeResources[this.props.tileLevel]['meshes'][
          this.props.tileSets[this.props.tileLevel].albedoTiles.urls[i]
          ].visible = !(
          this.threeResources[this.props.tileLevel]['materials'][
              this.props.tileSets[this.props.tileLevel].albedoTiles.urls[i]
              ].map === null ||
          this.threeResources[this.props.tileLevel]['materials'][
              this.props.tileSets[this.props.tileLevel].albedoTiles.urls[i]
              ].normalMap === null
      );
    }
  }

  /**
   * The generateTiles method generates all the geometry we will use in our scene, we pre-build all the geometries,
   * materials, and meshes so that they can be added or removed from the scene, updated when loading in more tiles, and
   * removed when the component is unmounted.  This will only be run onece.  Another helper function will update the
   * textures.
   */
  generateTiles() {
    for (let i = 1; i < this.props.maxTileLevel + 1; i++) {
      this.groups[i] = new THREE.Group();

      for (let j = 0; j < this.props.tileSets[i].albedoTiles.urls.length; j++) {
        const albedoMap =
            this.props.images[this.props.tileSets[i].albedoTiles.urls[j]] || null;
        const normalMap =
            this.props.images[this.props.tileSets[i].normalTiles.urls[j]] || null;

        let plane_material;

        if (albedoMap && normalMap) {
          albedoMap.needsUpdate = true;
          normalMap.needsUpdate = true;
          plane_material = this.generateMaterial(albedoMap, normalMap)
        } else {
          plane_material = this.generateMaterial();
        }
        const x =
            this.props.tileSets[i].albedoTiles.tiles[j].x +
            this.props.tileSets[i].albedoTiles.tiles[j].w / 2;
        const y =
            this.props.tileSets[i].albedoTiles.tiles[j].y +
            this.props.tileSets[i].albedoTiles.tiles[j].h / 2;

        const plane_geometry = new THREE.PlaneGeometry(
            this.props.tileSets[i].albedoTiles.tiles[j].w,
            this.props.tileSets[i].albedoTiles.tiles[j].h
        );

        const mesh = new THREE.Mesh(plane_geometry, plane_material);
        mesh.position.set(x, this.props.intersection.height - y, 0);

        if (!albedoMap && !normalMap) {
          mesh.visible = false;
        }

        // store these items so we can dispose of them correctly later
        this.threeResources[i]['geometries'][
            this.props.tileSets[i].albedoTiles.urls[j]
            ] = plane_geometry;
        this.threeResources[i]['materials'][
            this.props.tileSets[i].albedoTiles.urls[j]
            ] = plane_material;
        this.threeResources[i]['meshes'][
            this.props.tileSets[i].albedoTiles.urls[j]
            ] = mesh;
        this.groups[i].add(mesh);
      }

      new THREE.Box3()
          .setFromObject(this.groups[i])
          .getCenter(this.groups[i].position)
          .multiplyScalar(-1);
      this.scene.add(this.groups[i]);
    }
  }

  /**
   * The animate method requests the next animation frame from itself but updates the renderer and textures each frame.
   */
  animate = () => {
    this.animate_req = requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
    this._updateTextures();
  };

  /**
   * The rerender method resizes the WebGL renderer to follow the intersection and zoom props and changes the camera
   * offsets to keep the OpenSeaDragon intersection matched to that of the Three canvas.
   */
  rerender() {
    this.renderer.setSize(
        this.props.intersection.width * this.props.zoom,
        this.props.intersection.height * this.props.zoom
    );
    this._cameraOffset(this.camera, this.props);
  }

  /**
   * The moveLight method updates the direction the directionalLight is pointing.
   */
  moveLight() {
    let vector = new THREE.Vector3(this.props.lightX, this.props.lightY, 0);
    let dir = vector.sub(this.camera.position).normalize();
    let distance = -this.camera.position.z / dir.z;
    let pos = this.camera.position.clone().add(dir.multiplyScalar(distance));
    this.directionalLight.position.set(pos.x, pos.y, 1);
  }

  /**
   * The componentDidMount method is a standard React class method that is used to run other methods when the
   * component is mounted.  Here we use it to apply the WebGL to the canvas-container html element and initiate
   * animation.
   */
  componentDidMount() {
    document
        .getElementById('canvas-container')
        .appendChild(this.renderer.domElement);
    this.animate();
  }

  /**
   * The componentDidUpdate method is a standard React class method that is used to run other methods whenever state or
   * props are updated.  Here we use it to change the part of the tiled mesh being shown on screen, the tile level of
   * the tile mesh,  and the light direction and intensities being used in the scene.
   * @param prevProps the previous props sent to the Relight component
   * @param prevState the previous state set in the Relight component
   * @param snapshot a snapshot of the component before the next render cycle, you can use the React class method
   * getSnapShotBeforeUpdate to create this
   */
  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
        prevProps.tileLevel !== this.props.tileLevel ||
        prevProps.images.length !== this.props.images.length
    ) {
      this.groups[this.props.tileLevel].visible = true;
    }

    if (
        prevProps.zoom !== this.props.zoom ||
        prevProps.intersection !== this.props.intersection ||
        prevProps.lightX !== this.props.lightX ||
        prevProps.lightY !== this.props.lightY ||
        prevProps.directionalIntensity !== this.props.directionalIntensity ||
        prevProps.ambientIntensity !== this.props.ambientIntensity
    ) {
      this.ambientLight.intensity = this.props.ambientIntensity;
      this.directionalLight.intensity = this.props.directionalIntensity;
      this.moveLight();
      this.rerender();
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * The componentWillUnmount method is a standard React class method that we use here to call other methods when the
   * component is unmounted.  Here we use it to cancel our animation when the RelightTorchButton is toggled off and
   * the RelightThreeOverlay is removed.
   */
  componentWillUnmount() {
    cancelAnimationFrame(this.animate_req);
  }

  /**
   * Render the RelightThreeCanvas component
   * @returns {JSX.Element}
   */
  render() {
    const container = {
      position: 'relative',
    };
    const canvas = {
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: '0',
      left: '0',
    };
    return (
        <div id="container" style={container}>
          <div id="canvas-container" style={canvas} />
        </div>
    );
  }
}

RelightThreeCanvas.propTypes = {
  /** The contentWidth prop is the total width of the OpenSeaDragon tiled image **/
  contentWidth: PropTypes.number.isRequired,
  /** The contentHeight prop is the total height of the OpenSeaDragon tiled image **/
  contentHeight: PropTypes.number.isRequired,
  /** The tileLevel prop is the current tile level that is being rendered in OpenSeaDragon **/
  tileLevel: PropTypes.number.isRequired,
  /** The maxTileLevel prop is the maximum possible tile level achievable in the IIIF manifest **/
  maxTileLevel: PropTypes.number.isRequired,
  /** The lightX prop is the mapping of mouseX over the RelightLightDirection component **/
  lightX: PropTypes.number.isRequired,
  /** The lightY prop is the mapping of mouseY over the RelightLightDirection component **/
  lightY: PropTypes.number.isRequired,
  /** The zoom prop is the current OpenSeaDragon zoom ratio **/
  zoom: PropTypes.number.isRequired,
  /** The ambientIntensity prop is the current value set in the RelightAmbientLightIntensity control **/
  ambientIntensity: PropTypes.number.isRequired,
  /** The directionalIntensity prop is the current value set in the RelightDirectionalLightIntensity control **/
  directionalIntensity: PropTypes.number.isRequired,
  /** The intersection prop is the descriptor of the current OpenSeaDragon image intersection on screen **/
  intersection: PropTypes.shape({
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    topLeft: PropTypes.number.isRequired,
    bottomLeft: PropTypes.number.isRequired,
  }).isRequired,
  /** The images prop is an array of all the required tile images that have been loaded from OpenSeaDragon **/
  images: PropTypes.arrayOf(THREE.Texture.type).isRequired,
  /** The tileSets prop is an array of all the albedo/normal tile levels, image tile dimensions, and tile image urls **/
  tileSets: PropTypes.arrayOf(PropTypes.any).isRequired,
  /** The fragmentShader prop is a string containing glsl shader code for a fragment shader **/
  fragmentShader: PropTypes.string,
  /** The vertexShader prop is a string containing glsl shader code for a vertex shader **/
  vertexShader: PropTypes.string,
};

export default RelightThreeCanvas;
