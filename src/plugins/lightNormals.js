import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import FlashlightOnIcon from '@material-ui/icons/WbIncandescent';
import FlashlightOffIcon from '@material-ui/icons/WbIncandescentOutlined';
import GamepadIcon from '@material-ui/icons/Gamepad';
import CloseSharpIcon from '@material-ui/icons/CloseSharp';
import ReplaySharpIcon from '@material-ui/icons/ReplaySharp';
import Slider from '@material-ui/core/Slider';
import ThreeCanvas from './threeCanvas';
import { getImageData, getMinMaxProperty } from "./helpers";

function ResetLightPositions(props) {
    return (
        <button
            className={ 'MuiButtonBase-root MuiIconButton-root' }
            style={{
                float: "left",
                clear: "both"
            }}
            onClick={ props.onClick }
        >
            <ReplaySharpIcon />
        </button>
    );
}

function AmbientLightIntensity(props) {
    return (
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
    )
}

function DirectionalLightIntensity(props) {
    return (
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
    )
}

function LightDirection(props) {
    return (
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
            onMouseMove={ props.onMouseMove }
            onMouseDown={ props.onMouseDown }
            onMouseUp={ props.onMouseUp }
            onMouseLeave={ props.onMouseLeave }
        />
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
        <button
            className={ 'MuiButtonBase-root MuiIconButton-root' }
            style={{
                float: "left",
                clear: "both"
            }}
            onClick={ props.onClick }
        >
            { props.open ? <CloseSharpIcon /> : <GamepadIcon /> }
        </button>
    );
}

function TorchButton(props) {
    return (
        <button
            className={ 'MuiButtonBase-root MuiIconButton-root' }
            style={{
                float: "left",
                clear: "both"
            }}
            onClick={ props.onClick }
        >
            { props.value }
        </button>
    );
}

function Overlay(props) {
    return (
        <ThreeCanvas
            albedoTiles={ props.albedoTiles }
            normalTiles={ props.normalTiles }
            zoom={ props.zoom }
            intersection={ props.rendererInstructions.intersection }
            contentWidth={ props.contentWidth }
            contentHeight={ props.contentHeight }
            lightX={ props.lightX }
            lightY={ props.lightY }
            directionalIntensity={ props.directionalIntensity }
            ambientIntensity={ props.ambientIntensity }
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
    return getImageData(map, tileData, tileLevel);
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
            }
        }
        this.threeCanvasProps = {};
        this.mouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.lightX = 0;
        this.lightY = 0;
        this.directionalIntensity = 1;
        this.ambientIntensity = 0.1;
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
            this.lightY =  - (this.mouseY / 100) * 2 + 1;
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

        if (this.state.active) {
            this.props.viewer.removeOverlay(this.threeCanvas);
            this.props.viewer.removeAllHandlers('viewport-change');
        } else {
            this.threeCanvas = document.createElement("div");
            this.threeCanvas.id = "three-canvas";
            this.props.viewer.addOverlay(this.threeCanvas);
            this.overlay = this.props.viewer.getOverlayById(this.threeCanvas);
            this.max_tileLevel = this.props.viewer.source.scale_factors.length - 1;

            this.threeCanvasProps.albedoTiles = getTiles(
                this.props.viewer.source,
                this.max_tileLevel,
                this.threeCanvasProps.albedoMap
            );

            this.threeCanvasProps.normalTiles = getTiles(
                this.props.viewer.source,
                this.max_tileLevel,
                this.threeCanvasProps.normalMap
            );

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
            prevState.ambientIntensity !== this.state.ambientIntensity
        ) {
            this.state.active ? ReactDOM.render(
                Overlay(this.threeCanvasProps),
                this.threeCanvas
            ) : null;
        }
    }

    render() {
        const light = this.state.active ? <FlashlightOnIcon/> : <FlashlightOffIcon/>;

        if (typeof this.props.canvas !== 'undefined' && !this.state.visible) {
            this.albedoMap = getMap(this.props.canvas.iiifImageResources, 'albedo');
            this.normalMap = getMap(this.props.canvas.iiifImageResources, 'normal');

            if (
                typeof this.albedoMap !== 'undefined' &&
                typeof this.normalMap !== 'undefined' &&
                !this.state.visible
            ) {
                this.setState( prevState => ({ visible: !prevState.visible }));
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
                        value={ light }
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
