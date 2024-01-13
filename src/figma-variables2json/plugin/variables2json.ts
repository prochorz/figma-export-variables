import {
    isRGBColor,
    isRGBAColor,
    isDropShadow,
    isInnerShadow,
    isVariableAliasType,
    isRowsOrColumnsPattern
} from '../utils/figma-util';
import { GeneratedStyle } from '../utils/GeneratedStyle';

import { E_VARIABLE_RESOLVED_TYPES } from '../constants/figma-constants';

function getColorValue(color: any) {
    if (isRGBColor(color)) {
        return {
            r: Math.round(color.r * 255),
            g: Math.round(color.g * 255),
            b: Math.round(color.b * 255),
            a: isRGBAColor(color) ? Number(color.a.toFixed(2)) : 1
        }

    }
    return color;
}

function getGridValue(layerStyle: GridStyle) {
    return {
        layoutGrids: layerStyle.layoutGrids.map((grid: any) => {
            return isRowsOrColumnsPattern(grid)
                ? {
                    pattern: grid.pattern,
                    sectionSize: grid.sectionSize,
                    color: getColorValue(grid.color),
                    alignment: grid.alignment,
                    gutterSize: grid.gutterSize,
                    offset: grid.offset,
                    count: grid.count,
                }
                : {
                    pattern: grid.pattern,
                    sectionSize: grid.sectionSize,
                    color: getColorValue(grid.color),
                };
        })
    };
}

function getTextValue(layerStyle: TextStyle) {
    return {
        fontSize: layerStyle.fontSize,
        fontFamily: layerStyle.fontName.family,
        fontWeight: layerStyle.fontName.style,
        lineHeight: layerStyle.lineHeight.unit === "AUTO" ? "auto" : layerStyle.lineHeight.value,
        lineHeightUnit: layerStyle.lineHeight.unit,
        letterSpacing: layerStyle.letterSpacing.value,
        letterSpacingUnit: layerStyle.letterSpacing.unit,
        textCase: layerStyle.textCase,
        textDecoration: layerStyle.textDecoration,
    };
}

function getEffectValue(layerStyle: EffectStyle) {
    return {
        effects: layerStyle.effects.map((effect: any) => {
            const isShadow = isDropShadow(effect) || isInnerShadow(effect);
            return isShadow
                ? {
                    type: effect.type,
                    color: getColorValue(effect.color),
                    offset: effect.offset,
                    radius: effect.radius,
                    spread: effect.spread,
                }
                : {
                    type: effect.type,
                    radius: effect.radius,
                }
        })
    };
}

function normalizeVariableCollection(collection: VariableCollection) {
    const variableCollections = figma.variables.getLocalVariableCollections();

    const { variableIds, modes } = collection;
 
    return variableIds.map(id => {
        const variable = figma.variables.getVariableById(id);
 
        if (variable) {   
            const type = E_VARIABLE_RESOLVED_TYPES[variable.resolvedType];

            const values = modes.map(mode => {
                const variableValue = variable.valuesByMode[mode.modeId];
                const isAlias = isVariableAliasType(variableValue);
                let value;

                if (isAlias) {
                    const referencedVariable = figma.variables.getVariableById((variableValue as VariableAlias).id);

                    if (referencedVariable) {
                        const variableCollection = variableCollections.find(vc => vc.id == referencedVariable.variableCollectionId);

                        value = {
                            collection: variableCollection?.name,
                            name: referencedVariable.name
                        };
                    }
                } else {
                    value = getColorValue(variableValue);
                }

                return {
                    modeName: mode.name,
                    isAlias,
                    value
                }
            });

            return new GeneratedStyle(collection.name, variable.name, type, values);
        }

        return null;
    }).filter(Boolean) as Array<GeneratedStyle>;
}

function getVariables() {
    const variables = figma.variables.getLocalVariableCollections().flatMap(normalizeVariableCollection);

    const textStyles = figma.getLocalTextStyles().map(textStyle => {
        return new GeneratedStyle("Typography", textStyle.name, E_VARIABLE_RESOLVED_TYPES.TYPOGRAPHY, [{
            modeName: "Style",
            isAlias: false,
            value: getTextValue(textStyle)
        }]);
    });

    const effectStyles = figma.getLocalEffectStyles().map(effectStyle => {
        return new GeneratedStyle("Effects", effectStyle.name, E_VARIABLE_RESOLVED_TYPES.EFFECT, [{
            modeName: "Style",
            isAlias: false,
            value: getEffectValue(effectStyle)
        }]);
    });

    const gridStyles = figma.getLocalGridStyles().map(gridStyle => {
        return new GeneratedStyle("Grids", gridStyle.name, E_VARIABLE_RESOLVED_TYPES.GRID, [{
            modeName: "Style",
            isAlias: false,
            value: getGridValue(gridStyle)
        }]);
    });

    return [
        ...variables,
        ...textStyles,
        ...effectStyles,
        ...gridStyles
    ];
}

export { getVariables };
