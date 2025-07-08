import * as _ from 'lodash';
import { _getProperty, _parseTiles } from '../src/plugins/RelightHelpers';

const expect = require('expect.js');

const testInfoJSON = {
  '@context': 'http://iiif.io/api/image/2/context.json',
  protocol: 'http://iiif.io/api/image',
  width: 3208,
  height: 4260,
  sizes: [
    {
      width: 100,
      height: 133,
    },
    {
      width: 200,
      height: 266,
    },
    {
      width: 401,
      height: 532,
    },
    {
      width: 802,
      height: 1065,
    },
    {
      width: 1604,
      height: 2130,
    },
  ],
  tiles: [
    {
      width: 256,
      height: 256,
      scaleFactors: [32, 16, 8, 4, 2, 1],
    },
  ],
  '@id':
    'https://iiif.bodleian.ox.ac.uk/iiif/image/a469e838-9448-4d99-bcac-d35868cb5e1f',
  profile: [
    'http://iiif.io/api/image/2/level2.json',
    {
      formats: ['jpg', 'png', 'webp'],
      qualities: ['native', 'color', 'gray', 'bitonal'],
      supports: [
        'regionByPct',
        'regionSquare',
        'sizeByForcedWh',
        'sizeByWh',
        'sizeAboveFull',
        'sizeUpscaling',
        'rotationBy90s',
        'mirroring',
      ],
      maxWidth: 4000,
      maxHeight: 4000,
    },
  ],
  crossOriginPolicy: 'Anonymous',
  ajaxWithCredentials: false,
  useCanvas: true,
  version: 2,
  tileFormat: 'jpg',
  scale_factors: [32, 16, 8, 4, 2, 1],
  events: {},
  tileSizePerScaleFactor: {},
  maxLevel: 5,
  ready: true,
  aspectRatio: 0.7530516431924883,
  dimensions: {
    x: 3208,
    y: 4260,
  },
  _tileWidth: 256,
  _tileHeight: 256,
  tileOverlap: 0,
  minLevel: 0,
};

const testTileData = [
  { url: 'foo', tile: { w: 1, h: 1, x: 1, y: 1 } },
  { url: 'foo', tile: { w: 1, h: 1, x: 1, y: 1 } },
];

describe('Tests _getProperty function against various cases', function () {
  it('should return an array of values from specified property', function () {
    const isValid = _getProperty('url', testTileData);
    expect(_.isEqual(isValid, ['foo', 'foo'])).to.be(true);
  });

  it('should return null from a property that doesnt exist', function () {
    const isValid = _getProperty('width', testTileData);
    expect(isValid).to.be(null);
  });

  it('should return null from an incompatible data type', function () {
    const isValid = _getProperty('width', testInfoJSON);
    expect(isValid).to.be(null);
  });
});

describe('Tests _parseTiles function against various cases', function () {
  it('should return a value from specified property', function () {
    const isValid = _parseTiles(testInfoJSON, 'width');
    expect(isValid).to.be(3208);
  });

  it('should return null from a property not in top level', function () {
    const isValid = _parseTiles(testInfoJSON, 'supports');
    expect(isValid).to.be(null);
  });
});
