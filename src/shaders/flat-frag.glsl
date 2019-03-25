#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;
uniform int u_TerrainType;
uniform int u_PopulationType;
uniform float u_SeaLevel;

in vec2 fs_Pos;

out vec4 out_Col;

const mat2 m2 = mat2( 0.80, -0.60, 0.60, 0.80 );

float random1(in vec2 st) {
    return fract(sin(dot(st,
                         vec2(3.7898,6.5333)))*7.5453123);
}

float random2(in vec2 st) {
    return fract(sin(dot(st,
                         vec2(2.7898,4.6969)))*4.12345);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise1 (in vec2 st) {
	vec2 i = floor(st);
    vec2 f = fract(st);
    float a, b, c, d;

    // Four corners in 2D of a tile
    a = random1(i);
    b = random1(i + vec2(1.0, 0.0));
    c = random1(i + vec2(0.0, 1.0));
    d = random1(i + vec2(1.0, 1.0));
	

    vec2 u = f;// * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float noise2(in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a, b, c, d;

    // Four corners in 2D of a tile
    a = random2(i);
    b = random2(i + vec2(1.0, 0.0));
    c = random2(i + vec2(0.0, 1.0));
    d = random2(i + vec2(1.0, 1.0));
	

    vec2 u = f;// * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float terrain(in vec2 x)
{
    float f = 1.9;
    float s = 0.55;
    float a = 0.0;
    float b = 0.5;
    for (int i=0; i<8; i++)
    {
        float n = noise1(x);
        a += b*n;
        b *= s;
        // x = f*m2*x;
        x = f*x;
    }
	return a;
}

float population(in vec2 x)
{
    float f = 1.9;
    float s = 0.55;
    float a = 0.0;
    float b = 0.5;
    for( int i=0; i<8; i++ )
    {
        float n = noise2(x);
        a += b*n;
        b *= s;
        // x = f*m2*x;
        x = f*x;
    }
	return a;
}

bool showTerrain = false;
bool simpleTerrain = false;
bool showPopulation = true;
bool simplePopulation = true;

void setProperties()
{
  showTerrain = u_TerrainType == 0 || u_TerrainType == 1;
  simpleTerrain = u_TerrainType == 1;
  showPopulation = u_PopulationType == 0 || u_PopulationType == 1;
  simplePopulation = u_PopulationType == 1;
}


vec4 getTerrainColor(float height)
{
	vec4 color;
	if (height < u_SeaLevel)
	{
		return simpleTerrain ? vec4(0.0, 0.0, 0.9, 1.0) : 
			   mix(vec4(0.0, 0.0, 0.05, 1.0), vec4(0.0, 0.0, 1.0, 1.0), height);
	}
	else
	{
		return simpleTerrain ? vec4(0.0, 0.6, 0.0, 1.0) :
		       mix(vec4(0.0, 0.1, 0.0, 1.0), vec4(0.0, 1.0, 0.0, 1.0), height);
	}
}

void main() {
  setProperties();
  vec2 terrainSeed = vec2(3.33, 6);
  vec2 populationSeed = vec2(6.53, 4.123);  
  float height = terrain(fs_Pos + terrainSeed);
  float density = population(fs_Pos + populationSeed);
  if (height < u_SeaLevel) density = 0.0;
  vec4 color = vec4(0.0);
  if (showTerrain)
  {
  	color += getTerrainColor(height);
  }
  if (showPopulation)
  {
    if (simplePopulation) density = float(int(density * 10.0) % 10) / 10.0;
  	color = mix(color, vec4(1.0, 0.0, 0.0, 1.0), density);
  }
  out_Col = color;
}
