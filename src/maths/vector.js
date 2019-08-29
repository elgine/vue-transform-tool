// Copyright (c) 2019 Elgine
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { EPS } from '../const';
import { toRadian } from './angRad';
import Matrix from './matrix';
import { sgn } from './sgn';

export default class Vector {

    static create(x = 0, y = 0) {
        let v = new Array(2);
        this.set(x, y, v);
        return v;
    }

    static set(x, y, out) {
        out[0] = x;
        out[1] = y;
        return out;
    }

    static equals(v1, v2) {
        return Math.abs(v1[0] - v2[0]) <= EPS && Math.abs(v1[1] - v2[1]) <= EPS;
    }

    static vec(v1, v2, out) {
        out[0] = v1[0] - v2[0];
        out[1] = v1[1] - v2[1];
        return out;
    }

    static transform(v, m, out) {
        out = out || v;
        let x = v[0]; let
            y = v[1];
        out[0] = m[Matrix.M11] * x + m[Matrix.M12] * y + m[Matrix.M13];
        out[1] = m[Matrix.M21] * x + m[Matrix.M22] * y + m[Matrix.M23];
        return out;
    }

    static reset(out) {
        out[0] = 0;
        out[1] = 0;
        return out;
    }

    static len(v) {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    }

    static distance(v1, v2) {
        return Math.sqrt(Math.pow(v1[0] - v2[0], 2) + Math.pow(v1[1] - v2[1], 2));
    }

    static round(v, out) {
        out = out || v;
        out[0] = ~~v[0];
        out[1] = ~~v[1];
        return this;
    }

    static normalize(v, out) {
        out = out || v;
        let len = this.len(v);
        if (len === 0) return out;
        out[0] = v[0] / len;
        out[1] = v[1] / len;
        return out;
    }

    static dot(v1, v2) {
        return v1[0] * v2[0] + v1[1] * v2[1];
    }

    static clone(v, out) {
        out[0] = v[0];
        out[1] = v[1];
        return out;
    }

    static neg(v, out) {
        out = out || v;
        out[0] = -v[0];
        out[1] = -v[1];
        return out;
    }

    static rotate(v, origin, theta, out) {
        const x = v[0] - origin[0];
        const y = v[1] - origin[1];
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        out = out || v;
        out[0] = x * cos - y * sin + origin[0];
        out[1] = x * sin + y * cos + origin[1];
        return out;
    }

    static add(v1, v2, out) {
        out = out || v1;
        if (typeof v2 === 'number') {
            out[0] = v1[0] + v2;
            out[1] = v1[1] + v2;
        } else {
            out[0] = v1[0] + v2[0];
            out[1] = v1[1] + v2[1];
        }
        return out;
    }

    static sub(v1, v2, out) {
        out = out || v1;
        if (typeof v2 === 'number') {
            out[0] = v1[0] - v2;
            out[1] = v1[1] - v2;
        } else {
            out[0] = v1[0] - v2[0];
            out[1] = v1[1] - v2[1];
        }
        return out;
    }

    static mul(v1, v2, out) {
        out = out || v1;
        if (typeof v2 === 'number') {
            out[0] = v1[0] * v2;
            out[1] = v1[1] * v2;
        } else {
            out[0] = v1[0] * v2[0];
            out[1] = v1[1] * v2[1];
        }
        return out;
    }

    static fromAngle(a, out) {
        return this.fromRadian(toRadian(a), out);
    }

    static slope(v1, v2) {
        return (v2[1] - v1[1]) / (v2[0] - v1[0]);
    }

    static fromRadian(r, out) {
        out[0] = Math.cos(r);
        out[1] = Math.sin(r);
        return out;
    }

    static cross(a, b) {
        return a[0] * b[1] - a[1] * b[0];
    }

    static cross1(a, b, c, d) {
        return (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0]);
    }

    static crossScalar(b, a, out) {
        out = out || b;
        let x = b[0]; let
            y = b[1];
        out[0] = -a * y;
        out[1] = a * x;
        return out;
    }

    static segIntersection(p1, p2, p3, p4, out) {
        if (this.meet(p1, p2, p3, p4)) {
            let k = this.fArea(p1, p2, p3) / this.fArea(p1, p2, p4);
            if (out) {
                out[0] = (p3[0] + k * p4[0]) / (1 + k);
                out[1] = (p3[1] + k * p4[1]) / (1 + k);
            }
            return true;
        }
        return false;
    }

    static insidePolygon(v, polygon, verticeCount) {
        let c = false;
        verticeCount = verticeCount || polygon.length;
        for (let i = 0, j = verticeCount - 1; i < verticeCount; j = i++) {
            if (((polygon[i][1] > v[1]) !== (polygon[j][1] > v[1])) &&
            (v[0] < (polygon[j][0] - polygon[i][0]) * (v[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0])) { c = !c }
        }
        return c;
    }

    static fArea(p1, p2, p3) {
        return Math.abs(this.cross1(p1, p2, p1, p3));
    }

    static meet(p1, p2, p3, p4) {
        const max = Math.max; const
            min = Math.min;
        return max(min(p1[0], p2[0]), min(p3[0], p4[0])) <= min(max(p1[0], p2[0]), max(p3[0], p4[0]))
                && max(min(p1[1], p2[1]), min(p3[1], p4[1])) <= min(max(p1[1], p2[1]), max(p3[1], p4[1]))
                && sgn(this.cross1(p3, p2, p3, p4) * this.cross1(p3, p4, p3, p1), -EPS) >= 0
                && sgn(this.cross1(p1, p4, p1, p2) * this.cross1(p1, p2, p1, p3), -EPS) >= 0;
    }

    static intersection(p0, p1, p2, p3, out) {
        let a0 = p1[1] - p0[1];
        let b0 = p0[0] - p1[0];
        let a1 = p3[1] - p2[1];
        let b1 = p2[0] - p3[0];

        let det = a0 * b1 - a1 * b0;
        if (det > -EPS && det < EPS) {
            return null;
        } else {
            let c0 = a0 * p0[0] + b0 * p0[1];
            let c1 = a1 * p2[0] + b1 * p2[1];

            let x = (b1 * c0 - b0 * c1) / det;
            let y = (a0 * c1 - a1 * c0) / det;
            return Vector.set(x, y, out);
        }
    }

    static rad(v) {
        return Vector.rad1(v, [1, 0]);
    }

    static rad1(v1, v2) {
        let y = v1[0] * v2[1] - v1[1] * v2[0];
        let x = v1[0] * v2[0] + v1[1] * v2[1];
        if (y === 0 || x === 0) return 0;
        return -Math.atan2(y, x);
    }

    static rad2(l, c, r) {
        let x1 = l[0] - c[0]; let y1 = l[1] - c[1];
        let x2 = r[0] - c[0]; let y2 = r[1] - c[1];
        let x = x1 * x2 + y1 * y2;
        let y = x1 * y2 - y1 * x2;
        if (y === 0 || x === 0) return 0;
        return -Math.atan2(y, x);
    }

    static normal(v, out) {
        out = out || v;
        let x = v[0]; let
            y = v[1];
        out[0] = -y;
        out[1] = x;
        return out;
    }
}