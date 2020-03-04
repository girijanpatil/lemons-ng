import { Audit } from './audit';

export interface Currency extends Audit {
    code: string;
    description: string;
}
