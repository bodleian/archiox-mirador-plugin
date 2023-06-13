import React from 'react';
import * as THREE from 'three';
import PropTypes from 'prop-types';

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
    this.threeResources = {};
    this.groups = {};
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(
      this.state.width * this.state.zoom,
      this.state.height * this.state.zoom
    );

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
    this._camera_offset(this.camera, this.props);

    // this is a cube to help with debugging
    // this.cubeGeometry = new THREE.CircleGeometry(100, 100);
    // this.cubeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.5, depthTest: false});
    // this.cube = new THREE.Mesh(this.cubeGeometry, this.cubeMaterial);
    // this.cube.position.set(0, 0, 0);
    // this.scene.add(this.cube);

    // this is a grid to help with debugging
    // this.divisions = 10;
    // this.size = 40000;
    // this.gridHelper = new THREE.GridHelper(this.size, this.divisions, 0xffffff, 0xffffff);
    // this.gridHelper.rotation.x=Math.PI/2;
    // this.gridHelper.position.set(0, 0, 0);
    // this.scene.add(this.gridHelper);

    for (let i = 1; i < this.props.maxTileLevel + 1; i++) {
      this.threeResources[i] = {};
      this.threeResources[i]['geometries'] = {};
      this.threeResources[i]['materials'] = {};
      this.threeResources[i]['meshes'] = {};
    }

    // define a group so we can handle all the tiles together
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

  _camera_offset(camera, props) {
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
   * Here we will update the textures of the pre-generated meshes, this gets called each time new textures are added
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
      ].map =
        this.props.images[
          this.props.tileSets[this.props.tileLevel].albedoTiles.urls[i]
        ] || null;
      this.threeResources[this.props.tileLevel]['materials'][
        this.props.tileSets[this.props.tileLevel].albedoTiles.urls[i]
      ].normalMap =
        this.props.images[
          this.props.tileSets[this.props.tileLevel].normalTiles.urls[i]
        ] || null;
      this.threeResources[this.props.tileLevel]['materials'][
        this.props.tileSets[this.props.tileLevel].albedoTiles.urls[i]
      ].needsUpdate = true;

      if (
        this.threeResources[this.props.tileLevel]['materials'][
          this.props.tileSets[this.props.tileLevel].albedoTiles.urls[i]
        ].map === null ||
        this.threeResources[this.props.tileLevel]['materials'][
          this.props.tileSets[this.props.tileLevel].albedoTiles.urls[i]
        ].normalMap === null
      ) {
        this.threeResources[this.props.tileLevel]['meshes'][
          this.props.tileSets[this.props.tileLevel].albedoTiles.urls[i]
        ].visible = false;
      } else {
        this.threeResources[this.props.tileLevel]['meshes'][
          this.props.tileSets[this.props.tileLevel].albedoTiles.urls[i]
        ].visible = true;
      }
    }
  }

  /**
   * Here we generate all the geometry we will use in our scene, we pre-build all the geometreis, materials, and
   * meshes so they can be added or removed to the scene, updated when loading in more tiles, and removed when the
   * component is unmounted.  This will only be run onece.  Another helper function will update the textures.
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
          plane_material = new THREE.MeshPhongMaterial({
            map: albedoMap,
            normalMap: normalMap,
            flatShading: true,
            normalScale: new THREE.Vector3(1, 1),
          });
        } else {
          plane_material = new THREE.MeshPhongMaterial();
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

  animate() {
    this.animate_req = requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
    this._updateTextures();
  }

  rerender() {
    this.renderer.setSize(
      this.props.intersection.width * this.props.zoom,
      this.props.intersection.height * this.props.zoom
    );
    this._camera_offset(this.camera, this.props);
  }

  moveLight() {
    let vector = new THREE.Vector3(this.props.lightX, this.props.lightY, 0);
    let dir = vector.sub(this.camera.position).normalize();
    let distance = -this.camera.position.z / dir.z;
    let pos = this.camera.position.clone().add(dir.multiplyScalar(distance));
    this.directionalLight.position.set(pos.x, pos.y, 1);
  }

  componentDidMount() {
    document
      .getElementById('canvas-container')
      .appendChild(this.renderer.domElement);
    this.animate();
  }

  componentDidUpdate(prevProps) {
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

  componentWillUnmount() {
    cancelAnimationFrame(this.animate_req);
  }

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
  contentWidth: PropTypes.number.isRequired,
  contentHeight: PropTypes.number.isRequired,
  tileLevel: PropTypes.number.isRequired,
  maxTileLevel: PropTypes.number.isRequired,
  lightX: PropTypes.number.isRequired,
  lightY: PropTypes.number.isRequired,
  zoom: PropTypes.number.isRequired,
  ambientIntensity: PropTypes.number.isRequired,
  directionalIntensity: PropTypes.number.isRequired,
  intersection: PropTypes.shape({
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    topLeft: PropTypes.number.isRequired,
    bottomLeft: PropTypes.number.isRequired,
  }).isRequired,
  images: PropTypes.arrayOf(THREE.Texture.type).isRequired,
  tileSets: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default RelightThreeCanvas;
