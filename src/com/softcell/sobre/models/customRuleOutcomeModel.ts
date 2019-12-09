export class Outcome {
    public TYPE: string;
    public OUTCM_VALUE: string;
    public BASE_FIELD: string;
    public BASE_FNAME: string;
    public BASE_DTYPE: string;
    public BASE_FTYPE: string;
    public AGGR_OPRTR: string;
    public COMPR_FIELD: string;
    public COMPR_FNAME: string;
    public COMPR_FTYPE: string;
    public COMPR_VALUE: string;
    public EMI_FIELD: string;
    public EMI_FNAME: string;
    public EMI_DTYPE: string;
    public EMI_FTYPE: string;
    public ROI_FIELD: string;
    public ROI_FNAME: string;
    public ROI_DTYPE: string;
    public ROI_FTYPE: string;
    public TENURE_FIELD: string;
    public TENURE_FNAME: string;
    public TENURE_FTYPE: string;
    public AGGR_TYPE: string;

    constructor(props?: Outcome) {
        if (!props) {
            return;
        }
        this.TYPE = props.TYPE;
        this.OUTCM_VALUE = props.OUTCM_VALUE;
        this.BASE_FIELD = props.BASE_FIELD;
        this.BASE_FNAME = props.BASE_FNAME;
        this.BASE_DTYPE = props.BASE_DTYPE;
        this.BASE_FTYPE = props.BASE_FTYPE;
        this.AGGR_OPRTR = props.AGGR_OPRTR;
        this.COMPR_FIELD = props.COMPR_FIELD;
        this.COMPR_FNAME = props.COMPR_FNAME;
        this.COMPR_FTYPE = props.COMPR_FTYPE;
        this.COMPR_VALUE = props.COMPR_VALUE;
        this.EMI_FIELD = props.EMI_FIELD;
        this.EMI_FNAME = props.EMI_FNAME;
        this.EMI_DTYPE = props.EMI_DTYPE;
        this.EMI_FTYPE = props.EMI_FTYPE;
        this.ROI_FIELD = props.ROI_FIELD;
        this.ROI_FNAME = props.ROI_FNAME;
        this.ROI_DTYPE = props.ROI_DTYPE;
        this.ROI_FTYPE = props.ROI_FTYPE;
        this.TENURE_FIELD = props.TENURE_FIELD;
        this.TENURE_FNAME = props.TENURE_FNAME;
        this.TENURE_FTYPE = props.TENURE_FTYPE;
        this.AGGR_TYPE = props.AGGR_TYPE;
    }
}
