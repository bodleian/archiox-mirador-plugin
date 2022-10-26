import React from "react";
import * as THREE from "three";
import {BallTriangle} from "react-loader-spinner";

function  onMouseMove(event, props) {
    event.preventDefault();
    let x = (event.clientX / window.innerWidth) * 2 - 1;
    let y = -(event.clientY / window.innerHeight) * 2 + 1;
    let vector = new THREE.Vector3(x, y, 0);
    let dir = vector.sub(props.camera.position).normalize();
    let distance = -props.camera.position.z / dir.z;
    let pos = props.camera.position.clone().add(dir.multiplyScalar(distance));
    props.directionalLight.position.set(pos.x, pos.y, 0.5);
}

function Loader(props) {
    const container = {
        position: "relative"
    }
    const canvas = {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: "0",
        left: "0"
    }
    const overlay = {
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        width: props.width,
        height: props.height,
        position: "absolute",
        top: "0",
        left: "0",
        zIndex: "2",
        backgroundColor: "black"
    }

    return (
        <div id="container" style={container}>
            <div id="loading-overlay" style={overlay}>
                <BallTriangle
                    height="100"
                    width="100"
                    color="grey"
                    ariaLabel="loading-indicator"
                />
            </div>
            <div
                id="canvas-container"
                style={canvas}
                onMouseMove={(e) => onMouseMove(e, props)}
            />
        </div>
    );
}

function _camera_offset(camera, props) {
    camera.setViewOffset(
        props.contentWidth * props.zoom,
        props.contentHeight * props.zoom,
        props.x * props.zoom,
        props.y * props.zoom,
        props.width * props.zoom,
        props.height * props.zoom
    )
}

class ThreeCanvas extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            tiles: this.props.tiles,
            zoom: this.props.zoom,
            width: this.props.width,
            height: this.props.height,
            contentWidth: this.props.contentWidth,
            contentHeight: this.props.contentHeight,
            x: this.props.x,
            y: this.props.y,
            topLeft: this.props.topLeft,
            bottomLeft: this.props.bottomLeft,
            diffusemap: this.props.diffusemap,
            normalmap: this.props.normalmap
        }

        this.manager = new THREE.LoadingManager();

        this.manager.onLoad = () => {
            this.onTexturesLoaded();
        }

        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({alpha: false});
        this.renderer.setSize(
            this.props.width * this.props.zoom,
            this.props.height * this.props.zoom
        );

        // define an orthographic camera
        this.camera = new THREE.OrthographicCamera(
          (this.props.contentWidth) / -2,
            (this.props.contentWidth) / 2,
            (this.props.contentHeight) / 2,
            (this.props.contentHeight) /-2,
            -1,
            1
        );

        this.camera.position.set(
            0 ,
            0,
            1
        )

        // offset the camera view, still an issue here when re-starting from a non standard location!
        _camera_offset(this.camera, this.props)

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

        // define a group so we can handle all the tiles together
        this.group = new THREE.Group();

        for (let i = 0; i < this.props.tiles.length; i++) {
            this.diffuseMap = new THREE.TextureLoader(this.manager).load(this.state.tiles[i].albedo);
            this.normalMap = new THREE.TextureLoader(this.manager).load(this.state.tiles[i].normal);
            const plane_material = new THREE.MeshPhongMaterial({
                map: this.diffuseMap,
                normalMap: this.normalMap,
                flatShading: true,
                normalScale: new THREE.Vector3(1, 1)
            });

            const x = this.state.tiles[i].x + this.state.tiles[i].width / 2
            const y = this.state.tiles[i].y + this.state.tiles[i].height / 2

            const plane_geometry = new THREE.PlaneGeometry(this.state.tiles[i].width, this.state.tiles[i].height);
            const mesh = new THREE.Mesh(plane_geometry, plane_material);
            mesh.position.set(x, this.state.height - y, 0);
            this.group.add(mesh);
        }

        // centre the group of planes in the centre of the scene
        new THREE.Box3().setFromObject(this.group).getCenter(this.group.position).multiplyScalar(- 1);

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.position.set(0, 0, 1);
        this.directionalLight.castShadow = true;
        this.scene.add(this.group);
        this.scene.add(this.camera);
        this.scene.add(this.directionalLight);
        this.scene.add(this.ambientLight);
    }

    animate = () => {
        this.animate_req = requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    }

    rerender(){
        this.renderer.setSize((this.props.width * this.props.zoom), (this.props.height * this.props.zoom));
        _camera_offset(this.camera, this.props);
    }

    componentDidMount() {
        document.getElementById("canvas-container").appendChild(this.renderer.domElement);
        this.animate();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.zoom !== this.props.zoom || prevProps.width !== this.props.width || prevProps.height !== this.props.height ||
            prevProps.bottomLeft.y !== this.props.bottomLeft.y || prevProps.topLeft.y !== this.props.topLeft.y ||
            prevProps.x !== this.props.x) {
            this.rerender();
            this.camera.updateProjectionMatrix();
        }
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.animate_req);
    }

    onTexturesLoaded() {
            document.getElementById("loading-overlay").style.display = "none";
    }

    render(){
        return(
            <Loader
                width = {this.props.width * this.props.zoom}
                height = {this.props.height * this.props.zoom}
                camera = {this.camera}
                directionalLight = {this.directionalLight}
            />
        );
    }
}

export default ThreeCanvas;