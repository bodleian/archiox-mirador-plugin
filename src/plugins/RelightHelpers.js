import { put } from 'redux-saga/effects';

/**
 * Generates an object containing a full tile pyramid. Mirador only generates the parts that are needed
 * as they are loaded in, so you cannot access the full pyramid until all the tiles have loaded.  We need the
 * full data structure earlier so here we calculate it.  The algorithm is based on Tom Crane's tile-exploder
 * @param {string} id IIIF image resource id
 * @param {number} width width of the image resource at a particular scale factor
 * @param {number} height height of the image resource at a particular scale factor
 * @param {preferredFormats} preferredFormats format to use in tile requests for ARCHiOx objects
 * @param {object} tileSource object containing information parsed out from the image info.json in the manifest
 * @param {number} scaleFactor the scaleFactor you want to generate tiles for
 * @returns {{}} an array of objects containing IIIF image tile URLs with tile dimensions
 */
export function generateTiles(
  id,
  width,
  height,
  preferredFormats,
  tileSource,
  scaleFactor
) {
  let tiles = [];
  const tileWidth = tileSource.width;
  const tileHeight = tileSource.height || tileSource.width;
  const factors = tileSource.scaleFactors.sort(function (a, b) {
    return b - a;
  }); // spec doesn't actually specify order

  let scale = factors[scaleFactor];
  const regionWidth = scale * tileWidth;
  const regionHeight = scale * tileHeight;
  const scaleWidth = Math.floor(width / scale);
  const scaleHeight = Math.floor(height / scale);
  let y = 0;

  while (y < height) {
    let x = 0;
    while (x < width) {
      let region;
      let rw;
      let rh;

      if (scaleWidth <= tileWidth && scaleHeight <= tileHeight) {
        rw = tileWidth;
        rh = tileHeight;
        region = 'full';
      } else {
        rw = Math.min(regionWidth, width - x);
        rh = Math.min(regionHeight, height - y);
        region = x + ',' + y + ',' + rw + ',' + rh;
      }
      const scaledWidthRemaining = Math.floor((width - x) / scale);
      const scaledHeightRemaining = Math.floor((height - y) / scale);
      const tw = Math.min(tileWidth, scaledWidthRemaining);
      const th = Math.min(tileHeight, scaledHeightRemaining);

      let tileFormat = 'jpg';

      if (preferredFormats) {
        tileFormat = preferredFormats[0];
      }

      const iiifArgs =
        '/' + region + '/' + tw + ',' + th + '/0/default.' + tileFormat;

      tiles.push({
        url: id + iiifArgs,
        tile: {
          w: parseInt(rw),
          h: parseInt(rh),
          x: x,
          y: y,
        },
      });
      x += regionWidth;
    }
    y += regionHeight;
  }
  return tiles;
}

/**
 * Gets data from an object by using type as the key.  In this case we use it only for tiles
 * @param {object} data the object containing key: value pairs
 * @param {string} type the key of the data you wish to return
 * @returns {null|*} null if type is not present in the object | any value with type as the key
 */
export function _parseTiles(data, type) {
  if (!data[type]) {
    return null;
  } else {
    return data[type];
  }
}

/**
 * Loops through an array of objects to return an array of values from a specified property
 * @param {string} property name of property to get values for
 * @param {object} data array of objects containing key: value pairs
 * @returns {null|*} null if tiles is not an array or the requested property does not exist | array containing the
 *    values of the requested property e.g. a list of url properties from every object in the array
 */
export function _getProperty(property, data) {
  if (!Array.isArray(data)) {
    return null;
  }

  const items = data.map((item) => {
    return item[property];
  });
  // map will return [undefined, undefined] if it cannot find a property
  if (items[0] === undefined) {
    return null;
  }

  return items;
}

/**
 * Builds an array containing a list of tile dimensions and accompanying URLs in matching order
 * @param {string} mapURL IIIF image URL for a particular map type
 * @param {object} data object containing the IIIFTileSource data from Mirador
 * @param {number} tilesIndex tile level index e.g. 1 for top, 5 for bottom
 * @returns {{}} an object that contains the properties URLs and tiles, tiles are objects containing w, h, x, y
 */
export const getTiles = (mapURL, data, tilesIndex) => {
  let imageData = {};
  const id = mapURL;
  imageData.preferredFormats = _parseTiles(data, 'preferredFormats') || null;
  imageData.width = _parseTiles(data, 'width');
  imageData.height = _parseTiles(data, 'height');
  const tiles = _parseTiles(data, 'tiles')[0]; // tiles is index 0 of a singleton
  const tileData = generateTiles(
    id,
    imageData.width,
    imageData.height,
    imageData.preferredFormats,
    tiles,
    tilesIndex
  );
  imageData.urls = _getProperty('url', tileData);
  imageData.tiles = _getProperty('tile', tileData);

  return imageData;
};

/**
 * Parses IIIF annotationBodies to get an array of the layers, we get these ids so that we can toggle their visibility
 * @param {object} annotationBodies IIIF annotationBodies from Mirador
 * @returns {{}} an object containing the ids for all the lighting maps as keys for their mapType
 */
export function getMaps(annotationBodies) {
  let layers = {};
  annotationBodies.forEach(function (element) {
    let service = element.getService(
      'http://iiif.io/api/annex/services/lightingmap'
    );
    if (service === null) {
      service = element.getService('http://iiif.io/api/extension/lightingmap');
    }

    if (service !== null) {
      layers[element.id] = service.__jsonld.mapType;
    }
  });
  return layers;
}

/**
 * Gets the image ids from IIIF annotationBodies and returns them as an array
 * @param {object} annotationBodies IIIF annotationBodies from Mirador
 * @returns {array} an array of image ids
 * **/
export function getImages(annotationBodies) {
  let images = [];
  annotationBodies.forEach(function (element) {
    images.push({ id: element.id });
  });
  return images;
}

/**
 * Parses IIIF annotationBodies to get the URL of a particular mapType
 * @param {object} annotationBodies IIIF annotationBodies from Mirador
 * @param {string} mapType the requested mapType e.g. albedo or normal
 * @returns {string} the URL of the requested mapType
 */
export function getMap(annotationBodies, mapType) {
  let map;

  annotationBodies.forEach(function (element) {
    let service = element.getService(
      'http://iiif.io/api/annex/services/lightingmap'
    );

    // anticipate future edge case now, we can always fix this at a later date
    if (service === null) {
      service = element.getService('http://iiif.io/api/extension/lightingmap');
    }

    const services = element.getServices();

    if (service !== null) {
      if (service.__jsonld.mapType === mapType) {
        services.forEach(function (service) {
          if (service.__jsonld['type'] === 'ImageService3') {
            map = service['id'];
          }

          if (map === null) {
            if (service.__jsonld['@type'] === 'ImageService2') {
              map = service['@id'];
            }
          }
        });
      }
    }
  });
  return map;
}

/**
 * Builds an array of all the tile information for every possible tile level for the albedo and normal maps
 * @param {number} maxTileLevel maximum tile level in the manifest
 * @param {object} data object containing the IIIFTileSource data from Mirador
 * @param {string} albedoMap URL of the albedoMap
 * @param {string} normalMap URL of the normalMap
 * @returns {{}} a nested object containing albedo and normal tiles data
 */
export function getTileSets(maxTileLevel, data, albedoMap, normalMap) {
  let tileLevels = {};

  for (let i = 0; i < maxTileLevel + 1; i++) {
    tileLevels[i] = {
      albedoTiles: getTiles(albedoMap, data, i),
      normalTiles: getTiles(normalMap, data, i),
    };
  }
  return tileLevels;
}

/**
 * Parses OpenSeaDragon viewer properties to build an object describing the intersection of the image as it appears
 * currently on the screen, so if one is zoomed in, the rendererInstructions will only describe that intersection
 * @param {object} props the class props for the Relight class
 * @returns {{}} a nested object containing the rendererInstructions describing the part of the image showing in the
 * view port
 */
export function getRendererInstructions(props) {
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

/**
 * Turns on or off any set of layers present in the viewer that you want to,
 * it can be used to turn off a set of or a singular layer by specifying the layer mapTypes in excluded_maps
 * and providing a list of the layers currently in the viewer.  You can send a boolean value to turn these on
 * or off, which means you can toggle the state of a control e.g. active: false or true to control this too.
 * @param {string} state the state of the Mirador instance
 * @param {object} annotationBodies IIIF annotationBodies from Mirador
 * @param {string} windowId the id of the current window in the viewer
 * @param {function} updateLayers the Mirador updateLayers function
 * @param {array} excluded_maps an array containing the mapTypes you wish to toggle visibility on
 * @param {string} canvasId the id of the current canvas in the viewer
 */
export function updateLayer(
  state,
  annotationBodies,
  windowId,
  updateLayers,
  excluded_maps,
  canvasId
) {
  let payload;

  const maps = getMaps(annotationBodies);
  const images = getImages(annotationBodies);

  payload = reduceLayers(images, maps, excluded_maps);
  updateLayers(windowId, canvasId, payload);
}

/**
 * Converts an images array and maptype object into a payload body that can be injected into Miradors layers state
 * @param {array} layers an array of objects containing image ids
 * @param {object} maps an object containing image ids as keys with their mapTypes as values
 * @param {array} excludedMaps an array of mapTypes to be rendered invisible in the layer choices stack
 * @returns {{}} a nested object to be used as a payload for Mirador layers state
 * **/
export function reduceLayers(layers, maps, excludedMaps) {
  return layers.reduce(function (accumulator, layer, index) {
    let visibility;
    let mapType;
    if (maps[layer.id] === undefined) {
      mapType = 'undefined';
    } else {
      mapType = maps[layer.id].trim();
    }

    visibility = excludedMaps.includes(mapType);
    accumulator[layer.id] = {
      index: index,
      visibility: visibility,
    };
    return accumulator;
  }, {});
}

/**
 * Puts a payload object into the targeted Mirador layers state
 * @param {string} windowId the targeted Mirador windowId
 * @param {string} canvasId the targeted Mirador canvasId
 * @param {function} updateLayers the Mirador updateLayers function
 * @param {{}} payload a nested object to be used as a payload for Mirador layers state
 * **/
export function* setLayers(windowId, canvasId, updateLayers, payload) {
  yield put(updateLayers(windowId, canvasId, payload));
}
/**
 * Gets the aspect of the viewer parent window i.e. is it portrait or landscape, based on width and height.
 * **/
export function getAspect(windowId) {
  // we need to get the viewer parent div width and height instead of using the global window variable
  const mosaicWindows = Array.from(
    document.getElementsByClassName('mosaic-window-body')
  );
  let mosaicWindowSize;
  let mosaicWindowSizes = mosaicWindows.map((mosaicWindow) => {
    return {
      [mosaicWindow.firstChild.id]: mosaicWindow.getBoundingClientRect(),
    };
  });
  //reduce object to one object with keys
  mosaicWindowSizes = Object.assign({}, ...mosaicWindowSizes);
  mosaicWindowSize = mosaicWindowSizes[windowId];

  let aspect = 'portrait';
  if (mosaicWindowSize.height < mosaicWindowSize.width) {
    aspect = 'landscape';
  }
  return aspect;
}
