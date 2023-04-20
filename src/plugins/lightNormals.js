import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import WbIncandescentOutlinedIcon from '@material-ui/icons/WbIncandescentOutlined';
import HighlightIcon from '@material-ui/icons/Highlight';
import CloseSharpIcon from '@material-ui/icons/CloseSharp';
import ReplaySharpIcon from '@material-ui/icons/ReplaySharp';
import Tooltip from '@material-ui/core/Tooltip';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import Slider from '@material-ui/core/Slider';
import ThreeCanvas from './threeCanvas';
import * as THREE from "three";
import { getImageData, getMinMaxProperty } from "./helpers";

function ResetLightPositions(props) {
    return (
        <MiradorMenuButton
            aria-label={"Reset Lighting Settings"}
            style={{
                float: "left",
                clear: "both"
            }}
            onClick={ props.onClick }
        >
            <ReplaySharpIcon />
        </MiradorMenuButton>
    );
}

function AmbientLightIntensity(props) {
    return (
        <Tooltip title={ "Change Ambient Light Intensity" }>
            <Slider
                id="AmbientLightIntensity"
                style={{
                    marginTop: "20px",
                    marginBottom: "20px",
                    marginLeft: "8px",
                    marginRight: "8px",
                    height: "87px"
                }}
                size="small"
                orientation="vertical"
                marks
                defaultValue={ props.ambientIntensity }
                value={ props.ambientIntensity }
                step={ 0.1 }
                min={ 0 }
                max={ 1 }
                onChange={ props.onChange }
            />
        </Tooltip>
    )
}

function DirectionalLightIntensity(props) {
    return (
        <Tooltip title={ "Change Directional Light Intensity" }>
            <Slider
                id="DirectionalLightIntensity"
                style={{
                    marginTop: "20px",
                    marginBottom: "20px",
                    marginLeft: "8px",
                    marginRight: "8px",
                    height: "87px"
                }}
                size="small"
                orientation="vertical"
                marks
                defaultValue={ props.directionalIntensity }
                value={ props.directionalIntensity }
                step={ 0.1 }
                min={ 0.1 }
                max={ 1 }
                onChange={ props.onChange }
            />
        </Tooltip>
    )
}

function LightDirection(props) {
    return (
        <Tooltip title={ "Change Light Direction" }>
            <div
                id="LightDirectionControl"
                style={{
                    border: "#000000",
                    width: "100px",
                    height: "100px",
                    borderRadius: "50px",
                    background: `radial-gradient(at ` + props.mouseX + `% ` + props.mouseY + `%, #ffffff, #000000)`,
                    margin: "13px"
                }}
                aria-label="Change light direction"
                aria-expanded="False"
                onMouseMove={ props.onMouseMove }
                onMouseDown={ props.onMouseDown }
                onMouseUp={ props.onMouseUp }
                onMouseLeave={ props.onMouseLeave }
            />
        </Tooltip>
    );
}

function LightButtons({ children }) {
    return (
        <div>
            { children }
        </div>
    )
}

function LightControls({ children }) {
    return (
        <div
            style={{
                float: "left",
                display: "flex"
            }}
        >
            { children }
        </div>
    )
}

function ToolsMenu({ children }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                position: "absolute",
                left: "8px",
                top: "8px",
                borderRadius: "25px",
                zIndex: 999,
                backgroundColor: `rgba(255, 255, 255, 0.8)`
            }}
            className={ 'MuiPaper-elevation4 '}
        >
            { children }
        </div>
    )
}

function MenuButton(props) {
    return (
        <MiradorMenuButton
            aria-label={ props.open ? "Collapse Relighting Tools" : "Expand Relighting Tools" }
            style={{
                float: "left",
                clear: "both"
            }}
            onClick={ props.onClick }
        >
            { props.open ? <CloseSharpIcon /> : <HighlightIcon /> }
        </MiradorMenuButton>
    );
}

function TorchButton(props) {
    return (
        <MiradorMenuButton
            aria-label={ props.active ? "Turn Off 3D Overlay" : "Turn On 3D Overlay" }
            style={{
                float: "left",
                clear: "both"
            }}
            onClick={ props.onClick }
        >
            { props.active ? <WbIncandescentIcon/> : <WbIncandescentOutlinedIcon/> }
        </MiradorMenuButton>
    );
}

function Overlay(props) {
    return (
        <ThreeCanvas
            images={ props.images }
            zoom={ props.zoom }
            intersection={ props.rendererInstructions.intersection }
            contentWidth={ props.contentWidth }
            contentHeight={ props.contentHeight }
            lightX={ props.lightX }
            lightY={ props.lightY }
            directionalIntensity={ props.directionalIntensity }
            ambientIntensity={ props.ambientIntensity }
            tileLevel={ props.tileLevel }
            minTileLevel={ props.minTileLevel }
            maxTileLevel={ props.maxTileLevel }
            tileSets={ props.tileSets }
            tileLevels={ props.tileLevels }
        />
    );
}

function getMap(annotationBodies, mapType) {
    let map;

    annotationBodies.forEach(function(element) {
        let service = element.getService('http://iiif.io/api/annex/services/lightingmap');

        // anticipate future edge case now, we can always fix this at a later date
        if (service === null) {
            service = element.getService('http://iiif.io/api/extension/lightingmap');
        }

        const services = element.getServices();

        if (service !== null) {
            if(service.__jsonld.mapType === mapType) {
                services.forEach(function(service) {

                    if(service.__jsonld["type"] === "ImageService3") {
                        map = service['id'];
                    }

                    if (map === null) {
                        if(service.__jsonld["@type"] === "ImageService2") {
                            map = service['@id'];
                        }
                    }
                });
            }
        }
    });
    return map;
}

function getTiles(tileData, tileLevel, map) {
    const imageData = getImageData(map, tileData, tileLevel);

    return imageData;
}

function getTileSets(maxTileLevel, source, albedoMap, normalMap) {
    let tileLevels = {};

    for (let i = 1; i < maxTileLevel + 1; i++) {
        tileLevels[i] = {
            albedoTiles: getTiles(
                source,
                i,
                albedoMap
            ),
            normalTiles: getTiles(
                source,
                i,
                normalMap
            )
        };
    };

    return tileLevels;
}

function getRendererInstructions(props) {
    let rendererInstructions = {};
    const viewportBounds = props.viewer.viewport.getBounds(true);
    const tiledImage = props.viewer.world.getItemAt(0);
    const imageBounds = tiledImage.getBounds(true);
    const intersection = viewportBounds.intersection(imageBounds);
    if (intersection) {
        rendererInstructions.intersectionTopLeft = intersection.getTopLeft();
        rendererInstructions.intersectionBottomLeft = intersection.getBottomLeft();
        rendererInstructions.intersection = intersection;
        return rendererInstructions;
    }
}

class lightNormals extends Component {
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
                intersection:{
                    width:0,
                    height:0,
                    x:0,
                    y:0
                }
            },
            images: {},
            tileLevel: 0
        }
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
        event.preventDefault();
        const control = document.getElementById("LightDirectionControl");
        const boundingBox = control.getBoundingClientRect();
        this.mouseX = event.clientX - boundingBox.left;
        this.mouseY = event.clientY - boundingBox.top;

        if (this.mouseDown) {
            document.getElementById("LightDirectionControl").style.background = `radial-gradient(at ` + this.mouseX + `% ` + this.mouseY + `%, #ffffff, #000000)`;
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

    onMouseDown(event) {
        this.mouseDown = true;
    }

    onMouseUp(event) {
        this.mouseDown = false;
    }

    onMouseLeave(event) {
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
        this.setState( prevState => ({ open: !prevState.open }));
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
        this.threeCanvasProps.lightY = this.lighY;

        this.setState({ mouseX: this.mouseX });
        this.setState({ mouseY: this.mouseY });
        this.setState({ lightX: this.lightX });
        this.setState({ lightY: this.lightY });
        this.setState({ ambientIntensity: this.ambientIntensity });
        this.setState({ directionalIntensity: this.directionalIntensity });
    }

    torchHandler() {
        this.threeCanvasProps = {};
        let zoom_level = this.props.viewer.viewport.getZoom();
        this.setState( prevState => ({ active: !prevState.active }));
        this.threeCanvasProps.contentWidth = this.props.viewer.viewport._contentSize.x;
        this.threeCanvasProps.contentHeight = this.props.viewer.viewport._contentSize.y;
        this.threeCanvasProps.rendererInstructions = getRendererInstructions(this.props);
        this.threeCanvasProps.zoom = this.props.viewer.world.getItemAt(0).viewportToImageZoom(zoom_level);
        this.threeCanvasProps.albedoMap = this.albedoMap;
        this.threeCanvasProps.normalMap = this.normalMap;
        this.threeCanvasProps.lightX = this.lightX;
        this.threeCanvasProps.lightY = this.lightY;
        this.threeCanvasProps.directionalIntensity = this.directionalIntensity;
        this.threeCanvasProps.ambientIntensity = this.ambientIntensity;
        this.threeCanvasProps.tileLevel = getMinMaxProperty("max","level", this.props.viewer.world.getItemAt(0).lastDrawn);
        this.threeCanvasProps.minTileLevel = getMinMaxProperty("min","level", this.props.viewer.world.getItemAt(0).lastDrawn);
        this.threeCanvasProps.tileLevels = this.tileLevels;

        if (this.state.active) {
            this.props.viewer.removeOverlay(this.threeCanvas);
            this.props.viewer.removeAllHandlers('viewport-change');
        } else {

            this.threeCanvasProps.maxTileLevel = this.props.viewer.source.scale_factors.length - 1;
            this.tileSets = getTileSets(
                this.threeCanvasProps.maxTileLevel,
                this.props.viewer.source,
                this.threeCanvasProps.albedoMap,
                this.threeCanvasProps.normalMap
            );

            this.threeCanvas = document.createElement("div");
            this.threeCanvas.id = "three-canvas";
            this.props.viewer.addOverlay(this.threeCanvas);
            this.overlay = this.props.viewer.getOverlayById(this.threeCanvas);
            this.threeCanvasProps.tileLevel = getMinMaxProperty("max","level", this.props.viewer.world.getItemAt(0).lastDrawn);
            this.threeCanvasProps.images = this.images;
            this.threeCanvasProps.tileSets = this.tileSets;
            this.overlay.update(this.threeCanvasProps.rendererInstructions.intersectionTopLeft);

            // uncomment code below to enable debug mode in OpenSeaDragon
            // for (var i = 0; i < this.props.viewer.world.getItemCount(); i++) {
            //     this.props.viewer.world.getItemAt(i).debugMode = true;
            // }

            // We need to call forceRedraw each time we update the overlay, if this line is remove, the overlay will
            // glitch and not re-render until we cause the viewport-change event to trigger
            this.props.viewer.forceRedraw();
            this.props.viewer.addHandler('viewport-change', (event) => {
                const zoom_level = this.props.viewer.viewport.getZoom(true);
                this.threeCanvasProps.rendererInstructions = getRendererInstructions(this.props);
                this.threeCanvasProps.zoom = this.props.viewer.world.getItemAt(0).viewportToImageZoom(zoom_level);
                this.setState({ zoom: this.threeCanvasProps.zoom });
                this.setState({ rendererInstructions: this.threeCanvasProps.rendererInstructions });
                this.setState( {directionalIntensity: this.threeCanvasProps.directionalIntensity});
                this.overlay.update(this.threeCanvasProps.rendererInstructions.intersectionTopLeft);
                this.overlay.update(this.threeCanvasProps.rendererInstructions.intersectionTopLeft);
                this.threeCanvasProps.tileLevel = getMinMaxProperty("max","level", this.props.viewer.world.getItemAt(0).lastDrawn);
                this.threeCanvasProps.images = this.images;
                this.setState({ images: this.threeCanvasProps.images });
                this.setState({ tileLevel: this.threeCanvasProps.tileLevel });
            });

            this.props.viewer.addHandler('close',  (event) => {
                this.setState({active: false});
                this.setState({visible: false});
                // remove all handlers so viewport-change isn't activated!
                this.props.viewer.removeAllHandlers('viewport-change');
            });
        }

        // this will need replacing because I think that ReacDOM.render has been depricated
        !this.state.active ? ReactDOM.render(
            Overlay(this.threeCanvasProps),
            this.threeCanvas
        ) : ReactDOM.unmountComponentAtNode(this.threeCanvas);
    }

    // this keeps track of values stored in state and compares them to the current values, if any of them change it causes
    // a rerender
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            prevState.zoom !== this.threeCanvasProps.zoom ||
            prevState.rendererInstructions.intersection !== this.threeCanvasProps.rendererInstructions.intersection ||
            prevState.active !== this.state.active ||
            prevState.lightX !== this.threeCanvasProps.lightX ||
            prevState.lightY !== this.threeCanvasProps.lightY ||
            prevState.directionalIntensity !== this.state.directionalIntensity ||
            prevState.ambientIntensity !== this.state.ambientIntensity ||
            prevState.tileLevel !== this.threeCanvasProps.tileLevel ||
            prevState.images !== this.threeCanvasProps.images
        ) {
            this.state.active ? ReactDOM.render(
                Overlay(this.threeCanvasProps),
                this.threeCanvas
            ) : null;
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
                this.setState(prevState => ({visible: !prevState.visible}));
                this.map_ids = [
                    this.albedoMap.split("/").pop(),
                    this.normalMap.split("/").pop()
                ]
            }
        }

        if (this.props.viewer && typeof this.albedoMap !== 'undefined' &&
            typeof this.normalMap !== 'undefined') {

            if (!this.state.loaded && !this.state.loadHandlerAdded) {
                this.setState({ loaded: true });

                this.props.viewer.addHandler('tile-drawn', (event) => {
                    this.tileLevels[event.tile.level] = event.tile.level;
                });

                this.props.viewer.addHandler('tile-loaded', (event) => {
                    this.setState({ loadHandlerAdded: true });
                    const sourceKey = event.image.currentSrc.split("/")[5];
                    const canvas = document.createElement('canvas');
                    canvas.width = event.image.width;
                    canvas.height = event.image.height;
                    event.tile.context2D = canvas.getContext('2d');
                    const tileTexture = new THREE.Texture(event.image);
                    tileTexture.needsUpdate = true;
                    event.tile.context2D.drawImage(event.image, 0, 0);
                    const key = event.tile.cacheKey;

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
            toolMenu = <ToolsMenu visible={ this.state.visible }>
                <LightButtons>
                    <MenuButton
                        open={ this.state.open }
                        onClick={ () => this.menuHandler() }
                    />
                    <TorchButton
                        onClick={ () => this.torchHandler() }
                        active={ this.state.active }
                    />
                    <ResetLightPositions
                        onClick={ () => this.resetHandler() }
                    />
                </LightButtons>
                <LightControls>
                    <LightDirection
                        mouseX={ this.state.mouseX }
                        mouseY={ this.state.mouseY }
                        onMouseMove={ (event) => this.onMouseMove(event) }
                        onMouseDown={ (event) => this.onMouseDown(event) }
                        onMouseUp={ (event) => this.onMouseUp(event) }
                        onMouseLeave={ (event) => this.onMouseLeave(event) }
                    />
                    <DirectionalLightIntensity
                        directionalIntensity={ this.state.directionalIntensity }
                        onChange={ (event, value) => this.onDirectionalLightChange(event, value) }
                    />
                    <AmbientLightIntensity
                        ambientIntensity={ this.state.ambientIntensity }
                        onChange={ (event, value) => this.onAmbientLightChange(event, value) }
                    />
                </LightControls>
            </ToolsMenu>;
        } else if (this.state.visible && !this.state.open) {
            toolMenu =  <ToolsMenu visible={ this.state.visible }>
                <MenuButton
                    open={ this.state.open }
                    onClick={ () => this.menuHandler() }
                />
            </ToolsMenu>
        } else if (!this.state.visible) {
            toolMenu = null;
        }

        return (
            <>
                { toolMenu }
            </>
        );
    }
}

export default lightNormals;
