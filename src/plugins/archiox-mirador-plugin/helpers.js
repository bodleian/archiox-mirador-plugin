import React from "react";

const ACCEPTABLE_FORMATS = [
    "jpg",
    "tif",
    "png",
    "gif",
    "jp2",
    "pdf",
    "webp",
]

const ACCEPTABLE_QUALITIES = [
    "color",
    "grey",
    "bitonal",
    "default",
]

/**
 *
 * @param canvas
 * @returns {boolean}
 */
export function resizeCanvas(canvas) {
    const { width, height } = canvas.getBoundingClientRect();

    if (canvas.width !== width || canvas.height !== height) {
        const { devicePixelRation:ratio = 1 } = window;
        const context = canvas.getContext('2d');
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        context.scale(ratio, ratio);
        return true;
    }

    return false;
}

/**
 *
 * @param id
 * @param width
 * @param height
 * @param tileSource
 * @param scaleFactor
 * @returns {{}}
 */
export function explode(id, width, height, tileSource, scaleFactor) {
    let tiles =[];
    let tileCount = 0;
    const tileWidth = tileSource.width;
    const tileHeight = tileSource.height || tileSource.width;
    const factors = tileSource.scaleFactors.sort(function(a,b){return b-a}); // spec doesn't actually specify order

    let scale = factors[scaleFactor];
    const regionWidth = scale * tileWidth;
    const regionHeight = scale * tileHeight;
    const scaleWidth = Math.ceil(width / scale);
    const scaleHeight = Math.ceil(height / scale);
    let y = 0;

    while(y < height){
        let x = 0;
        while(x < width){
            let region;
            if(scaleWidth <= tileWidth && scaleHeight <= tileHeight){
                region = 'full';
            } else {
                let rw = Math.min(regionWidth, width - x);
                let rh = Math.min(regionHeight, height - y);
                region = x + "," + y + "," + rw + "," + rh;
            }
            const scaledWidthRemaining = Math.ceil((width - x) / scale);
            const tw = Math.min(tileWidth, scaledWidthRemaining);
            const iiifArgs = "/" + region + "/" + tw + ",/0/default.jpg";
            tiles.push(id + iiifArgs);
            tileCount++;
            x += regionWidth;
        }
        y += regionHeight;
    }
    return tiles;
}

/**
 *
 * @param uuid
 * @returns {boolean}
 * @private
 */
function _validateUUID(uuid) {
    const regex = /^[\da-f]{8}-[\da-f]{4}-[0-5][\da-f]{3}-[089ab][\da-f]{3}-[\da-f]{12}$/i;

    return new RegExp(regex).test(uuid);
}

/**
 *
 * @param intersection
 * @param width
 * @param height
 * @returns {{}|null}
 * @private
 */
function _mapIntersection(intersection, width, height) {
    let intersectionProperties = {};


    // we need to use size to calculate actual size of tile
    if (intersection === "full") {
        intersectionProperties.x = 0;
        intersectionProperties.y = 0;
        intersectionProperties.w = parseInt(width);
        intersectionProperties.h = parseInt(height);

        return intersectionProperties;
    }

    const intersectionComponents = intersection.split(',');
    if ( intersectionComponents.length !== 4 ) {
        return null;
    }

    intersectionProperties.x = parseInt(intersectionComponents[0]);
    intersectionProperties.y = parseInt(intersectionComponents[1]);
    intersectionProperties.w = parseInt(intersectionComponents[2]);
    intersectionProperties.h = parseInt(intersectionComponents[3]);

    return intersectionProperties;
}

/**
 *
 * @param size
 * @param aspectRatio
 * @returns {{}|null}
 * @private
 */
function _mapSize(size, aspectRatio) {
    let sizeProperties = {};
    const sizeComponents = size.split(',');

    if (!sizeComponents.length > 2) {
        return null;
    }

    const width = parseInt(sizeComponents[0]);
    const height = parseInt(sizeComponents[1]);

    if (isNaN(width)) {
        const width = height * aspectRatio;
        sizeProperties.height = height;
        sizeProperties.width = width;
        return sizeProperties;
    }

    if (isNaN(height)) {
        sizeProperties.height = width / aspectRatio;
        sizeProperties.width = width;
        return sizeProperties;
    }

    sizeProperties.height = height;
    sizeProperties.width = width;
    return sizeProperties;
}

/**
 *
 * @private
 */
function _mapQualityAndFormat(qualityFormat) {

    let qualityFormatProperties = {};
    const components = qualityFormat.split('.');

    if (!components.length > 1) {
        return null;
    }

    if (!components[0] in ACCEPTABLE_QUALITIES) {
        return null;
    }

    qualityFormatProperties.quality = components[0];

    if (!components[1] in ACCEPTABLE_FORMATS) {
        return null;
    }

    qualityFormatProperties.format = components[1];

    return qualityFormatProperties;
}


/**
 *
 * @param url
 * @param width
 * @param height
 * @returns {null/*}
 */
export function parseImageURL(url, width, height) {
    let imageDetails = {};
    const aspectRatio = width / height;
    const parsedURL = new URL(url);

    if(!parsedURL){
        return null;
    }

    const pathComponents = parsedURL.pathname.split("/");

    if (pathComponents.length !== 8) {
        return null;
    }

    //if (!_validateUUID(pathComponents[3])) {
    //    return null;
    //}

    imageDetails.uuid = pathComponents[3];

    const size = _mapSize(pathComponents[5], aspectRatio);

    if (size === null) {
        return null;
    }

    imageDetails.size = size;

    const intersection = _mapIntersection(pathComponents[4], size.width, size.height);

    if (intersection === null) {
        return null;
    }

    imageDetails.intersection = intersection;


    imageDetails.rotation = pathComponents[6];

    const formatQuality = _mapQualityAndFormat(pathComponents[7]);

    if (formatQuality === null) {
        return null;
    }

    imageDetails.quality = formatQuality.quality;
    imageDetails.format = formatQuality.format;

    return imageDetails;
}

/**
 *
 * @param data
 * @param type
 * @returns {null|*}
 */
export function parseTiles(data, type) {
    if(!data[type]){
        return null;
    } else {
        return data[type];
    }
}

/**
 *
 * @param type
 * @param property
 * @param tiles
 * @returns {*}
 */
export function getMinMaxProperty(type, property, tiles) {
    const coordinates = tiles.map(item => {
        const container = [];
        container.push(parseInt(item[property]));
        return container;
    })

    if (type === "min") {
        return Math.min.apply(null, coordinates);
    }

    if (type === "max") {
        return Math.max.apply(null, coordinates);
    }

    return null
}

export const getImageData = (mapURL, data, tilesIndex) => {
    console.log("mapURL: " + mapURL);
    console.log("data: " + data);
    console.log("tilesIndex: " + tilesIndex);
    let imageConfig = {}
    imageConfig.id = mapURL;
    
    imageConfig.width = parseTiles(data, "width");
    imageConfig.height = parseTiles(data, "height");
    imageConfig.tiles = parseTiles(data, "tiles")[0];  // tiles is index 0 of a singleton?
    imageConfig.urls = explode(imageConfig.id, imageConfig.width, imageConfig.height, imageConfig.tiles, tilesIndex);
    return imageConfig
}
