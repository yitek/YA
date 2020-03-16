import { TAssertStatement } from '../doct';
export declare class SubjectTest {
    base(assert_statement: TAssertStatement): void;
    noenumerable(assert_statement: TAssertStatement): void;
    subscribeDefault(assert_statement: TAssertStatement): void;
    subscribe(assert_statement: TAssertStatement): void;
    subscribeTimes(assert_statement: TAssertStatement): void;
    notify(assert_statement: any): void;
    notifyNoSubscribe(assert_statement: any): void;
    usubscribeDefault(assert_statement: any): void;
    unsubscribeTopic(assert_statement: any): void;
    unsubscribeMore(assert_statement: any): void;
    invalidReference(assert_statement: any): void;
}
