export default (...styles) => {
    return styles.reduce((style, styleValue) => {
        return styleValue ? (Object.assign(style, typeof styleValue === 'function' ? styleValue() : styleValue)) : style;
    }, {});
};