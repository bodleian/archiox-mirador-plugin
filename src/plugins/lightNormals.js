import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import FlashlightOnIcon from '@mui/icons-material/FlashlightOn';
import FlashlightOffIcon from '@mui/icons-material/FlashlightOff';
import ThreeCanvas from './threeCanvas';
import {getImageData, getMinMaxProperty} from "./helpers";

function TorchButton(props) {
    return (
        <div>
            <button
                onClick={props.onClick}
            >
                {props.value}
            </button>
        </div>
    );
}

function Overlay(props) {
    return (
        <ThreeCanvas
            albedoTiles={props.albedoTiles}
            normalTiles={props.normalTiles}
            zoom={props.zoom}
            intersection={props.rendererInstructions.intersection}
            contentWidth={props.contentWidth}
            contentHeight={props.contentHeight}
        />
    );
}

function getMap(annotationBodies, mapType) {
    let map;
    annotationBodies.forEach(function(element) {
        const service = element.getService('http://iiif.io/api/annex/services/lightingmap');
        if (service !== null) {
            if(service.__jsonld.mapType === mapType){
                map = element.__jsonld.service[0]['id'];
            }
        }
    });
    return map;
}

function getTiles(tileData, tileLevel, map) {
    const ImageData = getImageData(map, tileData, tileLevel);

    return ImageData
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
            zoomLevel: 0,
            zoom: 0,
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
    }

    torchHandler() {
        this.threeCanvasProps = {};
        let zoom_level = this.props.viewer.viewport.getZoom();

        this.setState( prevState => ({active: !prevState.active}));
        this.threeCanvasProps.contentWidth = this.props.viewer.viewport._contentSize.x;
        this.threeCanvasProps.contentHeight = this.props.viewer.viewport._contentSize.y;
        this.threeCanvasProps.rendererInstructions = getRendererInstructions(this.props);
        this.threeCanvasProps.zoom = this.props.viewer.world.getItemAt(0).viewportToImageZoom(zoom_level);
        this.threeCanvasProps.albedoMap = getMap(this.props.canvas.iiifImageResources, 'albedo');
        this.threeCanvasProps.normalMap = getMap(this.props.canvas.iiifImageResources, 'normal');
        this.threeCanvasProps.tileLevel = getMinMaxProperty("max","level", this.props.viewer.world.getItemAt(0).lastDrawn);

        if (this.state.active) {
            this.props.viewer.removeOverlay(this.threeCanvas);
            this.props.viewer.removeAllHandlers();

        } else {
            this.threeCanvas = document.createElement("div");
            this.threeCanvas.id = "three-canvas";
            this.props.viewer.addOverlay(this.threeCanvas);

            const overlay = this.props.viewer.getOverlayById(this.threeCanvas);

            this.threeCanvasProps.albedoTiles = getTiles(
                this.props.viewer.source,
                5,
                this.threeCanvasProps.albedoMap
            );

            this.threeCanvasProps.normalTiles = getTiles(
                this.props.viewer.source,
                5,
                this.threeCanvasProps.normalMap
            )

            overlay.update(this.threeCanvasProps.rendererInstructions.intersectionTopLeft);

            // uncomment code below to enable debug mode in OpenSeaDragon
            // for (var i = 0; i < this.props.viewer.world.getItemCount(); i++) {
            //     this.props.viewer.world.getItemAt(i).debugMode = true;
            // }

            // We need to call forceRedraw each time we update the overlay, if this line is remove, the overlay will
            // glitch and not re-render until we cause the viewport-change event to trigger
            this.props.viewer.forceRedraw();

            this.props.viewer.addHandler('viewport-change',  (event) => {
                const zoom_level = this.props.viewer.viewport.getZoom(true);
                this.threeCanvasProps.rendererInstructions = getRendererInstructions(this.props);
                this.threeCanvasProps.zoom = this.props.viewer.world.getItemAt(0).viewportToImageZoom(zoom_level);
                this.setState({zoom:   this.threeCanvasProps.zoom});
                this.setState({rendererInstructions: this.threeCanvasProps.rendererInstructions});
                overlay.update(this.threeCanvasProps.rendererInstructions.intersectionTopLeft);
                console.log("Event happening!");
            });

            this.props.viewer.addHandler('close',  (event) => {
                this.setState({active: false});
                // remove all handlers so viewport-change isn't activated!
                this.props.viewer.removeAllHandlers();
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
            prevState.active !== this.state.active
        ) {
            this.state.active ? ReactDOM.render(
                Overlay(this.threeCanvasProps),
                this.threeCanvas
            ) : null;
        }
    }

    render() {
        const light = this.state.active ? <FlashlightOnIcon/> : <FlashlightOffIcon/>;

        return (
            <div>
                <TorchButton
                    onClick={() => this.torchHandler()}
                    value={light}
                />
            </div>
        );
    }
}

export default lightNormals;
