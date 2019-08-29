import Vue from 'vue';
import distance from '../maths/distance';

const bindFakeDragDirective = (el, value) => {
    if (!value) return;
    const onMouseDown = (e) => {
        const el = e.target;
        if (!el.__fakeDrag) return;
        const fakeDrag = el.__fakeDrag;
        const dragInfo = fakeDrag.info;
        dragInfo.hasDown = true;
        dragInfo.curPos.x = dragInfo.lastPos.x = dragInfo.downPos.x = e.pageX;
        dragInfo.curPos.y = dragInfo.lastPos.y = dragInfo.downPos.y = e.pageY;
        fakeDrag.value.onBeginDrag && fakeDrag.value.onBeginDrag(dragInfo);

        const onMove = (e) => {
            const deltaForDrag = fakeDrag.value.deltaForDrag || 10;
            dragInfo.curPos.x = e.pageX;
            dragInfo.curPos.y = e.pageY;
            if (distance(dragInfo.curPos, dragInfo.downPos) >= deltaForDrag) {
                dragInfo.isDragging = true;
            }
            if (dragInfo.isDragging) {
                fakeDrag.value.onDrag && fakeDrag.value.onDrag(dragInfo);
            }
            dragInfo.lastPos.x = dragInfo.curPos.x;
            dragInfo.lastPos.y = dragInfo.curPos.y;
        };

        const onUp = (e) => {
            dragInfo.hasDown = false;
            const isDragging = dragInfo.isDragging;
            dragInfo.isDragging = false;
            if (isDragging) {
                fakeDrag.value.onDrop && fakeDrag.value.onDrop(dragInfo);
            }
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };
    el.addEventListener('mousedown', onMouseDown);
    el.__fakeDrag = {
        info: {
            hasDown: false,
            isDragging: false,
            curPos: { x: 0, y: 0 },
            lastPos: { x: 0, y: 0 },
            downPos: { x: 0, y: 0 }
        },
        value,
        onMouseDown
    };
};

Vue.directive('fake-drag', {
    bind(el, { value }) {
        bindFakeDragDirective(el, value)
    },
    update(el, { value }) {
        if (!el.__fakeDrag) {
            bindFakeDragDirective(el, value);
        } else {
            el.__fakeDrag.value = value;
        }
    },
    unbind(el) {
        if (!el.__fakeDrag) return;
        el.removeEventListener('mousedown', el.__fakeDrag.onMouseDown);
        el.__fakeDrag = undefined;
    }
})