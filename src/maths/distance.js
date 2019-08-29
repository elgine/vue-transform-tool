export default (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const distanceSelf = (x, y) => {
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
};