import { transformColor } from './utils/figma-util';
import { getVariables } from './plugin/variables2json';
import { GeneratedStyle } from './utils/GeneratedStyle';
import { E_COLOR_TYPES } from './constants/figma-constants';

function transformConfig(config: any) {
    const { excludePrivate, colorFormat } = config.settings;
    const { variables } = config;

    const collections = variables.reduce((acc: Array<any>, variable: any) => {
        const generatedStyle = GeneratedStyle.fromObject(variable);
        const isPrivateExist = !(excludePrivate && generatedStyle.isPrivate());

        let collection = acc.find((c) => c.name == generatedStyle.collection);

        if (isPrivateExist) {
            if (!collection) {
                collection = {
                    name: generatedStyle.collection,
                    modes: []
                };

                acc.push(collection);
            }
            for (const styleValue of generatedStyle.values) {
                const mode = collection.modes.find(({ name }: any) => name == styleValue.modeName);
                const variableInfo = {
                    name: generatedStyle.name,
                    type: generatedStyle.type,
                    isAlias: styleValue.isAlias,
                    value: styleValue.isAlias
                        ? styleValue.value
                        : transformColor(colorFormat, generatedStyle.type, styleValue.value)
                };

                if (mode) {
                    mode.variables.push(variableInfo);
                } else {
                    collection.modes.push({
                        name: styleValue.modeName,
                        variables: [variableInfo]
                    });
                }
            }
        }

        return acc;
    }, []);

    return { collections };
}

function getFormatedVariables() {
    return transformConfig({
        settings: {
            excludePrivate: false,
            colorFormat: E_COLOR_TYPES.HEX
        },
        variables: getVariables()
    });
}

export { getFormatedVariables };
