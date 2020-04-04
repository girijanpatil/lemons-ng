import { Account } from './account';
import { Broker } from './broker';
import { Currency } from './currency';
import { SecurityMaster } from './securitymaster';
import { Tenor } from './tenor';
import { Audit } from './audit';

export interface Fxorder extends Audit {
    [x: string]: any;
    account: Account;
    assetClass: string;
    broker: Broker;
    dealtCcy: Currency;
    direction: string;
    id: number;
    notional: number;
    orderDate: Date;
    orderType: string;
    price: number;
    security: SecurityMaster;
    settlementDate: Date;
    tenor: Tenor;
    validFrom: Date;
    validTill: Date;
    sellOrder: Fxorder;
}
