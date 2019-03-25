
import {vec2} from 'gl-matrix';

export var gl: WebGL2RenderingContext;

export function setGL(_gl: WebGL2RenderingContext) {
  gl = _gl;
}

export function readTextFile(file: string): string
{
    var text = "";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                text = allText;
            }
        }
    }
    rawFile.send(null);
    return text;
}

export function radians(degrees: number) {
  return degrees * Math.PI / 180.0;
};

export function degrees(radians: number) {
  return radians * 180.0 / Math.PI;
};

export function angleBetweenLinesInRad(line1Start: vec2, line1End: vec2, line2Start: vec2, line2End: vec2) : number
{
    let a: number = line1End[0] - line1Start[0];
    let b: number = line1End[1] - line1Start[1];
    let c: number = line2End[0] - line2Start[0];
    let d: number = line2End[1] - line2Start[1];

    let atanA = Math.atan2(a, b);
    let atanB = Math.atan2(c, d);

    return atanA - atanB;
}

export function mix(a: number, b: number, t: number)
{
    return a*(1-t) + b*t;
}