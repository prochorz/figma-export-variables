import {
    E_COLOR_TYPES,
    E_VARIABLE_RESOLVED_TYPES
} from '../constants/figma-constants';

function isRGBAColor(color: RGBA) {
    return Boolean(color?.a);
}
function isRGBColor(color: RGB | RGBA) {
    return Boolean(color?.r);
}

function isVariableAliasType(variable: VariableAlias | VariableValue) {
    return (variable as VariableAlias).type === "VARIABLE_ALIAS"
}

function isRowsOrColumnsPattern(grid: RowsColsLayoutGrid) {
    return grid.pattern === "ROWS" || grid.pattern === "COLUMNS"
}
function isDropShadow(effect: DropShadowEffect) {
    return effect.type === "DROP_SHADOW"
}
function isInnerShadow(effect: InnerShadowEffect) {
    return effect.type === "INNER_SHADOW"
}

function transformColor(colorFormat: E_COLOR_TYPES, variableType: E_VARIABLE_RESOLVED_TYPES, value: RGBA) {
    if (variableType === E_VARIABLE_RESOLVED_TYPES.COLOR && colorFormat === E_COLOR_TYPES.HEX) {
        const hexColor = (
            value.r.toString(16).padStart(2, "0") +
            value.g.toString(16).padStart(2, "0") +
            value.b.toString(16).padStart(2, "0")
        ).toUpperCase();

        const alphaHex = Math.round(value.a * 255)
            .toString(16)
            .padStart(2, "0")
            .toUpperCase();

        return "#" + hexColor + (alphaHex === "FF" ? "" : alphaHex);
    }

    return value;
}

export {
    isRGBColor,
    isRGBAColor,
    isDropShadow,
    isInnerShadow,
    transformColor,
    isVariableAliasType,
    isRowsOrColumnsPattern
}