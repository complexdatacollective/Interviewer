export default v5;
declare namespace v5 {
    export const version: number;
    export { notes };
    export { migration };
}
declare const notes: "\n- Enable the 'Tie Strength Census' interface, which will allow you to conduct a dyad census that also captures the strength of the tie and assigns it to an ordinal variable.\n- Add new validation options for form fields: `unique`, `sameAs`, and `differentFrom`.\n- Enable an 'Interview Script' section for each stage, where notes for the interviewer can be added. \n";
/**
 * Migration from v4 to v5
 */
declare function migration(protocol: any): any;
//# sourceMappingURL=5.d.ts.map