import { Audit } from './audit';

export interface Broker extends Audit {
    code: string;
    description: string;
    isActive: boolean;
    name: string;
}
