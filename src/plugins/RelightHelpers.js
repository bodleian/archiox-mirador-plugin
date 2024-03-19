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
  const scaleWidth = Math.ceil(width / scale);
  const scaleHeight = Math.ceil(height / scale);
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
      const scaledWidthRemaining = Math.ceil((width - x) / scale);
      const scaledHeightRemaining = Math.ceil((height - y) / scale);
      const tw = Math.min(tileWidth, scaledWidthRemaining);
      const th = Math.min(tileHeight, scaledHeightRemaining);

      let tileFormat = 'jpg';

      if (preferredFormats) {
        tileFormat = preferredFormats[0];
      }

      const iiifArgs =
        '/' + region + '/' + tw + ',' + th + '/0/default.' + tileFormat; // this is where the bug is

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
 * Returns data from an object by using type as the key.  In this case we use it only for tiles
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
 * @returns {{}} an object containing the ids for all the lighting maps
 */
export function getLayers(annotationBodies) {
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
 * @returns {{}}
 */
export function getTileSets(maxTileLevel, data, albedoMap, normalMap) {
  let tileLevels = {};

  for (let i = 1; i < maxTileLevel + 1; i++) {
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
 * The updateLayer method is used to turn on or off any set of layers present in the viewer that you want to,
 * it can be used to turn off a set of or a singular layer by specifying the layer mapTypes in excluded_maps
 * and providing a list of the layers currently in the viewer.  You can send a boolean value to turn these on
 * or off, which means you can toggle the state of a control e.g. active: false or true to control this too.
 * @param {string} windowId the id of the current window in the viewer
 * @param {function} updateLayers the Mirador updateLayers function
 * @param {array} excluded_maps an array containing the mapTypes you wish to toggle visibility on
 * @param {string} canvasId the id of the current canvas in the viewer
 * @param {object} layers an object containing all the layer ids (urls) in viewer
 * @param {boolean} value a boolean value indicating whether you want the excluded layers on or off
 */
export function updateLayer(
  windowId,
  updateLayers,
  excluded_maps,
  canvasId,
  layers,
  value
) {
  Object.keys(layers).forEach((key) => {
    const mapType = layers[key].trim();

    if (excluded_maps.includes(mapType)) {
      const payload = {
        [key]: { visibility: value },
      };
      updateLayers(windowId, canvasId, payload);
    }
  });
}

/**
 * A function to parse a IIIF tile URL and get the x, y, width, and height
 */
export function parseIIIFUrl(url) {
  // example url https://iiif.bodleian.ox.ac.uk/iiif/image/5f34d322-61d9-44a0-81a3-9422364fa991/3072,0,136,1024/34,/0/default.webp
  const rawURL = new URL(url);
  const path = rawURL.pathname;
  const pathParts = path.split('/');
  const imageParams = pathParts[pathParts.length - 4];

  return imageParams.split(',');
}
