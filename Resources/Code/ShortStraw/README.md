# ShortStraw algorithm Python implementation

based on 

A. Wolin, B. Eoff, and T. Hammond, “ShortStraw: A Simple and Effective Corner Finder for Polylines.” in SBM, 2008, pp. 33–40.

and 

Y. Xiong and J. J. LaViola Jr, “Revisiting shortstraw: improving corner finding in sketch-based interfaces,” in Proceedings of the 6th Eurographics Symposium on Sketch-Based Interfaces and Modeling, 2009, pp. 101– 108.

---

Use the function `short_straw ` from `shortstraw.py` to calculate corner and curve points in a vector format image. A Jupyter notebook and a JSON file with an example dataset is included to demonstrate the functionality.

## Parameters
- paths : *array_like* 
  - expects an array in the form: 

``` 
#Sketch array 
[
    #Path 1 array
    [ #Points 
        [x0,x1,x2 ,...] # x positions 
        [y0,y1,y2 ,...] # y positions
    ],
    #More paths
    [...] , [...] , ...
]
```

- t1 : *float, optional*
  - Threshold for first postprocessing iteration, should be between 0 and 1, *default = 0.96*
- t2max : *float, optional*
  - Upper threshold for second postprocessing iteration, should be be between 0 and 1, *default = 0.95*
- t2min : *float, optional*
  - Lower threshold for second postprocessing iteration, should be be between 0 and 1, *default = 0.944* 

For a in depth description of the threshold, have a look at the Wolin et al. paper. If you just want to play around with the values, keep in mind that all values should be between 0 and 1 this should apply: `t1 > t2max > t2min`. 

## Returns

- all_corners: *list*
  - the indices of the points that are determined to be corner points for each path, in the form: 

```
#Feature point array
[
    #Path 1 indices
    [index0,index1,index2,...],
    #More paths 
    [...],[...],...
]
``` 
- all_curves: *list*
  - the indices of the points that are determined to be curve points for each path. Same format as *all_corners*
- feature_info: *dict*
  - classifies angles and curve points and returns count. Have a look at the Xiong and LaViola paper for a definition of the curve angle.

| Key | Description |
| --------- | --------- |
| straight | number of corner points with `angle ≥ 0.99 * PI` |
| obtuse | number of corner points with `0.55 * PI < angle < 0.99 * PI` |
| right | number of corner points with `0.45 * PI ≤ angle ≤ 0.55 * PI` | 
| obtuse | number of corner points with `angle < 0.45 * PI` |
| wide_curve | number of curve points with `angle > 0.5 * PI` |
| narrow_curve | number of curve points with `angle ≤ 0.5 * PI` |

- resampled_data: *list*
  - resampled version of the input data 
- all_raw_angles: *list*
  - a list of floats representing the angle sizes for all corner points 
- all_raw_curves: *list*
  - a list of floats representing the angle sizes for all curve points  




