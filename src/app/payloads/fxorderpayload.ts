export interface FxorderPayload {
    accountId: number;
    assetClass: string;
    brokerId: number;
    dealtCcyId: number;
    direction: string;
    id: number;
    notional: number;
    orderDate: Date;
    orderType: string;
    price: number;
    securityId: number;
    settlementDate: Date;
    tenorId: number;
    validFrom: Date;
    validTill: Date;
}
