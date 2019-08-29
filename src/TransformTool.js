import Vue from 'vue';
import './directives/fakeDrag';
import Matrix from './maths/matrix';
import Vector from './maths/vector';
import { applyRotate, applyScale, applyTranslate } from './apply';
import {
    ANCHOR_STYLE_LEFT, ANCHOR_STYLE_TOP, ANCHOR_STYLE_RIGHT, ANCHOR_STYLE_BOTTOM,
    ANCHOR_STYLE_TOP_LEFT, ANCHOR_STYLE_TOP_RIGHT, ANCHOR_STYLE_BOTTOM_LEFT, ANCHOR_STYLE_BOTTOM_RIGHT,
    ANCHOR_STYLE_CENTER, ANCHOR_STYLE_ROTATOR, ROOT_STYLE_BASE
} from './styles';
import stylesx from './stylesx';
import { toAngle } from './maths/angRad';

export default Vue.extend({
    model: {
        prop: 'value',
        event: 'change'
    },
    props: {
        minSize: {
            type: Object,
            default: () => ({ width: 5, height: 5 })
        },
        styles: {
            type: Object,
            default: () => ({})
        },
        classes: {
            type: Object,
            default: () => ({})
        },
        size: {
            type: Object,
            default: () => ({ width: 0, height: 0 })
        },
        offset: {
            type: Object,
            default: () => ({ left: 0, top: 0 })
        },
        value: {
            type: Object,
            default: () => ({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 })
        }
    },
    data: () => {
        return {
            lastTranslation: [0, 0],
            lastScale: [1, 1],
            lastSkew: [0, 0],
            lastRotation: 0,

            tempMatrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
            lastMatrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
            matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],

            relative: { left: 0, top: 0 },
            translation: { x: 0, y: 0 },
            scale: { x: 1, y: 1 },
            skew: { x: 0, y: 0 },
            rotation: 0
        }
    },
    watch: {
        value(v) {
            this.updateComponents(v);
        }
    },
    mounted() {
        this.updateComponents();
    },
    methods: {
        updateComponents(v) {
            const transform = {
                translation: [0, 0],
                scale: [1, 1],
                rotation: 0,
                skew: [0, 0]
            };
            Matrix.fromSvgMatrix(v || this.value, this.matrix);
            Matrix.decompose(this.matrix, transform);
            this.translation.x = transform.translation[0];
            this.translation.y = transform.translation[1];
            this.scale.x = transform.scale[0];
            this.scale.y = transform.scale[1];
            this.rotation = transform.rotation;
            this.skew.x = transform.skew[0];
            this.skew.y = transform.skew[1];
        },
        generateFakeDragValue(type) {
            const onBeginDrag = (e) => {
                Vector.set(this.translation.x, this.translation.y, this.lastTranslation);
                Vector.set(this.scale.x, this.scale.y, this.lastScale);
                Vector.set(this.skew.x, this.skew.y, this.lastSkew);
                this.lastRotation = this.rotation;
                Matrix.clone(this.matrix, this.lastMatrix);
                if (this.$refs['root'] && this.$refs['root'].parentElement) {
                    const b = this.$refs['root'].parentElement.getBoundingClientRect();
                    this.relative.left = b.left;
                    this.relative.top = b.top;
                }
            };
            const onDrag = ({ curPos, downPos }) => {
                const params = {
                    anchorType: type,
                    relative: this.relative,
                    offset: this.offset,
                    minSize: this.minSize,
                    size: this.size,
                    matrix: this.lastMatrix,
                    translation: this.lastTranslation.slice(),
                    scale: this.lastScale.slice(),
                    skew: this.lastSkew.slice(),
                    rotation: this.lastRotation,
                    downPos,
                    curPos
                };
                Matrix.reset(this.tempMatrix);
                // Apply rotation
                if (type === 'rotator') {
                    applyRotate(params);
                }
                // Apply translation
                else if (type === 'center') {
                    applyTranslate(params);
                }
                // Apply scale
                else {
                    applyScale(params);
                }
                Matrix.recompose({
                    translation: params.translation,
                    scale: params.scale,
                    rotation: params.rotation,
                    skew: params.skew
                }, [0, 0], this.tempMatrix);
                this.$emit('change', Matrix.toSVGMatrix(this.tempMatrix, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }));
            };
            return {
                onBeginDrag,
                onDrag
            };
        }
    },
    render(h) {
        const clas = this.classes || {};
        const anchorClassNameBase = clas.anchor ? clas.anchor.base : '';
        const anchorClassNameCenter = clas.anchor ? clas.anchor.center : '';
        const anchorClassNameRotator = clas.anchor ? clas.anchor.rotator : '';

        const stys = this.styles || {};
        const anchorStyleBase = stys.anchor ? stys.anchor.base : {};
        const anchorStyleCenter = stys.anchor ? stys.anchor.center : {};
        const anchorStyleRotator = stys.anchor ? stys.anchor.rotator : {};

        const rootStyle = stylesx(
            ROOT_STYLE_BASE, this.styles.root,
            {
                left: `${this.offset.left}px`,
                top: `${this.offset.top}px`,
                width: `${this.size.width * Math.abs(this.scale.x)}px`,
                height: `${this.size.height * Math.abs(this.scale.y)}px`,
                transformOrigin: 'left top',
                transform: `translate(${this.translation.x}px, ${this.translation.y}px) skew(${toAngle(this.skew.x)}, ${toAngle(this.skew.y)}) rotate(${toAngle(this.rotation)}deg)`
            }
        );
        return h('div', {
            class: this.classes.root,
            style: rootStyle
        }, [
            h('div', {
                class: anchorClassNameBase, style: stylesx(ANCHOR_STYLE_LEFT, anchorStyleBase),
                directives: [
                    {
                        name: 'fake-drag',
                        value: this.generateFakeDragValue('left')
                    }
                ]
            }),
            h('div', {
                class: anchorClassNameBase, style: stylesx(ANCHOR_STYLE_TOP, anchorStyleBase),
                directives: [
                    {
                        name: 'fake-drag',
                        value: this.generateFakeDragValue('top')
                    }
                ]
            }),
            h('div', {
                class: anchorClassNameBase, style: stylesx(ANCHOR_STYLE_RIGHT, anchorStyleBase),
                directives: [
                    {
                        name: 'fake-drag',
                        value: this.generateFakeDragValue('right')
                    }
                ]
            }),
            h('div', {
                class: anchorClassNameBase, style: stylesx(ANCHOR_STYLE_BOTTOM, anchorStyleBase),
                directives: [
                    {
                        name: 'fake-drag',
                        value: this.generateFakeDragValue('bottom')
                    }
                ]
            }),
            h('div', {
                class: anchorClassNameBase, style: stylesx(ANCHOR_STYLE_TOP_LEFT, anchorStyleBase),
                directives: [
                    {
                        name: 'fake-drag',
                        value: this.generateFakeDragValue('top-left')
                    }
                ]
            }),
            h('div', {
                class: anchorClassNameBase, style: stylesx(ANCHOR_STYLE_TOP_RIGHT, anchorStyleBase),
                directives: [
                    {
                        name: 'fake-drag',
                        value: this.generateFakeDragValue('top-right')
                    }
                ]
            }),
            h('div', {
                class: anchorClassNameBase, style: stylesx(ANCHOR_STYLE_BOTTOM_LEFT, anchorStyleBase),
                directives: [
                    {
                        name: 'fake-drag',
                        value: this.generateFakeDragValue('bottom-left')
                    }
                ]
            }),
            h('div', {
                class: anchorClassNameBase, style: stylesx(ANCHOR_STYLE_BOTTOM_RIGHT, anchorStyleBase),
                directives: [
                    {
                        name: 'fake-drag',
                        value: this.generateFakeDragValue('bottom-right')
                    }
                ]
            }),
            h('div', {
                class: anchorClassNameCenter, style: stylesx(ANCHOR_STYLE_CENTER, anchorStyleCenter),
                directives: [
                    {
                        name: 'fake-drag',
                        value: this.generateFakeDragValue('center')
                    }
                ]
            }),
            h('div', {
                class: anchorClassNameRotator, style: stylesx(ANCHOR_STYLE_ROTATOR, anchorStyleRotator),
                directives: [
                    {
                        name: 'fake-drag',
                        value: this.generateFakeDragValue('rotator')
                    }
                ]
            })
        ]);
    }
});