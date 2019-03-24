import {vec2, vec3, mat2, mat3} from 'gl-matrix';
import Turtle, {RoadType} from './Turtle';
import ExpansionRule from './ExpansionRule';
import DrawingRule from './DrawingRule';
import {Action} from './DrawingRule';
import Terrain from '../Terrain';
import Population from '../Population';
import RoadSegment from './RoadSegment';
import Intersection from './Intersection';

import {radians, degrees, angleBetweenLinesInRad} from '../globals';

const HIGHWAY_LENGTH : number = .1;
const ROAD_LENGTH : number = .025;
const SEA_LEVEL : number = 0.5;
const RADIUS: number = 0.1;

class LSystem 
{
	axiom: string;
	instance: Turtle;
	turtles: Turtle[];
	expansionRules: Map<string, ExpansionRule>;
	drawingRules: Map<string, DrawingRule>;
	terrain: Terrain;
	population: Population;
	highways: RoadSegment[] = [];
	roads: RoadSegment[] = [];
	intersections: Intersection[] = []
	populationCenters: vec2[] = []
	transformations: mat3[] = []

	constructor(axiom: string,
				expansionRules: Map<string, ExpansionRule>, 
				drawingRules: Map<string, DrawingRule>)
	{
		this.axiom = axiom;
		this.instance = new Turtle();
		this.population = new Population();
		this.terrain = new Terrain();
		this.instance.position = vec2.fromValues(0.0,0.0);
		this.turtles = [this.instance];
		this.expansionRules = expansionRules;
		this.drawingRules = drawingRules;
	}

	private setup()
	{
		// find population centers
		let threshold = 0.7;
		for (let i = -1+RADIUS; i <= 1-RADIUS; i += RADIUS)
		{
			for (let j = -1+RADIUS; j <= 1-RADIUS; j += RADIUS)
			{
				if (this.population.getDensity(vec2.fromValues(i, j)) > threshold &&
					this.terrain.getElevation(vec2.fromValues(i, j)) > SEA_LEVEL)
				{
					this.populationCenters.push(vec2.fromValues(i, j));
				}
			}
		}
		this.populationCenters.push(vec2.fromValues(-0.25, 0.5));
		this.populationCenters.push(vec2.fromValues(0.5, 0.25));
		if (this.populationCenters.length > 0)
		{
			this.instance.position = this.populationCenters[0];
			this.instance.roadType = RoadType.Highway;
		}
		else
		{
			this.instance.position = vec2.fromValues(0.0, 0.0);
			this.instance.roadType = RoadType.Road;
		}
		// add intersections
		for (let i = -1; i <= 1; i += ROAD_LENGTH * 4)
		{
			for (let j = -1; j <= 1; j += ROAD_LENGTH)
			{
				this.intersections.push(new Intersection(vec2.fromValues(i, j)));
			}
		}
	}

	// expands the initial axiom the specified number of iterations
	expand(iterations: number)
	{
		this.setup();
		for (var i = 0; i < iterations; i++)
		{
			// decide what to build
			if (this.instance.roadType == RoadType.Highway)		// if highway
			{
				// decide whether to continue (are there large population centers not yet connected?)
				for (let center of this.populationCenters)
				{
					let connected: boolean = false;
					for (let highway of this.highways)
					{
						let diff: vec2 = vec2.create();
						vec2.subtract(diff, highway.start, center);
						let distance = vec2.length(diff);
						if (distance < RADIUS)
						{
							// a highway is already at this center
							connected = true;
							break;
						}
						// vec2.subtract(diff, highway.end, center);
						// distance = vec2.length(diff);
						// if (distance < HIGHWAY_LENGTH)
						// {
						// 	// a highway is already at this center
						// 	connected = true;
						// 	break;
						// }
					}
					if (!connected)
					{
						// this.instance.position = vec2.fromValues(0.0, 0.0);
						// rotate towards this point
						let dir: vec2 = vec2.create();
						vec2.subtract(dir, center, this.instance.position);
						if (vec2.equals(dir, vec2.create())) continue; // direction is the zero vector
						vec2.normalize(dir, dir);
						let angle: number = degrees(angleBetweenLinesInRad(vec2.create(), this.instance.orientation, vec2.create(), dir));
						this.instance.rotate(angle);
						// draw highway segments towards this center until reached
						let diff: vec2 = vec2.create();
						vec2.subtract(diff, this.instance.position, center);
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

							vec2.subtract(diff, this.instance.position, center);
							distance = vec2.length(diff);
							this.instance.delay--;

							// if (this.instance.delay == 0)// decide whether to create road branches
							// {
							// 	// decide direction(s)
							// 	var exit = Turtle.clone(this.instance);
							// 	exit.scale(vec2.fromValues(0.5, 0.5));
							// 	exit.rotate(90);
							// 	exit.snapToGrid();
							// 	this.transformations.push(exit.transformation());
							// 	exit.translate(ROAD_LENGTH);
							// 	if (exit.angle == 90 || exit.angle == 270)
							// 	{
							// 		this.transformations.push(exit.transformation());
							// 		exit.translate(ROAD_LENGTH);
							// 	}
							// 	var exit2 = Turtle.clone(this.instance);
							// 	exit2.scale(vec2.fromValues(0.5, 0.5));
							// 	exit2.rotate(-90);
							// 	exit2.snapToGrid();
							// 	this.transformations.push(exit2.transformation());
							// 	exit2.translate(ROAD_LENGTH);
							// 	if (exit2.angle == 90 || exit2.angle == 270)
							// 	{
							// 		this.transformations.push(exit2.transformation());
							// 		exit2.translate(ROAD_LENGTH);
							// 	}
							// 	this.instance.delay = 5;
							// 	this.buildRoad(exit);
							// 	this.buildRoad(exit2);
							// }
						}
						this.instance.translate(HIGHWAY_LENGTH);
					}
				}
			}
			else if (this.instance.roadType == RoadType.Road)	// if road
			{
				// decide whether to continue (is there still population around?)
					// decide where to go
				// decide whether to create road branches (is delay == 0)
					// decide where to go
			}
			this.connectIntersections();
		}
		return this.transformations;
	}

	connectIntersections()
	{
		let turtle: Turtle = new Turtle();
		turtle.scale(vec2.fromValues(0.5, 0.5));
		let dir: vec2 = vec2.create();
		for (let intersection of this.intersections)
		{
			turtle.position = intersection.center;
			// check if a North road can be built
			if (this.population.getDensity(vec2.fromValues(intersection.center[0], intersection.center[1] + ROAD_LENGTH)) > 0.25
				&& this.terrain.getElevation(vec2.fromValues(intersection.center[0], intersection.center[1] + ROAD_LENGTH)) > SEA_LEVEL)
			{
				intersection.N = true;
				this.transformations.push(turtle.transformation());
			}
			// check if an East road can be built
			if (this.population.getDensity(vec2.fromValues(intersection.center[0] + ROAD_LENGTH, intersection.center[1])) > 0.25
				&& this.terrain.getElevation(vec2.fromValues(intersection.center[0] + ROAD_LENGTH, intersection.center[1])) > SEA_LEVEL)
			{
				intersection.E = true;
				dir = vec2.fromValues(1.0, 0.0);
				let angle: number = degrees(angleBetweenLinesInRad(vec2.create(), turtle.orientation, vec2.create(), dir));
				turtle.rotate(angle);
				this.transformations.push(turtle.transformation());
			}
			// check if a South road can be built
			if (this.population.getDensity(vec2.fromValues(intersection.center[0], intersection.center[1] - ROAD_LENGTH)) > 0.25
				&& this.terrain.getElevation(vec2.fromValues(intersection.center[0], intersection.center[1] - ROAD_LENGTH)) > SEA_LEVEL)
			{
				intersection.S = true;
				dir = vec2.fromValues(0.0, -1.0);
				let angle: number = degrees(angleBetweenLinesInRad(vec2.create(), turtle.orientation, vec2.create(), dir));
				turtle.rotate(angle);
				this.transformations.push(turtle.transformation());
			}
			// check if a West road can be built
			if (this.population.getDensity(vec2.fromValues(intersection.center[0] - ROAD_LENGTH, intersection.center[1])) > 0.25
				&& this.terrain.getElevation(vec2.fromValues(intersection.center[0] - ROAD_LENGTH, intersection.center[1])) > SEA_LEVEL)
			{
				intersection.W = true;
				dir = vec2.fromValues(-1.0, 0.0);
				let angle: number = degrees(angleBetweenLinesInRad(vec2.create(), turtle.orientation, vec2.create(), dir));
				turtle.rotate(angle);
				this.transformations.push(turtle.transformation());
			}
		}
	}

	buildRoad(turtle: Turtle, first: boolean = true)
	{
		// forward
		let forward : Turtle = Turtle.clone(turtle);
		this.transformations.push(forward.transformation());
		forward.translate(ROAD_LENGTH);
		if (forward.angle == 90 || forward.angle == 270)
		{
			this.transformations.push(forward.transformation());
			forward.translate(ROAD_LENGTH);
		}
		// left
		let left : Turtle = Turtle.clone(turtle);
		left.rotate(90);
		this.transformations.push(left.transformation());
		left.translate(ROAD_LENGTH);
		if (left.angle == 90 || left.angle == 270)
		{
			this.transformations.push(left.transformation());
			left.translate(ROAD_LENGTH);
		}
		// right
		let right : Turtle = Turtle.clone(turtle);
		right.rotate(-90);
		this.transformations.push(right.transformation());
		right.translate(ROAD_LENGTH);
		if (right.angle == 90 || right.angle == 270)
		{
			this.transformations.push(right.transformation());
			right.translate(ROAD_LENGTH);
		}
		if (first)
		{
			this.buildRoad(forward, false);
			// this.buildRoad(left, false);
			// this.buildRoad(right, false);
		}
	}


	draw() : mat3[]
	{
		var transformations = [];
		var leaves = [];
		let endRoadSegment = false;
		let pushes = 0;
		for (let character of this.axiom)
		{
			var drawingRule = this.drawingRules.get(character);
			if (!drawingRule)
			{
				continue;
			}
			var action = drawingRule.value();
			if (endRoadSegment)
			{
				if (action == Action.Push)
				{
					pushes++;
					continue;
				}
				else if (action == Action.Pop) 
				{
					if (pushes > 0)
					{
						pushes--;
						continue;
					}
					endRoadSegment = false;
				}
				else
				{
					continue;
				}
			}
			switch (action) {
				case Action.Push:
				{
					var turtle = Turtle.clone(this.instance);
					this.turtles.push(turtle);
					this.instance = turtle;
					break;
				}
				case Action.Pop:
				{
					transformations.push(this.instance.transformation());
					this.turtles.pop();
					this.instance = this.turtles[this.turtles.length - 1];
					break;
				}
				case Action.Highway:
				{
					// check for most population dense route
					let p0 = this.instance.getPosition();
					let r0 = this.instance.getOrientation();
					let maxSum : number = 0;
					let maxAngle : number = 0;
					// cast rays out from current position
					for (let offset = -30; offset <= 30; offset += 10)
					{
						let sum : number = 0;
						let dir : vec2 = vec2.create();
					    let s = Math.sin(radians(offset));
					    let c = Math.cos(radians(offset));
					    let mat = mat2.fromValues(c, s, -s, c);
					    vec2.transformMat2(dir, r0, mat);
						vec2.normalize(dir, dir);
						let pos = vec2.fromValues(0.0, 0.0);
						for (let dist = 0; dist <= HIGHWAY_LENGTH; dist += HIGHWAY_LENGTH / 20)
						{
							// sum population values along ray weighted with inverse distance to road end
							pos = vec2.fromValues(0.0, 0.0);
							vec2.scale(pos, dir, dist);
							vec2.add(pos, pos, p0);
							let density = this.population.getDensity(vec2.clone(pos));
							if (this.terrain.getElevation(vec2.clone(pos)) < SEA_LEVEL) density = 0;
							sum += density;// * (1 / (HIGHWAY_LENGTH*5 - dist + 1));
						}
						if (pos[0] < -0.9 || pos[0] > 0.9 || pos[1] < -0.9 || pos[1] > 0.9)
						{
							continue;
						}
						if (sum > maxSum)
						{
							maxSum = sum;
							maxAngle = offset;
						}
					}
					// check local constraints
					// add highway and update instance
					let road = new RoadSegment();
					road.start = vec2.clone(this.instance.position);
					this.instance.translate(HIGHWAY_LENGTH);
					this.instance.rotate(-5);
					road.end = vec2.clone(this.instance.position);
					transformations.push(this.instance.transformation());
					this.roads.push(road);
					// console.log(this.instance.toString());
					break;
				}
				case Action.ExitN:
				{
					// this.instance.translate(HIGHWAY_LENGTH);
					// if (this.terrain.getElevation(vec2.clone(this.instance.position)) < SEA_LEVEL) continue;
					this.instance.rotate(90);
					this.instance.snapToGrid();
					this.instance.scale(vec2.fromValues(0.25, 0.25));
					transformations.push(this.instance.transformation());
					break;
				}
				case Action.ExitS:
				{
					// this.instance.translate(HIGHWAY_LENGTH);
					// if (this.terrain.getElevation(vec2.clone(this.instance.position)) < SEA_LEVEL) continue;
					this.instance.rotate(270);
					this.instance.snapToGrid();
					this.instance.scale(vec2.fromValues(0.25, 0.25));
					transformations.push(this.instance.transformation());
					break;
				}
				case Action.RoadLeft:
				{
					let road = new RoadSegment();
					road.start = vec2.clone(this.instance.position);
					transformations.push(this.instance.transformation());
					this.instance.translate(ROAD_LENGTH);
					this.instance.rotate(90);
					road.end = vec2.clone(this.instance.position);
					// check for road intersections
					if (this.population.getDensity(vec2.clone(this.instance.position)) < 0.2) 
					{ 	
						endRoadSegment = true;
						break;
					}
					for (let segment of this.roads)
					{
						let [intersects, intersection] = RoadSegment.getLineIntersection(segment, road);
						if (intersection)
						{
							endRoadSegment = true;
							break;
						}
					}
					if (endRoadSegment) break;
					// check for population density threshold
					transformations.push(this.instance.transformation());
					this.roads.push(road);
					break;
				}
				case Action.RoadForward:
				{
					let road = new RoadSegment();
					road.start = vec2.clone(this.instance.position);
					transformations.push(this.instance.transformation());
					this.instance.translate(ROAD_LENGTH);
					road.end = vec2.clone(this.instance.position);
					// check for road intersections
					if (this.population.getDensity(vec2.clone(this.instance.position)) < 0.2) 
					{ 	
						endRoadSegment = true;
						break;
					}
					for (let segment of this.roads)
					{
						let [intersects, intersection] = RoadSegment.getLineIntersection(segment, road);
						if (intersection)
						{
							endRoadSegment = true;
							break;
						}
					}
					if (endRoadSegment) break;
					// check for population density threshold
					transformations.push(this.instance.transformation());
					this.roads.push(road);
					break;
				}
				case Action.RoadRight:
				{
					let road = new RoadSegment();
					road.start = vec2.clone(this.instance.position);
					transformations.push(this.instance.transformation());
					this.instance.translate(ROAD_LENGTH);
					this.instance.rotate(-90);
					road.end = vec2.clone(this.instance.position);
					// check for road intersections
					if (this.population.getDensity(vec2.clone(this.instance.position)) < 0.2) 
					{ 	
						endRoadSegment = true;
						break;
					}
					for (let segment of this.roads)
					{
						let [intersects, intersection] = RoadSegment.getLineIntersection(segment, road);
						if (intersection)
						{
							endRoadSegment = true;
							break;
						}
					}
					if (endRoadSegment) break;
					// check for population density threshold
					transformations.push(this.instance.transformation());
					this.roads.push(road);
					break;
				}
			}
		}
		return transformations;
	}
};

export default LSystem;