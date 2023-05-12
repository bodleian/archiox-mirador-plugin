precision highp float;

varying vec2 vUv;
varying mat3 tbn; // Tangent space matrix

uniform sampler2D diffuseMap;
uniform sampler2D normalMap;
uniform vec3 lightDirection;

void main() {
    vec3 normal = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;
    normal = normalize(tbn * normal); // Transforma la normal al espacio mundial
    float intensity = max(dot(normalize(lightDirection), normal), 0.0);
    vec4 diffuseColor = texture2D(diffuseMap, vUv);
    gl_FragColor = vec4(diffuseColor.rgb * intensity, diffuseColor.a);
}