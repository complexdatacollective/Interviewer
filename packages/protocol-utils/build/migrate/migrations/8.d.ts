export default v8;
declare namespace v8 {
    export const version: number;
    export { notes };
    export { migration };
}
declare const notes: "\n- Add new validation options for form fields: `greaterThanVariable` and `lessThanVariable`.\n- Add new comparator options for skip logic and filter: `contains` and `does not contain`.\n- Amplify comparator options `includes` and `excludes` for ordinal and categorical variables to allow multiple selections.\n";
/**
 * Migration from v7 to v8
 */
declare function migration(protocol: any): any;
//# sourceMappingURL=8.d.ts.map