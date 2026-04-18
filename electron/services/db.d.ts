import Database from 'better-sqlite3';
type DbInstance = InstanceType<typeof Database>;
export declare function getDb(): DbInstance;
export {};
