import { getUnit } from './utils/unit-utils';
import { getColorSpecification } from './utils/color-utils';
import { sortObjectsByAttributeNew } from './utils/generic-utils';
import {
    E_UNIT_SPEC,
    E_COLOR_SPEC
} from './constants/config-constants';

type TMode = VariableCollection['modes'][0];
type TResolvedVariables = Record<VariableResolvedDataType, Array<any>>

class FigmaExportPlugin {
    localCollections = figma.variables.getLocalVariableCollections();

    unitRem = E_UNIT_SPEC.PX;
    colorSpecification = E_COLOR_SPEC.HEX;

    getOrgVariablse(variable: Variable, mode: TMode): Variable {
        const valuesLink = variable?.valuesByMode?.[mode.modeId] as VariableAlias;
        const isVariableAlias = valuesLink?.type === "VARIABLE_ALIAS";

        return isVariableAlias
            ? this.getOrgVariablse(figma.variables.getVariableById(valuesLink.id) as Variable, mode)
            : variable
    }

    getExport(collection: VariableCollection) {
        return collection.modes.map((mode) => {
            const items = collection.variableIds.reduce((acc, id) => {
                const variable = figma.variables.getVariableById(id) as Variable;
                const orgVariable = this.getOrgVariablse(variable, mode);

                const getValue = () => {
                    const value = orgVariable.valuesByMode?.[mode.modeId] || Object.values(orgVariable.valuesByMode)[0];

                    switch(variable.resolvedType) {
                        case 'COLOR':
                            return getColorSpecification(value as RGBA, this.colorSpecification);
                        case 'FLOAT':
                            const { numberRem, numberUnit } = getUnit(value as number, this.unitRem);
                            return `${numberRem}${numberUnit}`;
                        default:
                            return null;
                    }
                }

                const normaliseValue = getValue();

                if (normaliseValue) {
                    const isVariableAlias = variable.name === orgVariable.name;

                    acc[variable.resolvedType].push({
                        name: variable.name,
                        value: normaliseValue,
                        var: orgVariable.name,
                        alias: isVariableAlias
                    });
                }

                return acc;
            }, {
                COLOR: [],
                FLOAT: [],
                BOOLEAN: [],
                STRING: []
            } as TResolvedVariables);

            return Object.entries(items).reduce((acc, [key, item]) => {
                if (item.length) {
                    acc[key] = sortObjectsByAttributeNew(item);
                }

                return acc;
            }, { mode } as any)
        });
    }

    run() {
        return this.localCollections.map(({ id }) => {
            const collection = figma.variables.getVariableCollectionById(id) as VariableCollection;

            return {
                name: collection.name,
                values: this.getExport(collection)
            };
        });
    }
}

const getFormatedVariables = () => {
    const instance = new FigmaExportPlugin();

    return instance.run();
};

export { getFormatedVariables };
