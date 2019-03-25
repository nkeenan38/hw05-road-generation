import {vec2} from 'gl-matrix';

class PopulationCenter
{
	position: vec2 = vec2.create();
	visited: boolean;

	constructor(position: vec2)
	{
		this.position = position;
	}
}

export default PopulationCenter;