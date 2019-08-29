// Copyright (c) 2019 Elgine
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { EPS } from '../const';

const delExtraSpace = (str) => {
    return str.replace(/\s+/g, ' ');
};

/**
 * Affine matrix in 2d
 * a c tx
 * b d ty
 * 0 0 1
 * @class
 */
export default class Matrix {

    static A = 0;
    static B = 3;
    static C = 1;
    static D = 4;
    static TX = 2;
    static TY = 5;

    static M11 = 0;
    static M12 = 1;
    static M13 = 2;
    static M21 = 3;
    static M22 = 4;
    static M23 = 5;
    static M31 = 6;
    static M32 = 7;
    static M33 = 8;

    static create(
        m11 = 1, m12 = 0, m13 = 0,
        m21 = 0, m22 = 1, m23 = 0,
        m31 = 0, m32 = 0, m33 = 1
    ) {
        let m = new Array(9);
        this.set(m11, m12, m13, m21, m22, m23, m31, m32, m33, m);
        return m;
    }

    static set(
        m11 = 1, m12 = 0, m13 = 0,
        m21 = 0, m22 = 1, m23 = 0,
        m31 = 0, m32 = 0, m33 = 1, out
    ) {
        out[Matrix.M11] = m11;
        out[Matrix.M12] = m12;
        out[Matrix.M13] = m13;
        out[Matrix.M21] = m21;
        out[Matrix.M22] = m22;
        out[Matrix.M23] = m23;
        out[Matrix.M31] = m31;
        out[Matrix.M32] = m32;
        out[Matrix.M33] = m33;
        return out;
    }

    static clone(a, out) {
        out[Matrix.M11] = a[Matrix.M11];
        out[Matrix.M12] = a[Matrix.M12];
        out[Matrix.M13] = a[Matrix.M13];
        out[Matrix.M21] = a[Matrix.M21];
        out[Matrix.M22] = a[Matrix.M22];
        out[Matrix.M23] = a[Matrix.M23];
        out[Matrix.M31] = a[Matrix.M31];
        out[Matrix.M32] = a[Matrix.M32];
        out[Matrix.M33] = a[Matrix.M33];
        return out;
    }

    static fromSvgMatrixString(v, out) {
        Matrix.reset(out);
        delExtraSpace(v).split(' ').forEach((action) => {
            // Handle translate
            if (/translateX\(\s*.*\s*\)/g.test(action)) {
                Matrix.translate(out, [Number(action.replace(/(translateX)|(\(\s*)|(\s*\))/g, '')), 0]);
            } else if (/translateY\(\s*.*\s*\)/g.test(action)) {
                Matrix.translate(out, [0, Number(action.replace(/(translateY)|(\(\s*)|(\s*\))/g, ''))]);
            } else if (/translate\(\s*.*\s*\)/g.test(action)) {
                Matrix.translate(out, action.replace(/(translate)|(\(\s*)|(\s*\))/g, ' ').split(' ').map(Number));
            }
            // Handle scale
            else if (/scaleX\(\s*.*\s*\)/g.test(action)) {
                Matrix.scale(out, [Number(action.replace(/(scaleX)|(\(\s*)|(\s*\))/g, '')), 1]);
            } else if (/scaleY\(\s*.*\s*\)/g.test(action)) {
                Matrix.scale(out, [1, Number(action.replace(/(scaleY)|(\(\s*)|(\s*\))/g, ''))]);
            } else if (/scale\(\s*.*\s*\)/g.test(action)) {
                Matrix.scale(out, action.replace(/(translate)|(\(\s*)|(\s*\))/g, ' ').split(' ').map(Number));
            }
            // Handle skew
            else if (/skewX\(\s*.*\s*\)/g.test(action)) {
                Matrix.skew(out, [Number(action.replace(/(skewX)|(\(\s*)|(\s*\))/g, '')), 1]);
            } else if (/skewY\(\s*.*\s*\)/g.test(action)) {
                Matrix.scale([1, Number(action.replace(/(skewY)|(\(\s*)|(\s*\))/g, ''))], out);
            } else if (/skew\(\s*.*\s*\)/g.test(action)) {
                Matrix.skew(out, action.replace(/(skew)|(\(\s*)|(\s*\))/g, ' ').split(' ').map(Number));
            }
            // Handle rotate
            else if (/rotate\(\s*.*\s*\)/g.test(action)) {
                Matrix.rotate(out, Number(action.replace(/(rotate)|(\(\s*)|(\s*\))/g, '')));
            }
        });
    }

    static fromSvgMatrix(v, out) {
        out[0] = v.a;
        out[1] = v.c;
        out[2] = v.tx;
        out[3] = v.b;
        out[4] = v.d;
        out[5] = v.ty;
        out[6] = 0;
        out[7] = 0;
        out[8] = 1;
        return out;
    }

    static toColMajorOrder(v, out) {
        const a = v[Matrix.A];
        const b = v[Matrix.B];
        const c = v[Matrix.C];
        const d = v[Matrix.D];
        const tx = v[Matrix.TX];
        const ty = v[Matrix.TY];
        out = out || v;
        out[0] = a;
        out[1] = b;
        out[2] = c;
        out[3] = d;
        out[4] = tx;
        out[5] = ty;
        return out;
    }

    static toSVGMatrix(v, svgM) {
        svgM.a = v[0];
        svgM.b = v[3];
        svgM.c = v[1];
        svgM.d = v[4];
        svgM.tx = v[2];
        svgM.ty = v[5];
        return svgM;
    }

    static reset(out) {
        out[Matrix.M11] = 1;
        out[Matrix.M12] = 0;
        out[Matrix.M13] = 0;
        out[Matrix.M21] = 0;
        out[Matrix.M22] = 1;
        out[Matrix.M23] = 0;
        out[Matrix.M31] = 0;
        out[Matrix.M32] = 0;
        out[Matrix.M33] = 1;
        return out;
    }

    static invert(a, out) {
        out = out || a;
        const det = Matrix.determinant(a);
        if (det !== 0) {
            const invDet = 1 / det;
            // Calculate cofactor matrix components
            let m11 = a[Matrix.M22] * a[Matrix.M33] - a[Matrix.M23] * a[Matrix.M32];
            let m12 = a[Matrix.M13] * a[Matrix.M32] - a[Matrix.M12] * a[Matrix.M33];
            let m13 = a[Matrix.M12] * a[Matrix.M23] - a[Matrix.M22] * a[Matrix.M13];

            let m21 = a[Matrix.M23] * a[Matrix.M31] - a[Matrix.M21] * a[Matrix.M33];
            let m22 = a[Matrix.M11] * a[Matrix.M33] - a[Matrix.M13] * a[Matrix.M31];
            let m23 = a[Matrix.M13] * a[Matrix.M21] - a[Matrix.M11] * a[Matrix.M23];

            let m31 = a[Matrix.M21] * a[Matrix.M32] - a[Matrix.M22] * a[Matrix.M31];
            let m32 = a[Matrix.M12] * a[Matrix.M31] - a[Matrix.M11] * a[Matrix.M32];
            let m33 = a[Matrix.M11] * a[Matrix.M22] - a[Matrix.M12] * a[Matrix.M21];
            out[Matrix.M11] = m11 * invDet;
            out[Matrix.M12] = m12 * invDet;
            out[Matrix.M13] = m13 * invDet;
            out[Matrix.M21] = m21 * invDet;
            out[Matrix.M22] = m22 * invDet;
            out[Matrix.M23] = m23 * invDet;
            out[Matrix.M31] = m31 * invDet;
            out[Matrix.M32] = m32 * invDet;
            out[Matrix.M33] = m33 * invDet;
        }
        return out;
    }

    static determinant(a) {
        return a[Matrix.M11] * (a[Matrix.M22] * a[Matrix.M33] - a[Matrix.M23] * a[Matrix.M32]) -
            a[Matrix.M12] * (a[Matrix.M21] * a[Matrix.M33] - a[Matrix.M23] * a[Matrix.M31]) +
            a[Matrix.M13] * (a[Matrix.M21] * a[Matrix.M32] - a[Matrix.M22] * a[Matrix.M31]);
    }

    static skew(a, v, out) {
        out = out || a;
        let a11 = a[Matrix.M11]; let a12 = a[Matrix.M12]; let a13 = a[Matrix.M13];
        let a21 = a[Matrix.M21]; let a22 = a[Matrix.M22]; let a23 = a[Matrix.M23];
        let a31 = a[Matrix.M31]; let a32 = a[Matrix.M32]; let a33 = a[Matrix.M33];
        let sx = Math.tan(v[0]);
        let sy = Math.tan(v[1]);
        let b11 = 1;
        let b12 = sx;
        let b21 = sy;
        let b22 = 1;
        out[Matrix.M11] = b11 * a11 + b12 * a21;
        out[Matrix.M12] = b11 * a12 + b12 * a22;
        out[Matrix.M13] = b11 * a13 + b12 * a23;

        out[Matrix.M21] = b21 * a11 + b22 * a21;
        out[Matrix.M22] = b21 * a12 + b22 * a22;
        out[Matrix.M23] = b21 * a13 + b22 * a23;

        out[Matrix.M31] = a31;
        out[Matrix.M32] = a32;
        out[Matrix.M33] = a33;
        return out;
    }

    static rotate(a, rad, out) {
        out = out || a;
        let a11 = a[Matrix.M11]; let a12 = a[Matrix.M12]; let a13 = a[Matrix.M13];
        let a21 = a[Matrix.M21]; let a22 = a[Matrix.M22]; let a23 = a[Matrix.M23];
        let a31 = a[Matrix.M31]; let a32 = a[Matrix.M32]; let a33 = a[Matrix.M33];
        let s = Math.sin(rad);
        let c = Math.cos(rad);
        let b11 = c;
        let b12 = -s;
        let b21 = s;
        let b22 = c;
        out[Matrix.M11] = b11 * a11 + b12 * a21;
        out[Matrix.M12] = b11 * a12 + b12 * a22;
        out[Matrix.M13] = b11 * a13 + b12 * a23;

        out[Matrix.M21] = b21 * a11 + b22 * a21;
        out[Matrix.M22] = b21 * a12 + b22 * a22;
        out[Matrix.M23] = b21 * a13 + b22 * a23;

        out[Matrix.M31] = a31;
        out[Matrix.M32] = a32;
        out[Matrix.M33] = a33;
        return out;
    }

    static scale(a, v, out) {
        out = out || a;
        let a11 = a[Matrix.M11]; let a12 = a[Matrix.M12]; let a13 = a[Matrix.M13];
        let a21 = a[Matrix.M21]; let a22 = a[Matrix.M22]; let a23 = a[Matrix.M23];
        let a31 = a[Matrix.M31]; let a32 = a[Matrix.M32]; let a33 = a[Matrix.M33];
        let v0 = v[0]; let
            v1 = v[1];

        out[Matrix.M11] = a11 * v0;
        out[Matrix.M12] = a12 * v0;
        out[Matrix.M13] = a13 * v0;

        out[Matrix.M21] = a21 * v1;
        out[Matrix.M22] = a22 * v1;
        out[Matrix.M23] = a23 * v1;

        out[Matrix.M31] = a31;
        out[Matrix.M32] = a32;
        out[Matrix.M33] = a33;
        return out;
    }

    static translate(a, v, out) {
        out = out || a;
        let a11 = a[Matrix.M11]; let a12 = a[Matrix.M12]; let a13 = a[Matrix.M13];
        let a21 = a[Matrix.M21]; let a22 = a[Matrix.M22]; let a23 = a[Matrix.M23];
        let a31 = a[Matrix.M31]; let a32 = a[Matrix.M32]; let a33 = a[Matrix.M33];
        let v0 = v[0]; let
            v1 = v[1];

        out[Matrix.M11] = a11;
        out[Matrix.M12] = a12;
        out[Matrix.M13] = a13 + v0;

        out[Matrix.M21] = a21;
        out[Matrix.M22] = a22;
        out[Matrix.M23] = a23 + v1;

        out[Matrix.M31] = a31;
        out[Matrix.M32] = a32;
        out[Matrix.M33] = a33;
        return out;
    }

    static fromRotation(rad, out) {
        let s = Math.sin(rad); let
            c = Math.cos(rad);
        out[Matrix.M11] = c;
        out[Matrix.M12] = -s;
        out[Matrix.M13] = 0;
        out[Matrix.M21] = s;
        out[Matrix.M22] = c;
        out[Matrix.M23] = 0;
        out[Matrix.M31] = 0;
        out[Matrix.M32] = 0;
        out[Matrix.M33] = 1;
        return out;
    }

    static fromScale(v, out) {
        out[Matrix.M11] = v[0];
        out[Matrix.M12] = 0;
        out[Matrix.M13] = 0;
        out[Matrix.M21] = 0;
        out[Matrix.M22] = v[1];
        out[Matrix.M23] = 0;
        out[Matrix.M31] = 0;
        out[Matrix.M32] = 0;
        out[Matrix.M33] = 1;
        return out;
    }

    static fromTranslation(v, out) {
        out[Matrix.M11] = 1;
        out[Matrix.M12] = 0;
        out[Matrix.M13] = v[0];
        out[Matrix.M21] = 0;
        out[Matrix.M22] = 1;
        out[Matrix.M23] = v[1];
        out[Matrix.M31] = 0;
        out[Matrix.M32] = 0;
        out[Matrix.M33] = 1;
        return out;
    }

    static add(a, b, out) {
        out = out || a;
        out[Matrix.M11] = a[Matrix.M11] + b[Matrix.M11];
        out[Matrix.M12] = a[Matrix.M12] + b[Matrix.M12];
        out[Matrix.M13] = a[Matrix.M13] + b[Matrix.M13];
        out[Matrix.M21] = a[Matrix.M21] + b[Matrix.M21];
        out[Matrix.M22] = a[Matrix.M22] + b[Matrix.M22];
        out[Matrix.M23] = a[Matrix.M23] + b[Matrix.M23];
        out[Matrix.M31] = a[Matrix.M31] + b[Matrix.M31];
        out[Matrix.M32] = a[Matrix.M32] + b[Matrix.M32];
        out[Matrix.M33] = a[Matrix.M33] + b[Matrix.M33];
        return out;
    }

    static sub(a, b, out) {
        out = out || a;
        out[Matrix.M11] = a[Matrix.M11] - b[Matrix.M11];
        out[Matrix.M12] = a[Matrix.M12] - b[Matrix.M12];
        out[Matrix.M13] = a[Matrix.M13] - b[Matrix.M13];
        out[Matrix.M21] = a[Matrix.M21] - b[Matrix.M21];
        out[Matrix.M22] = a[Matrix.M22] - b[Matrix.M22];
        out[Matrix.M23] = a[Matrix.M23] - b[Matrix.M23];
        out[Matrix.M31] = a[Matrix.M31] - b[Matrix.M31];
        out[Matrix.M32] = a[Matrix.M32] - b[Matrix.M32];
        out[Matrix.M33] = a[Matrix.M33] - b[Matrix.M33];
        return out;
    }

    static mul(a, b, out) {
        out = out || a;
        if (typeof b === 'number') {
            out[Matrix.M11] = a[Matrix.M11] * b;
            out[Matrix.M12] = a[Matrix.M12] * b;
            out[Matrix.M13] = a[Matrix.M13] * b;
            out[Matrix.M21] = a[Matrix.M21] * b;
            out[Matrix.M22] = a[Matrix.M22] * b;
            out[Matrix.M23] = a[Matrix.M23] * b;
            out[Matrix.M31] = a[Matrix.M31] * b;
            out[Matrix.M32] = a[Matrix.M32] * b;
            out[Matrix.M33] = a[Matrix.M33] * b;
        } else {
            let a11 = a[Matrix.M11]; let a12 = a[Matrix.M12]; let a13 = a[Matrix.M13];
            let a21 = a[Matrix.M21]; let a22 = a[Matrix.M22]; let a23 = a[Matrix.M23];
            let a31 = a[Matrix.M31]; let a32 = a[Matrix.M32]; let a33 = a[Matrix.M33];
            let b11 = b[Matrix.M11]; let b12 = b[Matrix.M12]; let b13 = b[Matrix.M13];
            let b21 = b[Matrix.M21]; let b22 = b[Matrix.M22]; let b23 = b[Matrix.M23];
            let b31 = b[Matrix.M31]; let b32 = b[Matrix.M32]; let
                b33 = b[Matrix.M33];

            out[0] = a11 * b11 + a12 * b21 + a13 * b31;
            out[1] = a11 * b12 + a12 * b22 + a13 * b32;
            out[2] = a11 * b13 + a12 * b23 + a13 * b33;

            out[3] = a21 * b11 + a22 * b21 + a23 * b31;
            out[4] = a21 * b12 + a22 * b22 + a23 * b32;
            out[5] = a21 * b13 + a22 * b23 + a23 * b33;

            out[6] = a31 * b11 + a32 * b21 + a33 * b31;
            out[7] = a31 * b12 + a32 * b22 + a33 * b32;
            out[8] = a31 * b13 + a32 * b23 + a33 * b33;
        }
        return out;
    }

    static transpose(m, out) {
        out[Matrix.M11] = m[Matrix.M11];
        out[Matrix.M12] = m[Matrix.M21];
        out[Matrix.M13] = m[Matrix.M31];
        out[Matrix.M21] = m[Matrix.M12];
        out[Matrix.M22] = m[Matrix.M22];
        out[Matrix.M23] = m[Matrix.M32];
        out[Matrix.M31] = m[Matrix.M13];
        out[Matrix.M32] = m[Matrix.M23];
        out[Matrix.M33] = m[Matrix.M33];
        return out;
    }

    static equals(a, b) {
        return Math.abs(a[Matrix.M11] - b[Matrix.M11]) <= EPS &&
            Math.abs(a[Matrix.M12] - b[Matrix.M12]) <= EPS &&
            Math.abs(a[Matrix.M13] - b[Matrix.M13]) <= EPS &&
            Math.abs(a[Matrix.M21] - b[Matrix.M21]) <= EPS &&
            Math.abs(a[Matrix.M22] - b[Matrix.M22]) <= EPS &&
            Math.abs(a[Matrix.M23] - b[Matrix.M23]) <= EPS &&
            Math.abs(a[Matrix.M31] - b[Matrix.M31]) <= EPS &&
            Math.abs(a[Matrix.M32] - b[Matrix.M32]) <= EPS &&
            Math.abs(a[Matrix.M33] - b[Matrix.M33]) <= EPS;
    }

    /**
     * Decomposing a 2d matrix in QR composition
     * @param a
     * @param out
     */
    static decompose(mat, out) {
        const a = mat[Matrix.M11];
        const b = mat[Matrix.M21];
        const c = mat[Matrix.M12];
        const d = mat[Matrix.M22];
        const skewX = -Math.atan2(-c, d);
        const skewY = Math.atan2(b, a);
        const delta = Math.abs(skewX + skewY);
        if (delta < EPS || Math.abs(Math.PI * 0.5 - delta) < EPS) {
            out.rotation = skewY;
            if (a < 0 && d >= 0) {
                out.rotation += (out.rotation <= 0) ? Math.PI : -Math.PI;
            }
            out.skew[0] = out.skew[1] = 0;
        } else {
            out.rotation = 0;
            out.skew[0] = skewX;
            out.skew[1] = skewY;
        }
        out.scale[0] = Math.sqrt((a * a) + (b * b));
        out.scale[1] = Math.sqrt((c * c) + (d * d));

        out.translation[0] = mat[Matrix.M13];
        out.translation[1] = mat[Matrix.M23];
        return out;
    }

    /**
     * Recomposing a 2d matrix
     * @param c
     * @param out
     */
    static recompose(com, pivot, out) {
        Matrix.reset(out);
        Matrix.translate(out, [-pivot[0], -pivot[1]]);
        Matrix.scale(out, com.scale);
        Matrix.rotate(out, com.rotation);
        Matrix.skew(out, com.skew);
        Matrix.translate(out, pivot);
        Matrix.translate(out, com.translation);
        return out;
    }
}