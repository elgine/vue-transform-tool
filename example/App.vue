<template>
    <div class="app">
        <canvas ref="canvas" :style="canvasStyle"></canvas>
        <transform-tool :size="size" :offset="offset" v-model="value"/>
    </div>
</template>

<style>
.app{
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #000;
    margin: 0;
    padding: 0;
}
canvas{
    position: absolute;
    display: block;
}
</style>

<script>
import TransformTool from "../dist";
export default {
    components: {TransformTool},
    data: () => ({
        size: {width: 120, height: 120},
        resolution: [1024, 768],
        canvasSize: {width: 1024, height: 768},
        offset: {top: 0, left: 0},
        value: {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0}
    }),
    computed: {
        ratio(){
            return this.resolution[0] / this.resolution[1];
        },
        canvasStyle(){
            return {
                left: `${this.offset.left}px`,
                top: `${this.offset.top}px`
            };
        }
    },
    mounted(){
        this.onResize();
        this.draw();
    },
    updated(){
        this.draw();
    },
    methods: {
        draw(){
            const v = this.value;
            const canvas = this.$refs.canvas;
            if (canvas) {
                canvas.width = this.canvasSize.width;
                canvas.height = this.canvasSize.height;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);
                ctx.save();
                ctx.setTransform(v.a, v.b, v.c, v.d, v.tx, v.ty);
                ctx.fillStyle = 'red';
                ctx.fillRect(0, 0, this.size.width, this.size.height);
                ctx.restore();
            }
        },
        onResize(){
            const canvas = this.$refs.canvas;
            if (canvas) {
                if (canvas.parentElement) {
                    let maxHeight = canvas.parentElement.clientHeight;
                    let maxWidth  = canvas.parentElement.clientWidth;
                    let w = 0;
                    let h = 0;
                    if (this.ratio * maxHeight <= maxWidth) {
                        w = ~~(this.ratio * maxHeight);
                        h = ~~maxHeight;
                    } else {
                        w = ~~maxWidth;
                        h = ~~(maxWidth / this.ratio);
                    }
                    this.canvasSize.width = w;
                    this.canvasSize.height = h;
                    this.offset.left = (maxWidth - w) * 0.5;
                    this.offset.top = (maxHeight - h) * 0.5;
                }
            }
        }
    },
    directives: {
        resize: {
            bind(el){
                window.addEventListener('resize', this.onResize);
            },
            unbind(el){
                window.removeEventListener('resize', this.onResize);
            }
        }
    }
}
</script>