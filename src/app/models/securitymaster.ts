import { Audit } from './audit';
import { Currency } from './currency';

export interface SecurityMaster extends Audit {
    description: string;
    name: string;
    primaryCcy: Currency;
    secCcy: Currency;
}
