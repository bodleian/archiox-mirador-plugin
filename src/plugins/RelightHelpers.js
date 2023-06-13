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
      const tw = Math.min(tileWidth, scaledWidthRemaining);
      const iiifArgs = '/' + region + '/' + tw + ',/0/default.jpg';

      tiles.push({
        url: id + iiifArgs,
        tile: {
          w: parseInt(rw),
          h: parseInt(rh),
          x: parseInt(x),
          y: parseInt(y),
        },
      });

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
  if (!data[type]) {
    return null;
  } else {
    return data[type];
  }
}

/**
 *
 * @param property
 * @param tiles
 * @returns {null|*}
 */
export function getProperty(property, tiles) {
  const items = tiles.map((item) => {
    return item[property];
  });

  if (!items) {
    return null;
  }

  return items;
}

/**
 *
 * @param mapURL
 * @param data
 * @param tilesIndex
 * @returns {{}}
 */
export const getImageData = (mapURL, data, tilesIndex) => {
  let imageData = {};
  const id = mapURL;
  imageData.width = parseTiles(data, 'width');
  imageData.height = parseTiles(data, 'height');
  const tiles = parseTiles(data, 'tiles')[0]; // tiles is index 0 of a singleton?

  const tileData = generateTiles(
    id,
    imageData.width,
    imageData.height,
    tiles,
    tilesIndex
  );
  imageData.urls = getProperty('url', tileData);
  imageData.tiles = getProperty('tile', tileData);

  return imageData;
};

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

export function getTiles(tileData, tileLevel, map) {
  return getImageData(map, tileData, tileLevel);
}

export function getTileSets(maxTileLevel, source, albedoMap, normalMap) {
  let tileLevels = {};

  for (let i = 1; i < maxTileLevel + 1; i++) {
    tileLevels[i] = {
      albedoTiles: getTiles(source, i, albedoMap),
      normalTiles: getTiles(source, i, normalMap),
    };
  }
  return tileLevels;
}

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
