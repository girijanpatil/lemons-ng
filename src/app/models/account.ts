import { Audit } from './audit';

export interface Account extends Audit {
    accountName: string;
    description: string;
}
