//uniform mat3 normalMatrix;
//attribute vec3 tangent;

varying vec2 vUv; 
varying mat3 tbn;
void main()
{
    vUv = uv; 
    
    vec3 N = vec3(0.0, 0.0, 1.0);
    vec3 T = vec3(1.0, 0.0, 0.0);
    vec3 B = vec3(0.0, 1.0, 0.0);
    tbn = mat3(T, B, N);
    
    /*
    vec3 N = normalize(normalMatrix * normal);
    vec3 T = normalize(normalMatrix * tangent);
    vec3 B = cross(N, T);
    tbn = mat3(T, B, N);
    */

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}