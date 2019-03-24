import {vec2} from 'gl-matrix';

class Intersection
{
	center: vec2 = vec2.create();
	N: boolean;
	NE: boolean;
	E: boolean;
	SE: boolean;
	S: boolean;
	SW: boolean;
	W: boolean;
	NW: boolean;

	constructor(center: vec2)
	{
		this.center = center;
	}
}

export default Intersection;