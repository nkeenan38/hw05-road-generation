import {vec2} from 'gl-matrix';

class RoadSegment
{
	start : vec2 = vec2.create();
	end : vec2 = vec2.create();

	static getLineIntersection(r1: RoadSegment, r2: RoadSegment) : [boolean, vec2]
	{
	    let s1: vec2 = vec2.create(), s2: vec2 = vec2.create();
	    s1[0] = r1.end[0] - r1.start[0];     
	    s1[1] = r1.end[1] - r2.start[1];
	    s2[0] = r2.end[0] - r2.start[0];
	    s2[1] = r2.end[1] - r2.start[1];

	    let s, t;
	    s = (-s1[1] * (r1.start[0] - r2.start[0]) + s1[0] * (r1.start[1] - r2.start[1])) / (-s2[0] * s1[1] + s1[0] * s2[1]);
	    t = ( s2[0] * (r1.start[1] - r2.start[1]) - s2[1] * (r1.start[0] - r2.start[0])) / (-s2[0] * s1[1] + s1[0] * s2[1]);

	    if (s > 0 && s < 1 && t > 0 && t < 1)
	    {
	        // Collision detected
	        let intersection: vec2 = vec2.create();
	        intersection[0] = r1.start[0] + (t * s1[0]);
	        intersection[1] = r1.start[1] + (t * s1[1]);
	        return [true, intersection];
	    }

	    return [false, null]; // No collision
	}
};

export default RoadSegment;