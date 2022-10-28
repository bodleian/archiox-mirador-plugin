import React from "react";

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
export function generateTiles(id, width, height, tileSource, scaleFactor) {
    let tiles = [];
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
            let rw;
            let rh;

            if(scaleWidth <= tileWidth && scaleHeight <= tileHeight){
                rw = tileWidth;
                rh = tileHeight;
                region = 'full';
            } else {
                rw = Math.min(regionWidth, width - x);
                rh = Math.min(regionHeight, height - y);
                region = x + "," + y + "," + rw + "," + rh;
            }
            const scaledWidthRemaining = Math.ceil((width - x) / scale);
            const scaledHeightRemaining = Math.ceil((height - y) / scale);
            const tw = Math.min(tileWidth, scaledWidthRemaining);
            const th = Math.min(tileHeight, scaledHeightRemaining);
            const iiifArgs = "/" + region + "/" + tw + ",/0/default.jpg";
            
            tiles.push({
                url: id + iiifArgs,
                tile: {
                    w: parseInt(rw),
                    h: parseInt(rh),
                    x: parseInt(x),
                    y: parseInt(y)
                }
            })
            
            tileCount++;
            x += regionWidth;
        }
        y += regionHeight;
    }
    
    return tiles;
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

/**
 * 
 * @param property
 * @param tiles
 * @returns {null|*}
 */
export function getProperty(property, tiles) {
    const items = tiles.map(item => {
        return item[property];
    })
    
    if (!items) {
        return null;
    }
    
    return items
}

/**
 * 
 * @param mapURL
 * @param data
 * @param tilesIndex
 * @returns {{}}
 */
export const getImageData = (mapURL, data, tilesIndex) => {
    let imageConfig = {}
    const id = mapURL;
    imageConfig.width = parseTiles(data, "width");
    imageConfig.height = parseTiles(data, "height");
    const tiles = parseTiles(data, "tiles")[0];  // tiles is index 0 of a singleton?
    
    const tileData = generateTiles(id, imageConfig.width, imageConfig.height, tiles, tilesIndex);
    imageConfig.urls = getProperty("url", tileData);
    imageConfig.tiles = getProperty("tile", tileData);
    
    return imageConfig
}
