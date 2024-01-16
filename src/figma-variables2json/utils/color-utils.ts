import { E_COLOR_SPEC } from '../constants/config-constants';

function getRgbCode(num: number) {
    return Math.round(num * 255);
}

function getRgb(r: number, g: number, b: number, a: number) {
    const rRGB = getRgbCode(r);
    const gRGB = getRgbCode(g);
    const bRGB = getRgbCode(b);
    const aRGB = a == 1 ? '' : Math.round(a * 100) / 100;

    const rgb = `rgb(${rRGB}, ${gRGB}, ${bRGB})`;
    const rgba = `rgb(${rRGB}, ${gRGB}, ${bRGB} / ${aRGB})`;

    return !aRGB ? rgb : rgba;
}

function rgbaToHex(r: number, g: number, b: number, a: number) {
    const rHex = getHexCode(r);
    const gHex = getHexCode(g);
    const bHex = getHexCode(b);
    const aHex = a === 1 ? '' : getHexCode(a);
 
    const hex = `#${rHex}${gHex}${bHex}${aHex}`;

    return hex;
}

function getHexCode(num: number) {
    const rgba = getRgbCode(num);
    const hex = rgba.toString(16);
    const paddedHex = hex.length === 1 ? `0${hex}` : hex;
    return paddedHex;
}

function rgbaToHslOrHsla(r: number, g: number, b: number, a: number) {
    // Bring R, G, B, and A values into the range of 0-1
    r = clamp(r, 0, 1);
    g = clamp(g, 0, 1);
    b = clamp(b, 0, 1);
    a = clamp(a, 0, 1);
    // Find the maximum and minimum values
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    // Calculate lightness
    let lightness = (max + min) / 2;
    let lightnessGrey = Math.round(lightness * 100);
    // If max and min are equal, it's a shade of gray, and the saturation is 0
    if (max === min) {
        if (a === 1) {
            const hsl = `hsl(0 0 ${lightnessGrey}%)`;
            return hsl;
        } else {
            a = Math.round(a * 100) / 100;
            const hsla = `hsl(0 0 ${lightnessGrey}% / ${a})`;
            return hsla;
        }
    }
    // Calculate the difference and sum of max and min
    const diff = max - min;
    const sum = max + min;
    // Calculate saturation
    let saturation = lightness > 0.5 ? diff / (2 - sum) : diff / sum;
    // Calculate the hue
    let hue: any;
    switch (max) {
        case r:
            hue = (g - b) / diff + (g < b ? 6 : 0);
            break;
        case g:
            hue = (b - r) / diff + 2;
            break;
        case b:
            hue = (r - g) / diff + 4;
            break;
    }
    hue /= 6;
    // Round alpha value to 2 decimal places
    const roundedAlpha = Math.round(a * 100) / 100;
    hue = Math.round(hue * 360);
    saturation = Math.round(saturation * 100);
    lightness = Math.round(lightness * 100);
    if (roundedAlpha === 1) {
        // If alpha is 1 or 0, return HSL
        const hsl = `hsl(${hue} ${saturation}% ${lightness}%)`;
        return hsl;
    } else {
        // Otherwise, return HSLA
        const hsla = `hsl(${hue} ${saturation}% ${lightness}% / ${roundedAlpha})`;
        return hsla;
    }
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function getColorSpecification(rgba: RGBA, colorSpecification: E_COLOR_SPEC) {
    const { r, g, b, a } = rgba;
    switch (colorSpecification) {
        case E_COLOR_SPEC.HEX:
            return rgbaToHex(r, g, b, a);
        case E_COLOR_SPEC.RGB:
            return getRgb(r, g, b, a);
        case E_COLOR_SPEC.HSL:
            return rgbaToHslOrHsla(r, g, b, a);
        default:
            break;
    }
}

export {
    getColorSpecification
};