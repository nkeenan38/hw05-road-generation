// #version 300 es
// precision highp float;

// uniform vec3 u_Eye, u_Ref, u_Up;
// uniform vec2 u_Dimensions;
// uniform float u_Time;

// in vec2 fs_Pos;

// out vec4 out_Col;
import {vec2, vec3, mat2, mat3} from 'gl-matrix';
import {mix} from './globals';


const m2 = mat2.fromValues( 0.80, -0.60, 0.60, 0.80 );

class Terrain
{
	seaLevel: number;

	constructor(seaLevel: number)
	{
		this.seaLevel = seaLevel;
	}

	random1(st: vec2) : number
	{
	    let v = Math.sin(vec2.dot(st,
	                         vec2.fromValues(3.7898,6.5333)))*7.5453123;
	    return v - Math.floor(v);
	}

	random2(st: vec2) : number
	{
	    let v = Math.sin(vec2.dot(st,
	                         vec2.fromValues(2.7898,4.6969)))*4.12345;
	    return v - Math.floor(v);
	}

	// Based on Morgan McGuire @morgan3d
	// https://www.shadertoy.com/view/4dS3Wd
	noise1(st : vec2) : number
	{
		let i: vec2 = vec2.create();
		vec2.floor(i, st);
		let f: vec2 = vec2.create();
	    vec2.subtract(f, st, i);

	    // Four corners in 2D of a tile
	    let val = vec2.create();
	    let a = this.random1(i);
	    let b = this.random1(vec2.add(val, i, vec2.fromValues(1.0, 0.0)));
	    let c = this.random1(vec2.add(val, i, vec2.fromValues(0.0, 1.0)));
	    let d = this.random1(vec2.add(val, i, vec2.fromValues(1.0, 1.0)));
		
		let u = f;		
	    // let u = vec2.create();
	    // u[0] = f[0] * f[0] * (3.0 - 2.0 * f[0]);
	    // u[1] = f[1] * f[1] * (3.0 - 2.0 * f[1]);

	    return mix(a, b, u[0]) +
	            (c - a)* u[1] * (1.0 - u[0]) +
	            (d - b) * u[0] * u[1];
	}

	noise2(st : vec2) : number
	{
		let i: vec2 = vec2.create();
		vec2.floor(i, st);
		let f: vec2 = vec2.create();
	    vec2.subtract(f, st, i);

	    // Four corners in 2D of a tile
	    let val = vec2.create();
	    let a = this.random2(i);
	    let b = this.random2(vec2.add(val, i, vec2.fromValues(1.0, 0.0)));
	    let c = this.random2(vec2.add(val, i, vec2.fromValues(0.0, 1.0)));
	    let d = this.random2(vec2.add(val, i, vec2.fromValues(1.0, 1.0)));
		
		let u = f;
	    // let u = vec2.create();
	    // u[0] = f[0] * f[0] * (3.0 - 2.0 * f[0]);
	    // u[1] = f[1] * f[1] * (3.0 - 2.0 * f[1]);

	    return mix(a, b, u[0]) +
	            (c - a)* u[1] * (1.0 - u[0]) +
	            (d - b) * u[0] * u[1];
	}

	terrain(x: vec2) : number
	{
		// let terrainSeed = vec2.fromValues(33.33, 67);
	    let f = 1.9;
	    let s = 0.55;
	    let a = 0.0;
	    let b = 0.5;
	    for (let i=0; i<8; i++)
	    {
	        let n = this.noise1(x);
	        a += b*n;
	        b *= s;
	        // x = f*m2*x;
	        // x[0] = m2[0]*x[0] + m2[2]*x[1];
	        // x[1] = m2[1]*x[0] + m2[3]*x[1];
	        x[0] *= f;
	        x[1] *= f;
	    }
		return a;
	}

	population(x: vec2) : number
	{
	    let f = 1.9;
	    let s = 0.55;
	    let a = 0.0;
	    let b = 0.5;
	    for (let i=0; i<8; i++)
	    {
	        let n = this.noise2(x);
	        a += b*n;
	        b *= s;
	        // // x = f*m2*x;
	        // x[0] = m2[0]*x[0] + m2[2]*x[1];
	        // x[1] = m2[1]*x[0] + m2[3]*x[1];
	        x[0] *= f;
	        x[1] *= f;
	    }
		return a;
	}

	density(x: vec2) : number
	{
		let terrainSeed = vec2.fromValues(3.33, 6);
  		let populationSeed = vec2.fromValues(6.53, 4.123);	
  		let tval = vec2.create();
  		vec2.add(tval, terrainSeed, x);
  		let pval = vec2.create();
  		vec2.add(pval, populationSeed, x);
		let t = this.terrain(tval);
		if (t < this.seaLevel) return 0;
		else
		 return this.population(pval);
	}
}

export default Terrain;
