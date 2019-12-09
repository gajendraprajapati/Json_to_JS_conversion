
export class MasterModel {
    [collectionName: string]: CollectionData;
}

export class CollectionData {
    [primaryKey: string]: any;
}

// db schema for master collections state
// { name, primaryKey, lastModified}
