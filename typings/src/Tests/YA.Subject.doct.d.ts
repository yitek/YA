import { ClassDoct, MemberDoct } from '../YA.doct';
export declare class SubjectTest {
    constructor(doc: ClassDoct);
    $subscribe(mdoc: MemberDoct): void;
    $notify(mdoc: MemberDoct): void;
    $unsubscribe(mdoc: MemberDoct): void;
}
