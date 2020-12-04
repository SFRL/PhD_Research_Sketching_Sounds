// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
// implied. See the License for the specific language governing
// permissions and limitations under the License.
/**
 * Author: David Ha <hadavid@google.com>
 *
 * @fileoverview Sketch-RNN Javascript Inference Library
 */

/**
 * Location of JSON models used for sketch-rnn-js
 */

/**
 * Tool to load simplify lines of a sketch using RDP Algorithm
 */
var DataTool = {};

(function (global) {
  "use strict";

  function simplify_line(V, tolerance) {
    // from https://gist.github.com/adammiller/826148
    // V ... [[x1,y1],[x2,y2],...] polyline
    // tol  ... approximation tolerance
    // ==============================================
    // Copyright 2002, softSurfer (www.softsurfer.com)
    // This code may be freely used and modified for any purpose
    // providing that this copyright notice is included with it.
    // SoftSurfer makes no warranty for this code, and cannot be held
    // liable for any real or imagined damage resulting from its use.
    // Users of this code must verify correctness for their application.
    // http://softsurfer.com/Archive/algorithm_0205/algorithm_0205.htm

    var tol=2.0;
    
    if (typeof(tolerance) === "number") {
      tol = tolerance;
    }

    var sum = function(u,v) {return [u[0]+v[0], u[1]+v[1]];}
    var diff = function(u,v) {return [u[0]-v[0], u[1]-v[1]];}
    var prod = function(u,v) {return [u[0]*v[0], u[1]*v[1]];}
    var dot = function(u,v) {return u[0]*v[0] + u[1]*v[1];}
    var norm2 = function(v) {return v[0]*v[0] + v[1]*v[1];}
    var norm = function(v) {return Math.sqrt(norm2(v));}
    var d2 = function(u,v) {return norm2(diff(u,v));}
    var d = function(u,v) {return norm(diff(u,v));}

    var simplifyDP = function( tol, v, j, k, mk ) {
      //  This is the Douglas-Peucker recursive simplification routine
      //  It just marks vertices that are part of the simplified polyline
      //  for approximating the polyline subchain v[j] to v[k].
      //  mk[] ... array of markers matching vertex array v[]
      if (k <= j+1) { // there is nothing to simplify
        return;
      }
      // check for adequate approximation by segment S from v[j] to v[k]
      var maxi = j;          // index of vertex farthest from S
      var maxd2 = 0;         // distance squared of farthest vertex
      var tol2 = tol * tol;  // tolerance squared
      var S = [v[j], v[k]];  // segment from v[j] to v[k]
      var u = diff(S[1], S[0]);   // segment direction vector
      var cu = norm2(u,u);     // segment length squared
      // test each vertex v[i] for max distance from S
      // compute using the Feb 2001 Algorithm's dist_Point_to_Segment()
      // Note: this works in any dimension (2D, 3D, ...)
      var  w;           // vector
      var Pb;                // point, base of perpendicular from v[i] to S
      var b, cw, dv2;        // dv2 = distance v[i] to S squared
      for (var i=j+1; i<k; i++) {
        // compute distance squared
        w = diff(v[i], S[0]);
        cw = dot(w,u);
        if ( cw <= 0 ) {
          dv2 = d2(v[i], S[0]);
        } else if ( cu <= cw ) {
          dv2 = d2(v[i], S[1]);
        } else {
          b = cw / cu;
          Pb = [S[0][0]+b*u[0], S[0][1]+b*u[1]];
          dv2 = d2(v[i], Pb);
        }
        // test with current max distance squared
        if (dv2 <= maxd2) {
          continue;
        }
        // v[i] is a new max vertex
        maxi = i;
        maxd2 = dv2;
      }
      if (maxd2 > tol2) {      // error is worse than the tolerance
        // split the polyline at the farthest vertex from S
        mk[maxi] = 1;      // mark v[maxi] for the simplified polyline
        // recursively simplify the two subpolylines at v[maxi]
        simplifyDP( tol, v, j, maxi, mk );  // polyline v[j] to v[maxi]
        simplifyDP( tol, v, maxi, k, mk );  // polyline v[maxi] to v[k]
      }
      // else the approximation is OK, so ignore intermediate vertices
      return;
    }

    var n = V.length;
    var sV = [];
    var i, k, m, pv;               // misc counters
    var tol2 = tol * tol;          // tolerance squared
    var vt = [];                       // vertex buffer, points
    var mk = [];                       // marker buffer, ints

    // STAGE 1.  Vertex Reduction within tolerance of prior vertex cluster
    vt[0] = V[0];              // start at the beginning
    for (i=k=1, pv=0; i<n; i++) {
      if (d2(V[i], V[pv]) < tol2) {
        continue;
      }
      vt[k++] = V[i];
      pv = i;
    }
    if (pv < n-1) {
      vt[k++] = V[n-1];      // finish at the end
    }

    // STAGE 2.  Douglas-Peucker polyline simplification
    mk[0] = mk[k-1] = 1;       // mark the first and last vertices
    simplifyDP( tol, vt, 0, k-1, mk );

    // copy marked vertices to the output simplified polyline
    for (i=m=0; i<k; i++) {
      if (mk[i]) {
        sV[m++] = vt[i];
      }
    }
    return sV;
  }

  /**
   * Clean wrapper method to use RDP function.
   */
  function simplify_lines(lines) {
    var result = [];
    var tolerance = 2.0;
    for (var i=0;i<lines.length;i++) {
      result.push(simplify_line(lines[i], tolerance));
    }
    return result;
  };

  /**
   * convert from polylines to stroke-5 format that sketch-rnn uses
   */
  function lines_to_strokes(raw_data) {
    var x, y;
    var px=0, py=0;
    var dx, dy;
    var pon, poff;
    var stroke = [];
    var i, j;
    var len;
    var p;
    for (i=0;i<raw_data.length;i++) {
      len = raw_data[i].length;
      if (len > 1) {
        for (j=0;j<len;j++) {
          p = raw_data[i][j];
          x = p[0];
          y = p[1];
          if (j === len-1) {
            poff = 1;
            pon = 0;
          } else {
            poff = 0;
            pon = 1;
          }
          dx = x - px;
          dy = y - py;
          px = x;
          py = y;
          stroke.push([dx, dy, pon, poff, 0]);
        }
      }
    }
    stroke.push([0, 0, 0, 0, 1]);
    return stroke.slice(1);
  };

  /**
   * convert from stroke-5 format to polylines
   */
  function line_to_stroke(line, last_point) {
    var pon, poff;
    var stroke = [];
    var len;
    var p;
    var dx, dy;
    var x, y;
    var px, py;
    var j;
    px = last_point[0];
    py = last_point[1];
    len = line.length;
    if (len > 1) {
      for (j=0;j<len;j++) {
        p = line[j];
        //x = p.x;
        //y = p.y;
        x = p[0];
        y = p[1];
        if (j === len-1) {
          poff = 1;
          pon = 0;
        } else {
          poff = 0;
          pon = 1;
        }
        dx = x - px;
        dy = y - py;
        px = x;
        py = y;
        stroke.push([dx, dy, pon, poff, 0]);
      }
    }

    return stroke;

  };

  global.lines_to_strokes = lines_to_strokes;
  global.simplify_line = simplify_line;
  global.simplify_lines = simplify_lines;
  global.line_to_stroke = line_to_stroke;

})(DataTool);
(function(lib) {
  "use strict";
  if (typeof module === "undefined" || typeof module.exports === "undefined") {
    // usable in browser
  } else {
    module.exports = lib; // in nodejs
  }
})(DataTool);

