import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Road extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;

  constructor() {
    super();
  }

  create() {

  this.indices = new Uint32Array([0, 1, 2,
                                  0, 2, 3]);
  this.positions = new Float32Array([-0.006125, 0.1, 0.998, 1,
                                     0.006125, 0.1, 0.998, 1,
                                     0.006125, 0.0, 0.998, 1,
                                     -0.006125, 0.0, 0.998, 1]);

    this.generateIdx();
    this.generatePos();
    this.generateCol();
    this.generateColumns();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created Road`);
  }

  setInstanceVBOs(col1: Float32Array, col2: Float32Array, col3: Float32Array, col4: Float32Array) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol1);
    gl.bufferData(gl.ARRAY_BUFFER, col1, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol2);
    gl.bufferData(gl.ARRAY_BUFFER, col2, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol3);
    gl.bufferData(gl.ARRAY_BUFFER, col3, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol4);
    gl.bufferData(gl.ARRAY_BUFFER, col4, gl.STATIC_DRAW);
  }
};

export default Road;
