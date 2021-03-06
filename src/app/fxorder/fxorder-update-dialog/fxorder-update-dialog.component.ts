import { Component, OnInit, Input } from '@angular/core';
import { FxorderService } from 'src/app/services/fxorder/fxorder.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Broker } from 'src/app/models/broker';
import { Currency } from 'src/app/models/currency';
import { SecurityMaster } from 'src/app/models/securitymaster';
import { Tenor } from 'src/app/models/tenor';
import { Fxorder } from 'src/app/models/fxorder';
import { AccountService } from 'src/app/services/account/account.service';
import { BrokerService } from 'src/app/services/broker/broker.service';
import { CurrencyService } from 'src/app/services/currency/currency.service';
import { SecurityMasterService } from 'src/app/services/securitymaster/securitymaster.service';
import { TenorService } from 'src/app/services/tenor/tenor.service';
import { forkJoin } from 'rxjs';
import { Resp } from 'src/app/models/resp';
import { FxorderPayload } from 'src/app/payloads/fxorderpayload';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { formatNumber } from '@angular/common';

@Component({
  selector: 'app-fxorder-update-dialog',
  templateUrl: './fxorder-update-dialog.component.html',
  styleUrls: ['./fxorder-update-dialog.component.scss']
})
export class FxorderUpdateDialogComponent implements OnInit {
  @Input() editData: Fxorder;
  fxOrderNotification: any;
  dealtCcyCode = 'XXX';

  fxorderForm: FormGroup;
  accounts: Account[];
  brokers: Broker[];
  currencies: Currency[];
  securities: SecurityMaster[];
  tenors: Tenor[];

  isProcessing        = false;

  goodFromTime: Date  = new Date();
  goodUntilTime: Date;
  goodFromTimeZone    = 'SGT';
  goodUntilTimeZone   = 'EST';

  constructor(
    private fb: FormBuilder,
    private fxorderService: FxorderService,
    private accountService: AccountService,
    private brokerService: BrokerService,
    private currencyService: CurrencyService,
    private securityMasterService: SecurityMasterService,
    private tenorService: TenorService,
    private modalRef: BsModalRef,
    private modalService: BsModalService) {}

  ngOnInit() {
    this.getData();
    this.formInit();

    // Set Default Time Of Good Until
    const time = new Date();
    time.setHours(17);
    time.setMinutes(0);
    time.setSeconds(0);

    this.goodUntilTime = time;

    setTimeout(() => {
      this.setFormData();
    }, 10);
  }

  formInit() {
    this.fxorderForm = this.fb.group({
      id: this.fb.control(0, Validators.required),
      accountId: this.fb.control(null, Validators.required),
      assetClass: this.fb.control(null, Validators.required),
      brokerId: this.fb.control(null, Validators.required),
      dealtCcyId: this.fb.control(0, Validators.required),
      direction: this.fb.control(null, Validators.required),
      notional: this.fb.control(null, Validators.required),
      orderDate: this.fb.control(new Date(), Validators.required),
      price: this.fb.control(null, Validators.required),
      securityId: this.fb.control(null, Validators.required),
      settlementDate: this.fb.control(null, Validators.required),
      tenorId: this.fb.control(''),
      validFrom: this.fb.control(new Date(), Validators.required),
      validTill: this.fb.control(null, Validators.required),
    });
  }

  setFormData() {
    this.fxorderForm.get('id').setValue(this.editData.id);
    this.fxorderForm.get('accountId').setValue(this.editData.account.id);
    this.fxorderForm.get('assetClass').setValue(this.editData.assetClass);
    this.fxorderForm.get('brokerId').setValue(this.editData.broker.id);
    this.fxorderForm.get('dealtCcyId').setValue(this.editData.dealtCcy.id);
    this.fxorderForm.get('direction').setValue(this.editData.direction);
    this.fxorderForm.get('notional').setValue(formatNumber(this.editData.notional, 'en'));
    this.fxorderForm.get('orderDate').setValue(new Date(this.editData.orderDate));
    this.fxorderForm.get('price').setValue(this.editData.price);
    this.fxorderForm.get('securityId').setValue(this.editData.security.id);
    this.fxorderForm.get('settlementDate').setValue(new Date(this.editData.settlementDate));
    // this.fxorderForm.get('tenorId').setValue('');
    this.fxorderForm.get('validFrom').setValue(new Date(this.editData.validFrom));
    this.fxorderForm.get('validTill').setValue(new Date(this.editData.validTill));
    this.dealtCcyCode = this.editData.dealtCcy.code;
  }

  getData() {
    const accountReq  = this.accountService.getAll();
    const brokerReq   = this.brokerService.getAll();
    const currencyReq = this.currencyService.getAll();
    const securityReq = this.securityMasterService.getAll();
    const tenorReq    = this.tenorService.getAll();

    forkJoin([accountReq, brokerReq, currencyReq, securityReq, tenorReq]).subscribe((resp: any) => {
      this.accounts   = resp[0].data;
      this.brokers    = resp[1].data;
      this.currencies = resp[2].data;
      this.securities = resp[3].data;
      this.tenors     = resp[4].data;
    });
  }

  onCurrencyChange(securityId: string) {
    const security = this.securities.find(s => s.id === parseInt(securityId, 0));
    const dealtCcyId = security.primaryCcy.id;
    const dealtCcyCode = security.primaryCcy.code;

    this.fxorderForm.patchValue({
      dealtCcyId
    });

    this.dealtCcyCode = dealtCcyCode;
  }

  onNotionalChange(value: any) {
    value = value.replace(/,/g, '');
    if (value.length > 0) {
      const startValue  = value.substring(0, value.length - 1);
      const lastLetter  = (value.slice(-1)).toUpperCase();
      let multiplyBy    = 0;
      let notional: any;

      if (isNaN(value)) {
        if (lastLetter === 'K') {
          multiplyBy = 1000;
        } else if (lastLetter === 'M') {
          multiplyBy = 1000000;
        } else if (lastLetter === 'B') {
          multiplyBy = 1000000000;
        }

        if (!isNaN(startValue)) {
          notional = startValue * multiplyBy;
        }
      } else {
        notional = value;
      }

      notional = formatNumber(notional, 'en');

      this.fxorderForm.patchValue({
        notional
      });
    }
  }

  onTenorChange(value: string) {
    const tenor           = this.tenors.find(f => f.id === parseInt(value, 0));
    const validFrom       = new Date();
    const validTill       = new Date(new Date().setDate(validFrom.getDate() + tenor.fwdDays));
    const settlementDate  = validTill;

    this.fxorderForm.patchValue({
      settlementDate,
      validFrom,
      validTill
    });
  }

  onSettlementDateChange(settlementDate: string) {
    const validTill = settlementDate;

    this.fxorderForm.patchValue({
      validTill
    });
  }

  toggleTimeZone(timezone: string) {
    if (timezone === 'EST') {
      timezone = 'SGT';
    } else {
      timezone = 'EST';
    }

    return timezone;
  }

  update() {
    if (!this.isProcessing) {
      this.isProcessing = true;
      const buyId       = this.fxorderForm.get('id').value;
      const model       = this.fxorderForm.value;

      model.accountId   = parseInt(model.accountId.toString(), 0);
      model.brokerId    = parseInt(model.brokerId.toString(), 0);
      model.notional    = parseFloat(model.notional.replace(/,/g, '').toString());
      model.price       = parseFloat(model.price.toString());
      model.securityId  = parseInt(model.securityId.toString(), 0);
      // model.tenorId     = parseInt(model.tenorId.toString());

      // Bind Time to Dates
      model.validFrom      = this.bindDateTimeZone(model.validFrom, this.goodFromTime, this.goodFromTimeZone);
      model.validTill      = this.bindDateTimeZone(model.validTill, this.goodUntilTime, this.goodUntilTimeZone);

      this.fxorderService.update(buyId, model).subscribe((resp: Resp<Fxorder>) => {
        this.isProcessing = false;
        this.fxOrderNotification = resp;
        this.close();
      });
    }
  }

  bindDateTimeZone(date: Date, time: Date, zone: string): Date {
    let timeZone: string;
    let newDate: Date;
    let minutes: number;

    if (zone === 'EST') {
      // group = 'UTC−05:00';
      timeZone  = 'America/New_York';
      minutes   = 570;
    } else if (zone === 'SGT') {
      // group = 'UTC+8';
      timeZone = 'Asia/Singapore';
      minutes  = -150;
    }

    newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());
    // newDate = new Date(newDate.toLocaleString('en-US', { timeZone }));
    newDate = new Date(newDate.getTime() + minutes * 60000);

    newDate.setFullYear(date.getFullYear());
    newDate.setMonth(date.getMonth());
    newDate.setDate(date.getDate());

    return newDate;
  }

  close() {
    this.modalRef.hide();
  }
}
