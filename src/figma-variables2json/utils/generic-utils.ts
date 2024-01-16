function sortObjectsByAttributeNew(list: Array<any>) {
    return list.sort((a: any, b: any) => a.name - b.name)
}

export {
    sortObjectsByAttributeNew
};