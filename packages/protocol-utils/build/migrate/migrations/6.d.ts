export default v6;
declare namespace v6 {
    export const version: number;
    export { notes };
    export { migration };
}
declare const notes: "\n- Replace roster-based name generators (small and large) with a single new interface that combines the functionality of both. This will change the interview experience, and may impact your data collection!\n- Enable support for using the automatic node positioning feature on the Sociogram interface.\n";
declare function migration(protocol: any): any;
//# sourceMappingURL=6.d.ts.map