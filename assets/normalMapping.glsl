precision highp float;

varying vec2 vUv;

uniform sampler2D diffuseMap;
uniform sampler2D normalMap;
uniform vec3 lightDirection;

void main() {
    // Refs: https://learnopengl.com/Advanced-Lighting/Normal-Mapping
    vec3 normal = normalize(texture2D(normalMap, vUv).rgb * 2.0 - 1.0);
    float intensity = max(dot(normalize(lightDirection), normal), 0.0);
    vec4 diffuseColor = texture2D(diffuseMap, vUv);
    //vec4 diffuseColor = vec4(0.5,0.5,0.5,1.0);
    gl_FragColor = vec4(diffuseColor.rgb * intensity, diffuseColor.a);
}