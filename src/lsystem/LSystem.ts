import {vec2, vec3, mat2, mat3} from 'gl-matrix';
import Turtle, {RoadType} from './Turtle';
import ExpansionRule from './ExpansionRule';
import DrawingRule from './DrawingRule';
import {Action} from './DrawingRule';
import Terrain from '../Terrain';
import Population from '../Population';
import RoadSegment from './RoadSegment';
import Intersection from './Intersection';
import PopulationCenter from './PopulationCenter';

import {radians, degrees, angleBetweenLinesInRad} from '../globals';

const HIGHWAY_LENGTH : number = .1;
const ROAD_LENGTH : number = .025;
const RADIUS: number = 0.1;

class LSystem 
{
	axiom: string;
	instance: Turtle;
	turtles: Turtle[];
	expansionRules: Map<string, ExpansionRule>;
	drawingRules: Map<string, DrawingRule>;
	terrain: Terrain;
	highways: RoadSegment[] = [];
	roads: RoadSegment[] = [];
	intersections: Intersection[] = [];
	populationCenters: PopulationCenter[] = [];
	transformations: mat3[] = [];
	populationThreshold: number = 0;

	constructor(populationThreshold: number = 0, seaLevel: number = 0.5)
	{
		this.instance = new Turtle();
		this.terrain = new Terrain(seaLevel);
		this.instance.position = vec2.fromValues(0.0,0.0);
		this.turtles = [this.instance];
		this.populationThreshold = populationThreshold;
	}

	private setup()
	{
		// find population centers
		let threshold = 0.65;
		for (let i = -1+RADIUS; i <= 1-RADIUS; i += RADIUS)
		{
			for (let j = -1+RADIUS; j <= 1-RADIUS; j += RADIUS)
			{
				if (this.terrain.density(vec2.fromValues(i, j)) > threshold)
				{
					let range = 0.25;
					let close = false;
					for (let center of this.populationCenters)
					{
						if (vec2.length(vec2.fromValues(center.position[0]-i, center.position[1]-j)) < range)
						{
							close = true;
							break;
						}
					}
					if (!close) this.populationCenters.push(new PopulationCenter(vec2.fromValues(i, j)));
				}
			}
		}
		if (this.populationCenters.length > 0)
		{
			this.instance.position = this.populationCenters[0].position;
			this.populationCenters[0].visited = true;
			this.instance.roadType = RoadType.Highway;
		}
		else
		{
			this.instance.position = vec2.fromValues(0.0, 0.0);
			this.instance.roadType = RoadType.Road;
		}
		// add intersections
		for (let i = -1; i <= 1+ROAD_LENGTH*4; i += ROAD_LENGTH * 4)
		{
			for (let j = -1; j <= 1+ROAD_LENGTH; j += ROAD_LENGTH)
			{
				this.intersections.push(new Intersection(vec2.fromValues(i, j)));
			}
		}
	}

	// expands the initial axiom the specified number of iterations
	expand()
	{
		this.setup();
		// decide what to build
		if (this.instance.roadType == RoadType.Highway)		// if highway
		{
			// connect centers with highway
			for (let i = 0; i < this.populationCenters.length; i++)
			{
				let center: PopulationCenter;
				let minLength = 3;
				for (let c of this.populationCenters)
				{
					if (c.visited) continue;
					let diff: vec2 = vec2.create();
					vec2.subtract(diff, this.instance.position, c.position);
					let len = vec2.length(diff);
					if (len < minLength)
					{
						minLength = len;
						center = c;
					}
				}
				if (center == null)
				{
					center = this.populationCenters[0];
				}
				center.visited = true;
				// rotate towards this point
				let dir: vec2 = vec2.create();
				vec2.subtract(dir, center.position, this.instance.position);
				if (vec2.equals(dir, vec2.create())) continue; // direction is the zero vector
				vec2.normalize(dir, dir);
				let angle: number = degrees(angleBetweenLinesInRad(vec2.create(), this.instance.orientation, vec2.create(), dir));
				this.instance.rotate(angle);
				// draw highway segments towards this center until reached
				let diff: vec2 = vec2.create();
				vec2.subtract(diff, this.instance.position, center.position);
				let distance: number = vec2.length(diff);
				// add initial road segment
				this.transformations.push(this.instance.transformation());
				this.instance.delay = 5;
				while (distance > RADIUS) // causing infinite loop
				{
					let road = new RoadSegment();
					road.start = vec2.clone(this.instance.position);
					this.instance.translate(HIGHWAY_LENGTH);
					road.end = vec2.clone(this.instance.position);
					this.transformations.push(this.instance.transformation());
					this.highways.push(road);

					vec2.subtract(diff, this.instance.position, center.position);
					distance = vec2.length(diff);
					this.instance.delay--;
				}
				this.instance.translate(HIGHWAY_LENGTH);
			}
		}
		this.connectIntersections();
		return this.transformations;
	}

	connectIntersections()
	{
		let threshold = this.populationThreshold;
		let turtle: Turtle = new Turtle();
		turtle.scale(vec2.fromValues(0.5, 0.5));
		let dir: vec2 = vec2.create();
		for (let intersection of this.intersections)
		{
			turtle.position = intersection.center;
			// check if a North road can be built
			if (this.terrain.density(vec2.clone(intersection.center)) <= threshold)
			{
				continue;
			}
			if (this.terrain.density(vec2.fromValues(intersection.center[0], intersection.center[1] + ROAD_LENGTH * 2)) > threshold)
			{
				intersection.N = true;
				this.transformations.push(turtle.transformation());
			}
			// check if an East road can be built
			if (this.terrain.density(vec2.fromValues(intersection.center[0] + ROAD_LENGTH * 2, intersection.center[1])) > threshold)
			{
				intersection.E = true;
				dir = vec2.fromValues(1.0, 0.0);
				let angle: number = degrees(angleBetweenLinesInRad(vec2.create(), turtle.orientation, vec2.create(), dir));
				turtle.rotate(angle);
				this.transformations.push(turtle.transformation());
			}
			// check if a South road can be built
			if (this.terrain.density(vec2.fromValues(intersection.center[0], intersection.center[1] - ROAD_LENGTH * 2)) > threshold)
			{
				intersection.S = true;
				dir = vec2.fromValues(0.0, -1.0);
				let angle: number = degrees(angleBetweenLinesInRad(vec2.create(), turtle.orientation, vec2.create(), dir));
				turtle.rotate(angle);
				this.transformations.push(turtle.transformation());
			}
			// check if a West road can be built
			if (this.terrain.density(vec2.fromValues(intersection.center[0] - ROAD_LENGTH * 2, intersection.center[1])) > threshold)
			{
				intersection.W = true;
				dir = vec2.fromValues(-1.0, 0.0);
				let angle: number = degrees(angleBetweenLinesInRad(vec2.create(), turtle.orientation, vec2.create(), dir));
				turtle.rotate(angle);
				this.transformations.push(turtle.transformation());
			}
		}
	}
};

export default LSystem;