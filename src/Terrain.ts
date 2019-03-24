import {vec2, vec3, mat2, mat4} from 'gl-matrix';

const m2 : mat2 = mat2.fromValues(0.80, -0.60, 0.60, 0.80);
const SEA_LEVEL : number = 0.5;

class Terrain
{
	private heightMap : number[][];
	private dimensions : vec2;

	constructor()
	{
		// this.dimensions = dimensions;
		// this.heightMap = [];
		// for (var i = 0; i < dimensions[0]; i++)
		// {
		// 	this.heightMap.push([]);
		// 	for (var j = 0; j < dimensions[1]; j++)
		// 	{
		// 		this.heightMap[i][j] = this.fbm(vec2.fromValues(i, j));
		// 	}
		// }
	}

	mix(a: number, b: number, t: number)
	{
		return (1 - t)*a + (t * b);
	}

	rand(st: vec2) : number
	{
	    var val = Math.sin(vec2.dot(st, vec2.fromValues(311.7898,65.5333)))*65537.5453123;
	    return val - Math.floor(val); // fract(val)
	}

	noise(st: vec2) : number
	{
		var i : vec2 = vec2.fromValues(0.0, 0.0);
		var f : vec2 = vec2.fromValues(0.0, 0.0);
	    vec2.floor(i, st);
	    vec2.subtract(f, st, i); // fract of st

	    // Four corners in 2D of a tile
	    var a = this.rand(i);
	    var b = this.rand(vec2.add(i, i, vec2.fromValues(1.0, 0.0)));
	    var c = this.rand(vec2.add(i, i, vec2.fromValues(0.0, 1.0)));
	    var d = this.rand(vec2.add(i, i, vec2.fromValues(1.0, 1.0)));
		
	    // vec2 u = f * f * (3.0 - 2.0 * f);
	    var u : vec2 = vec2.fromValues(0.0, 0.0);
	    u[0] = f[0] * f[0] * (3.0 - 2.0 * f[0]);
	    u[1] = f[1] * f[1] * (3.0 - 2.0 * f[1]);

	    return this.mix(a, b, u[0]) +
	           (c - a)* u[1] * (1.0 - u[0]) +
	           (d - b) * u[0] * u[1];
	}

	fbm(st: vec2) : number
	{
	    var f = 1.9;
	    var s = 0.55;
	    var a = 0.0;
	    var b = 0.5;
	    for (var i = 0; i < 8; i++)
	    {
	        var n = this.noise(st);
	        a += b*n;
	        b *= s;
	        // st = f * this.m2 * st;
	        st[0] = m2[0] * st[0] + m2[2] * st[1];
	        st[1] = m2[1] * st[0] + m2[3] * st[1];
	        st[0] = f * st[0];
	        st[1] = f * st[1];
	        // st = vec2.transformMat2(st, st, m2);
	        // st = vec2.scale(st, st, f);
	    }
		return a;
	}

	getElevation(position: vec2) : number
	{
		// if (position[0] < 0 || position[0] > this.dimensions[0] || position[1] < 0 || position[1] > this.dimensions[1])
		// {
		// 	throw "Elevation Out of Range";
		// }
		// return this.heightMap[position[0]][position[1]];
	    let terrain = vec2.fromValues(33.33, 67);
	    vec2.add(terrain, position, terrain);
		return this.fbm(terrain);
	}
};

export default Terrain;