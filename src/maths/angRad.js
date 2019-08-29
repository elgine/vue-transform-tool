// Copyright (c) 2019 Elgine
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const PI_INV = 1 / Math.PI;
const HALF_C_INV = 1 / 180;

export const wrap = (v) => {
    return v - (16384 - ((16384.499999999996 - v / 360) | 0)) * 360;
};

export const wrapRad = (v) => {
    v %= Math.PI * 2;
    if (v > Math.PI) {
        return v - Math.PI * 2;
    } else if (v < -Math.PI) { return v + Math.PI * 2 }
    return v;
};

export const wrapInTwoPI = (v) => {
    v %= Math.PI * 2;
    if (v < 0) {
        return v + Math.PI * 2;
    }
    return v;
};

export const isRadBetween = (rad, start, end) => {
    if (start < 0) {
        start = wrapRad(start);
        return (rad >= start && rad <= Math.PI * 2) || (rad >= 0 && rad <= end);
    }
    else if (end > Math.PI * 2) {
        return (rad >= start && rad <= Math.PI * 2) || (rad >= 0 && rad <= wrapRad(end));
    }
    else {
        return rad >= start && end >= rad;
    }
};

export const toRadian = (v) => {
    return wrapRad(wrap(v) * HALF_C_INV * Math.PI);
};

export const toAngle = (v) => {
    v = wrapRad(v);
    if (v < 0) {
        v += Math.PI * 2;
    }
    return v * PI_INV * 180;
};