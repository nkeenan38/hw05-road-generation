import {vec3, mat4} from 'gl-matrix';

export enum Action { Push, Pop, Highway, ExitN, ExitS, RoadLeft, RoadRight, RoadForward }

class DrawingRule 
{
	private action: Action;

	constructor(action: Action)
	{
		this.action = action;
	}

	value() : Action
	{
		return this.action;
	}
};

export default DrawingRule;