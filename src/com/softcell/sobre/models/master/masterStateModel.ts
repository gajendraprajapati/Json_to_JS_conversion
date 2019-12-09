export class MasterStateModel {
    public Name: string;
    public LastModifiedDate: string;
    public FileID: number;
    public INSTITUTION_ID: number;
    public PrimaryField: string;
    public status: string;
    public ForeignField: string;
}

export class MasterStateLookupModel {
    [key: string]: MasterStateModel;
}
