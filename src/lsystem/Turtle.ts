import {vec2, vec3, mat2, mat3} from 'gl-matrix';
import {radians, degrees, angleBetweenLinesInRad} from '../globals';

export enum RoadType { Highway, Road }

class Turtle 
{
  position: vec2 = vec2.fromValues(0.0, 0.0);
  orientation: vec2 = vec2.fromValues(0.0, 1.0);
  scaling: vec2 = vec2.fromValues(1.0, 1.0);
  angle: number = 0;
  roadType: RoadType = RoadType.Road;
  delay: number = 0;

  constructor() { }

  // sets the orientation to the closest axis
  snapToGrid()
  {
    let minAngle : number = 360;
    let axis : vec2 = vec2.fromValues(0.0, 1.0);
    let angle = vec2.angle(vec2.fromValues(0.0, 1.0), this.orientation);
    if (angle < minAngle)
    {
      minAngle = angle;
      axis = vec2.fromValues(0.0, 1.0);
    }
    angle = vec2.angle(vec2.fromValues(0.0, -1.0), this.orientation);
    if (angle < minAngle)
    {
      minAngle = angle;
      axis = vec2.fromValues(0.0, -1.0);
    }
    angle = vec2.angle(vec2.fromValues(1.0, 0.0), this.orientation);
    if (angle < minAngle)
    {
      minAngle = angle;
      axis = vec2.fromValues(1.0, 0.0);
    }
    angle = vec2.angle(vec2.fromValues(-1.0, 0.0), this.orientation);
    if (angle < minAngle)
    {
      minAngle = angle;
      axis = vec2.fromValues(-1.0, 0.0);
    }
    let trueAngle = angleBetweenLinesInRad(vec2.create(), this.orientation, vec2.create(), axis);
    this.rotate(degrees(trueAngle));
  }

  getPosition() : vec2
  {
    return vec2.clone(this.position);
  }

  getOrientation() : vec2
  {
    return vec2.clone(this.orientation);
  }

  translate(distance: number)
  {
    vec2.scaleAndAdd(this.position, this.position, this.orientation, distance);
  }

  rotate(angle: number)
  {
    this.angle += angle;
    while (this.angle < 0)
    {
      this.angle += 360;
    }
    let s = Math.sin(radians(angle));
    let c = Math.cos(radians(angle));
    let mat = mat2.fromValues(c, s, -s, c);
    vec2.transformMat2(this.orientation, this.orientation, mat);
    // vec2.rotate(this.orientation, this.orientation, this.position, radians(angle));
    vec2.normalize(this.orientation, this.orientation);
  }

  scale(factor: vec2)
  {
    vec2.multiply(this.scaling, this.scaling, factor);
  }

  transformation() : mat3
  {
    let angle = radians(this.angle);
    let s = Math.sin(angle);
    let c = Math.cos(angle);
    // let mat = mat3.fromValues(c, s, 0,
    //                          -s,c, 0,
    //                          this.position[0], this.position[1], 1);
    let mat = mat3.fromValues(this.scaling[0]*c, this.scaling[1]*s, 0,
                           -this.scaling[0]*s, this.scaling[1]*c, 0,
                           this.position[0], this.position[1], 1);
    console.log(this.toString());
    return mat;
  }

  static clone(turtle: Turtle) : Turtle
  {
    var newTurtle = new Turtle();
    newTurtle.position = vec2.clone(turtle.position);
    newTurtle.orientation = vec2.clone(turtle.orientation);
    newTurtle.scaling = vec2.clone(turtle.scaling);
    newTurtle.angle = turtle.angle;
    return newTurtle;
  }
};

export default Turtle;
