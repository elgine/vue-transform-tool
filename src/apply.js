import Vector from './maths/vector';
import Matrix from './maths/matrix';
import { clamp } from 'lodash';

const getAnchorPoint = (params, abs = true) => {
    const { anchorType, matrix, size } = params;
    let anchor = [0, 0];
    switch (anchorType) {
        case 'left':
            anchor[0] = size.width;
            anchor[1] = size.height * 0.5;
            break;
        case 'right':
            anchor[0] = 0;
            anchor[1] = size.height * 0.5;
            break;
        case 'top':
            anchor[0] = size.width * 0.5;
            anchor[1] = size.height;
            break;
        case 'bottom':
            anchor[0] = size.width * 0.5;
            anchor[1] = 0;
            break;
        case 'top-left':
            anchor[0] = size.width;
            anchor[1] = size.height;
            break;
        case 'top-right':
            anchor[1] = size.height;
            break;
        case 'bottom-left':
            anchor[0] = size.width;
            break;
        case 'bottom-right':
            break;
        case 'center':
        case 'rotator':
            anchor[0] = size.width * 0.5;
            anchor[1] = size.height * 0.5;
            break;
    }
    return abs ? Vector.transform(anchor, matrix) : anchor;
};

export const applyRotate = (params) => {
    const anchor = getAnchorPoint(params);
    const localAnchor = getAnchorPoint(params, false);
    const { curPos, downPos, relative, offset, translation, scale } = params;

    const v1 = [
        curPos.x - relative.left - offset.left,
        curPos.y - relative.top - offset.top
    ];
    const v2 = [
        downPos.x - relative.left - offset.left,
        downPos.y - relative.top - offset.top
    ];
    const rad = Vector.rad1([
        v1[0] - anchor[0],
        v1[1] - anchor[1]
    ], [
        v2[0] - anchor[0],
        v2[1] - anchor[1]
    ]);

    params.rotation += rad;

    const rm = Matrix.create();
    Matrix.recompose({
        translation,
        scale,
        rotation: params.rotation,
        skew: [0, 0]
    }, [0, 0], rm);
    Vector.transform(localAnchor, rm);
    translation[0] -= localAnchor[0] - anchor[0];
    translation[1] -= localAnchor[1] - anchor[1];
};

export const applyScale = (params) => {
    const anchor = getAnchorPoint(params);
    const localAnchor = getAnchorPoint(params, false);
    const { anchorType, minSize, curPos, downPos, rotation, translation, scale, size } = params;
    const v = [
        curPos.x - downPos.x,
        curPos.y - downPos.y
    ];
    const tempM = Matrix.invert(Matrix.fromRotation(rotation, Matrix.create()));
    Vector.transform(v, tempM);

    if (anchorType.indexOf('left') >= 0) {
        v[0] *= -1;
    }
    if (anchorType.indexOf('top') >= 0) {
        v[1] *= -1;
    }
    if (!(/(left)|(right)/g.test(anchorType))) {
        v[0] = 0;
    }
    if (!(/(top)|(bottom)/g.test(anchorType))) {
        v[1] = 0;
    }

    const actualWidth = size.width * scale[0];
    const actualHeight = size.height * scale[1];
    const s = [
        clamp(actualWidth + v[0], minSize.width, Number.MAX_SAFE_INTEGER) / actualWidth,
        clamp(actualHeight + v[1], minSize.height, Number.MAX_SAFE_INTEGER) / actualHeight
    ];

    scale[0] *= s[0];
    scale[1] *= s[1];

    Matrix.recompose({
        translation,
        scale,
        rotation: rotation,
        skew: [0, 0]
    }, [0, 0], tempM);
    Vector.transform(localAnchor, tempM);

    translation[0] -= localAnchor[0] - anchor[0];
    translation[1] -= localAnchor[1] - anchor[1];
};

export const applyTranslate = (params) => {
    const { curPos, downPos, translation } = params;
    translation[0] += curPos.x - downPos.x;
    translation[1] += curPos.y - downPos.y;
};