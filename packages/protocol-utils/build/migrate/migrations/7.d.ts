export default v7;
declare namespace v7 {
    export const version: number;
    export { notes };
    export { migration };
}
declare const notes: "\n- Add the ability to specify minimum and maximum numbers of named alters on name generator stages.\n- Add additional skip logic options for handling ordinal and categorical variables.\n";
/**
 * Migration from v6 to v7
 */
declare function migration(protocol: any): any;
//# sourceMappingURL=7.d.ts.map