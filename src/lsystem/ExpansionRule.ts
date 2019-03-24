import {vec3, mat4} from 'gl-matrix';

class ExpansionRule 
{
	rule: string;

	constructor(rule: string)
	{
		this.rule = rule;
	}

	value() : string
	{
		return this.rule;
	}
};

export default ExpansionRule;