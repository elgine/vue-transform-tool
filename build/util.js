const isDev = () => {
    return process.env.NODE_ENV && typeof process.env.NODE_ENV === 'string' &&
    /((dev)|(developement))/g.test(process.env.NODE_ENV.toLowerCase());
};

const isElectron = () => {
    return process.env.PLATFORM && typeof process.env.PLATFORM === 'string' &&
    /(electron)/g.test(process.env.PLATFORM.toLowerCase());
};

const getWebpackMode = () => {
    return isDev() ? 'development' : 'production';
};

module.exports = {
    isDev,
    isElectron,
    getWebpackMode
};