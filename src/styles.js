const ANCHOR_SIZE = 15;
const COLOR = '#fff';
export const ANCHOR_STYLE_BASE = {
    position: 'absolute',
    width: `${ANCHOR_SIZE}px`,
    height: `${ANCHOR_SIZE}px`,
    borderRadius: '50%',
    backgroundColor: COLOR,
    cursor: 'pointer',
    marginLeft: `${-ANCHOR_SIZE * 0.5}px`,
    marginTop: `${-ANCHOR_SIZE * 0.5}px`,
    boxShadow: `0 3px 6px rgba(0,0,0,0.23)`
};

export const ANCHOR_STYLE_LEFT = {
    ...ANCHOR_STYLE_BASE,
    top: '50%',
    left: 0
};

export const ANCHOR_STYLE_TOP = {
    ...ANCHOR_STYLE_BASE,
    top: 0,
    left: '50%'
};

export const ANCHOR_STYLE_RIGHT = {
    ...ANCHOR_STYLE_BASE,
    top: '50%',
    left: '100%'
};

export const ANCHOR_STYLE_BOTTOM = {
    ...ANCHOR_STYLE_BASE,
    top: '100%',
    left: '50%'
};

export const ANCHOR_STYLE_CENTER = {
    ...ANCHOR_STYLE_BASE,
    top: '50%',
    left: '50%'
};

export const ANCHOR_STYLE_ROTATOR = {
    ...ANCHOR_STYLE_BASE,
    top: '100%',
    left: '100%',
    marginLeft: ANCHOR_SIZE,
    marginTop: ANCHOR_SIZE
};

export const ANCHOR_STYLE_TOP_LEFT = {
    ...ANCHOR_STYLE_BASE,
    top: 0,
    left: 0
};

export const ANCHOR_STYLE_TOP_RIGHT = {
    ...ANCHOR_STYLE_BASE,
    top: 0,
    left: '100%'
};

export const ANCHOR_STYLE_BOTTOM_LEFT = {
    ...ANCHOR_STYLE_BASE,
    top: '100%',
    left: 0
};

export const ANCHOR_STYLE_BOTTOM_RIGHT = {
    ...ANCHOR_STYLE_BASE,
    top: '100%',
    left: '100%'
};

export const ROOT_STYLE_BASE = {
    position: 'absolute',
    boxSizing: 'border-box'
};