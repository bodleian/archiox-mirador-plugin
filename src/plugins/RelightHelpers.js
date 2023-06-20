/**
 * Generates an object containing a full tile pyramid. Mirador only generates the parts that are needed
 * as they are loaded in, so you cannot access the full pyramid until all the tiles have loaded.  We need the
 * full data structure earlier so here we calculate it.  The algorithm is based on Tom Crane's tile-exploder
 * @param {string} id IIIF image resource id
 * @param {number} width width of the image resource at a particular scale factor
 * @param {number} height height of the image resource at a particular scale factor
 * @param {object} tileSource object containing information parsed out from the image info.json in the manifest
 * @param {number} scaleFactor the scaleFactor you want to generate tiles for
 * @returns {{}} an array of objects containing IIIF image tile URLs with tile dimensions
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
  imageData.width = _parseTiles(data, 'width');
  imageData.height = _parseTiles(data, 'height');
  const tiles = _parseTiles(data, 'tiles')[0]; // tiles is index 0 of a singleton

  const tileData = generateTiles(
    id,
    imageData.width,
    imageData.height,
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

export const vertexShader = `// -----------------------------------------------------------------------------------------------------------------------------
// Built-in uniforms and attributes
// More information: https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
// -----------------------------------------------------------------------------------------------------------------------------
// uniform mat4 modelMatrix;        = object.matrixWorld
//                                  The transformation matrix that converts vertices from local/model space to world space. 
//
// uniform mat4 modelViewMatrix;    = camera.matrixWorldInverse * object.matrixWorld
//                                  = viewMatrix * modelMatrix
//                                  The combined transformation matrix that converts vertices from local/model space to view/eye/camera space, 
//                                  taking into account both the model and view transformations.
//
// uniform mat4 projectionMatrix;   = camera.projectionMatrix
//                                  Transform the 3D coordinates of an object in view/eye/camera space to 2D screen coordinates. 
//
// uniform mat4 viewMatrix;         = camera.matrixWorldInverse
//                                  The transformation matrix that converts vertices from world space to camera view space, 
//                                  representing the position and orientation of the camera.
//
// uniform mat3 normalMatrix;       = inverse transpose of modelViewMatrix
//                                  The inverse transpose of the modelViewMatrix, used for transforming surface normals from 
//                                  object space to eye space while accounting for non-uniform scaling and rotation of the object.
//
// uniform vec3 cameraPosition;     Camera position in world space
//
// uniform bool isOrthographic;     A boolean value indicating whether the camera is using an orthographic projection (true)
//                                  or a perspective projection (false).
//
// -----------------------------------------------------------------------------------------------------------------------------
// default vertex attributes
// -----------------------------------------------------------------------------------------------------------------------------
// attribute vec3 position;         The attribute representing the position of a vertex in 3D space (provided by BufferGeometry)
// attribute vec3 normal;           The attribute representing the normal vector of a vertex, which defines its orientation in
//                                  3D space (provided by BufferGeometry)
// attribute vec2 uv;               The attribute representing the texture coordinates (UV coordinates) of a vertex, used for
//                                  mapping textures onto the surface of a 3D model (provided by BufferGeometry)
//
//
// Chain of transformations while working with normal mapping
//
// Tangent Space <-> Model (local) Space <-> World Space <-> View Space (eye or camera space) <-> Clip Space
//
// -----------------------------------------------------------------------------------------------------------------------------
precision highp float;

uniform vec3 lightPosition; // Position of the light in world space. This is a uniform, so its value is constant across all vertices.

varying vec2 vUv;           // UV coordinates for texturing. These are 2D coordinates that are used for mapping textures onto geometry.
varying vec3 vNormal;       // Vertex normal vector, transformed to camera space using the normalMatrix.
varying vec3 vViewPosition; // Vertex position in camera view space with inverted coordinates. This is the vertex position transformed by the modelViewMatrix, and then inverted.
varying vec3 vLightRay;     // Vector from the vertex position to the light position, both in camera space.

void main() {
    vNormal = normalize(normalMatrix * normal);
    // Transforms the vertex position to camera space
    vec4 vertexPositionCameraSpace = modelViewMatrix * vec4(position, 1.0);
    // Transforms the light position to camera space
    vec4 lightPositionCameraSpace = modelViewMatrix * vec4(lightPosition, 1.0);
   // Calculates the vector from the vertex to the light in camera space. This will be interpolated in the fragment shader to approximate the direction from each fragment to the light.
    vLightRay = lightPositionCameraSpace.xyz - vertexPositionCameraSpace.xyz;
    gl_Position = projectionMatrix * vertexPositionCameraSpace;
    vUv = uv;
    vViewPosition = -vertexPositionCameraSpace.xyz;
}
`;

export const fragmentShader = `// -----------------------------------------------------------------------------------------------------------------------------
// Built-in uniforms and attributes
// More information: https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
// -----------------------------------------------------------------------------------------------------------------------------
// uniform mat4 viewMatrix;         = camera.matrixWorldInverse
//                                  The transformation matrix that converts vertices from world space to camera view space, 
//                                  representing the position and orientation of the camera.
//
// uniform vec3 cameraPosition;     Camera position in world space
//
// -----------------------------------------------------------------------------------------------------------------------------
precision highp float;

mat3 cotangentFrame_8_1(vec3 N, vec3 p, vec2 uv) {  
    // get edge vectors of the pixel triangle 
    vec3 dp1 = dFdx(p);
    vec3 dp2 = dFdy(p);
    vec2 duv1 = dFdx(uv);
    vec2 duv2 = dFdy(uv);  
    // solve the linear system  
    vec3 dp2perp = cross(dp2, N);
    vec3 dp1perp = cross(N, dp1);
    vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
    vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;  
    // construct a scale-invariant frame   
    float invmax = 1.0 / sqrt(max(dot(T, T), dot(B, B)));
    return mat3(T * invmax, B * invmax, N);
}
vec3 perturb_4_2(vec3 map, vec3 N, vec3 V, vec2 texcoord) {
    mat3 TBN = cotangentFrame_8_1(N, -V, texcoord);
    return normalize(TBN * map);
}

vec4 getTexture(sampler2D uTex, vec2 uv) {
    return texture2D(uTex, uv);
}

varying vec3 vNormal;           // Fragment normal (interpolated per-vertex)
varying vec2 vUv;               // Fragment UV coordinates (interpolated per-vertex)
varying vec3 vViewPosition;     // Fragment position in camera view space, with inverted coordinates (interpolated per-vertex)
varying vec3 vLightRay;

uniform vec2 iResolution;    // Window size pixels
uniform float iTime;
uniform float iTimeDelta;

uniform vec3 lightColor;        // Color of the light source
uniform vec3 ambientColor;      // Ambient color of the light source
uniform float lightFalloff;     // Fallof of the light source
uniform float lightRadius;      // Radius of the light source

uniform sampler2D texDiffuse;   // Diffuse texture
uniform sampler2D texNormal;    // Normal texture

uniform bool useDiffuseTexture;

uniform float material_param_0;
uniform float material_param_1;
uniform float material_param_2;
uniform float material_param_3;

uniform float material_param_4;

uniform float param_2;// 1.0 - 0 a 10
uniform float param_3;// 0.09 - 1.0
uniform float param_4;// 0.032 - 
uniform float param_5;
uniform float param_6;
uniform float param_7;

varying vec3 vVertexPosition;   // Vertex position in camera space
varying vec3 vLightPosition;    // Light position in camera space

float calculateLambertian(vec3 normalDir, vec3 lightDir) {
    return max(dot(normalDir, normalize(lightDir)), 0.0);
}

float calculateSpecular(vec3 lightDir, vec3 viewDir, vec3 normal, float shininess) {
    vec3 reflectDir = reflect(-lightDir, normal);
    float specularIntensity = max(dot(reflectDir, viewDir), 0.0);
    specularIntensity = pow(specularIntensity, shininess);
    return specularIntensity;
}

//--------------------------------------------------------------------------------------------------------------------------------
// LIGHT ATTENUATION
//--------------------------------------------------------------------------------------------------------------------------------
float attenuation_1_5(float radius, float falloff, float distance) {
    float denom = distance / radius + 1.0;
    float attenuation = 1.0 / (denom * denom);
    float t = (attenuation - falloff) / (1.0 - falloff);
    return max(t, 0.0);
}

float calculateSimpleAttenuation(float distance, float dmax) {
    return (1.0 - min(distance / dmax, 1.0)) * (1.0 - min(distance / dmax, 1.0));
}

float calculateLinearAttenuation(float distance, float constant, float linear, float quadratic) {
    // Compute the attenuation factor using the linear attenuation formula
    float attenuation = 1.0 / (constant + linear * distance + quadratic * distance * distance);

    // Clamp the attenuation factor to [0, 1] range
    attenuation = clamp(attenuation, 0.0, 1.0);

    return attenuation;
}

void main() {
    float shininess = material_param_1;
    float specularScale = material_param_2;
    float specularStrength = material_param_3;

    // Set colors
    vec3 diffuseColor = vec3(0.6, 0.6f, 0.6f);
    vec3 specularColor = vec3(1.0f);

    // Setup light direction and eye direction
    vec3 L = normalize(vLightRay);
    vec3 V = normalize(vViewPosition);

    // Get vertex normal
    vec3 normal = vNormal;

    // Get textures
    vec2 uv = vUv;
    if(useDiffuseTexture)
        diffuseColor = getTexture(texDiffuse, uv).rgb;

    vec3 normalMap = getTexture(texNormal, uv).rgb;
    normalMap = normalMap * 2.0 - 1.0;

    normalMap = normalize(normalMap);
    normalMap.x *= material_param_4;
    normalMap.y *= material_param_4;

    normalMap = normalize(normalMap);

    // Compute final normal (vertex + normal map)
    vec3 N = perturb_4_2(normalMap, normal, -V, uv);  // Surface normal  

    // Compute diffuse and specular values
    float diff = calculateLambertian(N, L);
    float spec = calculateSpecular(L, V, N, shininess);

    // Compute light attenuation (linear eq.)
    float distance = length(vLightRay);   // Distance from light to fragment
    float constant = param_2;   // 1.0 - 0 a 10
    float linear = param_3;     // 0.09 - 1.0
    float quadratic = param_4;    // 0.032 - 
    float falloff = calculateLinearAttenuation(distance, constant, linear, quadratic);

    /*
    // Compute light attenuation (two-params version)
    float distance = length(vLightRay);
    float lRadius = param_5;
    float lFalloff = param_6;
    float falloff = attenuation_1_5(lRadius, lFalloff, distance);

    
    // Compute light attenuation (one-param version)
    float distance = length(vLightRay);
    float maxDistance = param_7;
    float falloff = calculateSimpleAttenuation(distance, maxDistance);
     */   

    // Compute new diffuse and specular values with attenuation
    float specAtten = specularStrength * spec * specularScale * falloff;  // specularStrength could be defined using a map
    float diffAtten = diff * falloff;

    vec3 ambient = ambientColor;
    vec3 diffuse = lightColor * diffAtten;

    // Add the lighting 
    vec3 color = vec3(0);
    color += diffuseColor * (diffuse + ambient) + specAtten;

    gl_FragColor.rgb = vec3(color);
    gl_FragColor.a = 1.0;
}


/*
    float Ka = 0.0;   // Ambient reflection coefficient
    float Kd = 0.7;   // Diffuse reflection coefficient
    float Ks = 0.35;   // Specular reflection coefficient
    vec3 ambientColor = vec3(0.0f, 0.0f, 0.0f);
    vec3 diffuseColor = vec3(0.55f);
    vec3 specularColor = vec3(1.0f);
    vec3 a = Ka * ambientColor;
    vec3 d = Kd * lambertian * diffuseColor;
    vec3 s = Ks * specular * specularColor;
*/
`;
