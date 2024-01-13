import type { E_VARIABLE_RESOLVED_TYPES } from '../constants/figma-constants';

interface I_VALUE {
    modeName: string,
    isAlias: boolean,
    value: any
}

class GeneratedStyle {
    collection!: string;
    name!: string;
    type!: E_VARIABLE_RESOLVED_TYPES;
    values!: Array<I_VALUE>;

    constructor(collection: string, name: string, type: E_VARIABLE_RESOLVED_TYPES, values: Array<I_VALUE>) {
        this.collection = collection;
        this.name = name;
        this.type = type;
        this.values = values;
    }

    static fromObject(obj: any) {
        return new GeneratedStyle(obj.collection, obj.name, obj.type, obj.values);
    }

    public isPrivate() {
        return [...this.name.split("/"), this.collection].some(part => part.startsWith("_"));
    }
}

export { GeneratedStyle };
