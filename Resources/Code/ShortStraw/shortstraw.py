# Find corners with ShortStraw algorithm by Woling,Eoff and Hammond
# With improvements by Xiong and LaViola Jr.
# Implementation by Sebastian Löbbers

import math
import numpy as np

# Calcuate eucledian distance between two 2D points


def eucledian_dist(x1, y1, x2, y2):
    return math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))

# Angle between two vectors


def angle(v1, v2):
    v1_length = np.linalg.norm(v1)
    v2_length = np.linalg.norm(v2)
    if v1_length == 0 or v2_length == 0:
        return 0
    else:
        rel = np.dot(v1, v2)/(v1_length*v2_length)
        return np.arccos(np.clip(rel, -1, 1))


def resample_data(x_org, y_org, scale):
    x = x_org.copy()
    y = y_org.copy()
    # Get coordinates of bounding box
    minX = min(x)
    maxX = max(x)
    minY = min(y)
    maxY = max(y)
    # Length of diagonal
    dia = math.sqrt(math.pow(maxX-minX, 2)+math.pow(maxY-minY, 2))
    # Scale diagonal to get interspacing distance S
    S = dia/scale
    if S < 2.5:
        S = 2.5
    # Initialise distance holder and increment i
    D = 0
    i = 1
    length = len(x)
    resampledX = [x[0]]
    resampledY = [y[0]]
    while i < length:
        d = eucledian_dist(x[i-1], y[i-1], x[i], y[i])
        if D + d >= S:
            # Calculate new point q that has distance S from prev point
            qx = x[i-1] + ((S-D)/d)*(x[i]-x[i-1])
            qy = y[i-1] + ((S-D)/d)*(y[i]-y[i-1])
            resampledX.append(qx)
            resampledY.append(qy)
            x.insert(i, qx)
            y.insert(i, qy)
            length = len(x)
            D = 0
        else:
            D += d
        i += 1
    return [resampledX, resampledY]

# Create new corner about halfway through


def halfway_corner(straws, a, b):
    quarter = (b-a)/4
    lower = math.ceil(a+quarter)
    upper = math.ceil(b-quarter)
    minValue = 10000000
    for i in range(lower, upper):
        if straws[i] < minValue:
            minValue = straws[i]
            minIndex = i
    return minIndex

# Check if path between two points is a line


def is_line(x, y, a, b, t):
    threshold = t
    distance = eucledian_dist(x[a], y[a], x[b], y[b])
    pathDistance = sum([eucledian_dist(x[i-1], y[i-1], x[i], y[i])
                        for i in range(a+1, b+1)])
    r = distance/pathDistance
    if r > threshold:
        return True
    else:
        return False


# Check if corner is actually a curve
def is_curve(x, y, c, shift):
    # Calculate longer corner points
    a = c-shift
    b = c+shift

    # Calculate shorter corner points
    d = math.ceil(c-(c-a)/3)
    e = math.ceil(c+(b-c)/3)

    # Calculate the long vertices
    lv1 = np.array([x[c]-x[a], y[c]-y[a]])
    lv2 = np.array([x[c]-x[b], y[c]-y[b]])

    # Calculate the short vertices
    sv1 = np.array([x[c]-x[d], y[c]-y[d]])
    sv2 = np.array([x[c]-x[e], y[c]-y[e]])

    # Calculate angle between vertices
    alpha = angle(lv1, lv2)
    beta = angle(sv1, sv2)

    # Dynamic threshold depending on alpha
    ta = np.pi*(10 + 800/(alpha/np.pi * 180 + 35))/180

    if beta - alpha > ta:
        return alpha
    else:
        return False


def get_shift(c, a, b):
    # Calculate shift value
    return np.clip(min(c-a, b-c), 2, 15)


def angle_type(x, y, c, shift):
    # Calculate longer corner points
    a = c-shift
    b = c+shift

    # Calculate vertices
    v1 = np.array([x[c]-x[a], y[c]-y[a]])
    v2 = np.array([x[c]-x[b], y[c]-y[b]])

    alpha = angle(v1, v2)

    if alpha < 0.90*0.5*np.pi:
        return 'acute', alpha
    elif alpha >= 0.90*0.5*np.pi and alpha <= 1.10*0.5*np.pi:
        return 'right', alpha
    elif alpha > 1.10*0.5*np.pi and alpha < 0.99*np.pi:
        return 'obtuse', alpha
    elif alpha >= 0.99*np.pi:
        return 'straight', alpha


def post_process_corners(x, y, corners, straws, t1, t2max, t2min):
    proceed = False
    while not proceed:
        proceed = True
        length = len(corners)
        i = 1
        while i < length:
            c1 = corners[i-1]
            c2 = corners[i]
            if not is_line(x, y, c1, c2, 0.96):
                newCorner = halfway_corner(straws, c1, c2)
                corners.insert(i, newCorner)
                length = len(corners)
                proceed = False
            i += 1
    length = len(corners)-1
    for run in range(1, 3):  # Run this twice with different thresholds to get better accuracy
        i = 1
        while i < length:
            c1 = corners[i-1]
            c2 = corners[i+1]

            if run == 1:  # Higher threshold on first run
                t = t1
            elif run == 2:  # Lower threshold on second run
                if c2-c1 > 10:  # Threshold depending on how far corner points are apart
                    t = t2max
                else:
                    t = t2min

            if is_line(x, y, c1, c2, t):
                del corners[i]
                length = len(corners) - 1
                i -= 1
            i += 1

    # Check for consecutive corners and only keep the ones with the shorter straw
    length = len(corners)-1
    i = 1
    while i < length:
        c1 = corners[i-1]
        c2 = corners[i]
        if c1+1 == c2:
            if straws[c1] < straws[c2]:
                corners.remove(c1)
            else:
                corners.remove(c2)
            length = len(corners)-1
            i -= 1
        i += 1
    # Check for endpoint as well but always delete point next to endpoint
    if corners[-1] == corners[-2]+1:
        del corners[-2]

    # Check if corner is actually a curve
    curves = []
    length = len(corners)-1
    i = 1
    narrow_curved = 0
    wide_curved = 0
    straight = 0
    obtuse = 0
    right = 0
    acute = 0
    raw_angles = []
    raw_curves = []
    while i < length:
        a = corners[i-1]
        c = corners[i]
        b = corners[i+1]
        shift = get_shift(c, a, b)
        arc = is_curve(x, y, c, shift)
        if arc:
            # curved += 2*shift
            raw_curves.append(arc)
            corners.remove(c)
            curves.append(c)
            length = len(corners)-1
            i -= 1
            if arc < 1.7553288301331578:
                narrow_curved += 1
            else:
                wide_curved += 1
        else:
            a_type, raw_a = angle_type(x, y, c, shift)
            raw_angles.append(raw_a)
            if a_type == 'straight':
                straight += 1
            elif a_type == 'obtuse':
                obtuse += 1
            elif a_type == 'right':
                right += 1
            elif a_type == 'acute':
                acute += 1
        i += 1

    # If there are only two points (end and start) it is a straight line
    if len(corners) == 2 and len(curves) == 0:
        w = eucledian_dist(x[0], y[0], x[-1], y[-1])
        if w > 15:
            w = 15
        straight = 1

    return corners, curves, [straight, narrow_curved, wide_curved, obtuse, right, acute], [raw_angles, raw_curves]


def compute_corners(x, y, t1, t2max, t2min):
    W = 3  # Number of points of each side of straw middle
    N = len(x)  # number of points
    corners = [0]
    straws = []
    if N > 2*W:  # Only do the routine if N is larger than 2*W
        # Add straw length for first point
        straws.append(eucledian_dist(x[0], y[0], x[1+W], y[1+W])*((2*W)/(W+1)))

        for i in range(1, W):
            # Add straw length for the points close to the beginning
            straws.append(eucledian_dist(
                x[0], y[0], x[i+W], y[i+W])*((2*W)/(W+i)))
        for i in range(W, N-W):
            straws.append(eucledian_dist(x[i-W], y[i-W], x[i+W], y[i+W]))
        for i in range(N-W, N-1):
            # Add straw length for points close to the end but not for the last point
            straws.append(eucledian_dist(
                x[N-1], y[N-1], x[i-W], y[i-W])*(2*W)/(W+N-i-1))
        mean = np.mean(straws)
        t = mean*0.95

        i = W
        while i < N-W:
            if straws[i] < t:
                localMin = 100000000
                localMinIndex = i
                while i < len(straws) and straws[i] < t:
                    if straws[i] < localMin:
                        localMin = straws[i]
                        localMinIndex = i
                    i += 1
                corners.append(localMinIndex)
            i += 1
    else:  # If N is smaller or equal to W just fill every straw with the same length
        d = eucledian_dist(x[0], y[0], x[-1], y[-1])
        for _ in range(N):
            straws.append(d)

    corners.append(N-1)  # add endpoint to corners
    if corners[0] == corners[-1]:  # If data was resampled to have just a point rather a line
        del corners[-1]
        curves = []
        analysis = [0, 0, 0, 0, 0, 0]
        raw = [[], []]
    else:
        corners, curves, analysis, raw = post_process_corners(
            x, y, corners, straws, t1, t2max, t2min)

    return corners, curves, analysis, raw

# Main routine


def ss_main(x, y, t1, t2max, t2min):
    resampled = resample_data(x, y, 80)
    corners, curves, analysis, raw = compute_corners(
        resampled[0], resampled[1], t1, t2max, t2min)
    return corners, curves, analysis, resampled, raw

# Parse data


def short_straw(paths, t1=0.96, t2max=0.95, t2min=0.944):
    all_corners = []  # Position of corner points
    all_curves = []  # Position of curve points
    nos = 0  # Number of straight segments
    nocn = 0  # Number of narrow curves
    nocw = 0  # Number of wide curves
    noo = 0  # Number of obtuse angles
    nor = 0  # Number of right angles
    noa = 0  # Number of acute angles
    resampled_data = []  # Resampled sketch
    all_raw_angles = []  # Raw angles of all corner points
    all_raw_curves = []  # Raw "angles" of all curve points
    # Iterate through all paths in sketch and append results to "global" variables
    for path in paths:
        if len(path[0]) > 1:  # Only consider paths that have at least 2 points
            data = ss_main(path[0], path[1], t1, t2max, t2min)
            all_corners.append(data[0])
            all_curves.append(data[1])
            nos += data[2][0]
            nocn += data[2][1]
            nocw += data[2][2]
            noo += data[2][3]
            nor += data[2][4]
            noa += data[2][5]
            resampled_data.append(data[3])
            all_raw_angles.extend(data[4][0])
            all_raw_curves.extend(data[4][1])

    feature_info = {'straight': nos, 'narrow_curve': nocn,
                    'wide_curve': nocw, 'obtuse': noo, 'right': nor, 'acute': noa}
    return all_corners, all_curves, feature_info, resampled_data, all_raw_angles, all_raw_curves
