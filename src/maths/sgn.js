// Copyright (c) 2019 elgine
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export const sgn = (x, y = 0) => {
    if (x < y) return -1;
    else if (x > y) return 1;
    return 0;
};