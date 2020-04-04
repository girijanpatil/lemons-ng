import { Component, OnInit } from '@angular/core';
import { formatNumber, formatDate } from '@angular/common';
import { FxorderService } from 'src/app/services/fxorder/fxorder.service';
import { AccountService } from 'src/app/services/account/account.service';
import { BrokerService } from 'src/app/services/broker/broker.service';
import { CurrencyService } from 'src/app/services/currency/currency.service';
import { SecurityMasterService } from 'src/app/services/securitymaster/securitymaster.service';
import { TenorService } from 'src/app/services/tenor/tenor.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Fxorder } from 'src/app/models/fxorder';
import { Resp } from 'src/app/models/resp';
import { forkJoin } from 'rxjs';
import { Broker } from 'src/app/models/broker';
import { Currency } from 'src/app/models/currency';
import { SecurityMaster } from 'src/app/models/securitymaster';
import { Tenor } from 'src/app/models/tenor';
import { AllocationTemplate } from 'src/app/models/allocTemp';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AllocationTemplateService } from 'src/app/services/allocTemp/allocTemp.service';

@Component({
  selector: 'app-fxorder-dialog',
  templateUrl: './fxorder-dialog.component.html',
  styleUrls: ['./fxorder-dialog.component.scss']
})
export class FxorderDialogComponent implements OnInit {

  fxorderFirstForm: FormGroup;
  fxorderThenForm: FormGroup;

  accounts: Account[];
  brokers: Broker[];
  currencies: Currency[];
  securities: SecurityMaster[];
  tenors: Tenor[];
  allocTmp: AllocationTemplate[];

  isProcessing          = false;
  firstFormDealtCcyName = 'XXX';
  thenFormDealtCcyName  = 'XXX';
  loopOrderCount        = 1;
  loopOrderCountDisable = true;

  firstFormGoodFromTime = new Date();
  firstFormGoodUntilTime: Date;
  thenFormGoodFromTime  = new Date();
  thenFormGoodUntilTime: Date;

  firstFormGoodFromTimeZone   = 'SGT';
  firstFormGoodUntilTimeZone  = 'EST';
  thenFormGoodFromTimeZone    = 'SGT';
  thenFormGoodUntilTimeZone   = 'EST';

  fxOrderNotification: any;

  timeLimitMins   = 10;
  timeLimitStatus = false;

  minDate: Date;

  isSpot = false;

  constructor(
    private fb: FormBuilder,
    private fxorderService: FxorderService,
    private accountService: AccountService,
    private brokerService: BrokerService,
    private currencyService: CurrencyService,
    private securityMasterService: SecurityMasterService,
    private tenorService: TenorService,
    private allocTemp: AllocationTemplateService,
    private modalRef: BsModalRef,
    private modalService: BsModalService
  ) {}

  ngOnInit() {
    this.getData();
    this.formInit();

    // Set Default Time Of Good Until
    const time = new Date();
    time.setHours(17);
    time.setMinutes(0);
    time.setSeconds(0);

    this.firstFormGoodUntilTime = time;
    this.thenFormGoodUntilTime = time;

    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate() - 1);
  }

  formInit() {
    this.fxorderFirstForm = this.fb.group({
      // id: this.fb.control(0, Validators.required),
      priority: this.fb.control(1, Validators.required),
      accountId: this.fb.control(2, Validators.required),
      assetClass: this.fb.control('FX', Validators.required),
      brokerId: this.fb.control(2, Validators.required),
      dealtCcyId: this.fb.control(0, Validators.required),
      direction: this.fb.control('BUY', Validators.required),
      notional: this.fb.control(null, Validators.required),
      orderDate: this.fb.control(new Date(), Validators.required),
      price: this.fb.control(null, Validators.required),
      securityId: this.fb.control(null, Validators.required),
      settlementDate: this.fb.control(null, Validators.required),
      tenorId: this.fb.control(null),
      validFrom: this.fb.control(new Date(), Validators.required),
      validTill: this.fb.control(null, Validators.required),
      loopOrderCount: this.fb.control(1, Validators.required),
      timeOut: 0,
      expTime: null,
      tsAllocTemp: this.fb.control('', Validators.required),
      isSpot: 'no'
    });

    this.fxorderThenForm = this.fb.group({
      // id: this.fb.control(0, Validators.required),
      priority: this.fb.control(2, Validators.required),
      accountId: this.fb.control(2, Validators.required),
      assetClass: this.fb.control('FX', Validators.required),
      brokerId: this.fb.control(2, Validators.required),
      dealtCcyId: this.fb.control(0, Validators.required),
      direction: this.fb.control('SELL', Validators.required),
      notional: this.fb.control(null, Validators.required),
      orderDate: this.fb.control(new Date(), Validators.required),
      price: this.fb.control(null, Validators.required),
      securityId: this.fb.control(null, Validators.required),
      settlementDate: this.fb.control(null, Validators.required),
      tenorId: this.fb.control(null),
      validFrom: this.fb.control(new Date(), Validators.required),
      validTill: this.fb.control(null, Validators.required),
      loopOrderCount: this.fb.control(1, Validators.required),
      timeOut: 0,
      expTime: null,
      tsAllocTemp: this.fb.control(''),
      isSpot: 'no'
    });
  }

  getData() {
    const accountReq = this.accountService.getAll();
    const brokerReq = this.brokerService.getAll();
    const currencyReq = this.currencyService.getAll();
    const securityReq = this.securityMasterService.getAll();
    const tenorReq = this.tenorService.getAll();
    const allocTempReq = this.allocTemp.getAll();

    forkJoin([accountReq, brokerReq, currencyReq, securityReq, tenorReq, allocTempReq]).subscribe((resp: any) => {
      this.accounts = resp[0].data;
      this.brokers = resp[1].data;
      this.currencies = resp[2].data;
      this.securities = resp[3].data;
      this.tenors = resp[4].data;
      this.allocTmp = resp[5].data;
    });
  }

  toggleSpot(option: string, status: boolean) {
    if (option === 'yes') {
      this.isSpot = true;
      this.fxorderFirstForm.controls.settlementDate.disable();
      this.fxorderThenForm.controls.settlementDate.disable();

      this.fxorderFirstForm.patchValue({
        settlementDate: this.getSpotDate()
      });

      this.fxorderThenForm.patchValue({
        settlementDate: this.getSpotDate()
      });

      // this.fxorderFirstForm.controls.settlementDate.setValidators(null);
      // this.fxorderThenForm.controls.settlementDate.setValidators(null);
    } else {
      this.isSpot = false;
      this.fxorderFirstForm.controls.settlementDate.enable();
      this.fxorderThenForm.controls.settlementDate.enable();

      this.fxorderFirstForm.patchValue({
        settlementDate: null
      });

      this.fxorderThenForm.patchValue({
        settlementDate: null
      });
    }

    if (status === true) {
      this.fxorderThenForm.patchValue({
        isSpot : option
      });
    } else {
      this.fxorderFirstForm.patchValue({
        isSpot : option
      });
    }
  }

  getSpotDate(): Date {
    const date = new Date();
    let days   = 2;

    if (date.getDay() === 4 || date.getDay() === 5) {
      days = 4;
    } else if (date.getDay() === 6) {
      days = 3;
    }

    return this.dateFormat(date, date, 'SGT', 0, 'date', days);
  }

  onStrategyChange(id: string) {
    if ( id === '1' ) {
      this.loopOrderCount = 1;
      this.loopOrderCountDisable = true;
    } else if ( id === '2' ) {
      this.loopOrderCount = 20;
      this.loopOrderCountDisable = false;
    }
  }

  toggleBuySell() {
    if (this.fxorderFirstForm.value.direction === 'BUY') {
      this.fxorderFirstForm.controls.direction.setValue('SELL');
    } else {
      this.fxorderFirstForm.controls.direction.setValue('BUY');
    }

    if (this.fxorderThenForm.value.direction === 'BUY') {
      this.fxorderThenForm.controls.direction.setValue('SELL');
    } else {
      this.fxorderThenForm.controls.direction.setValue('BUY');
    }
  }

  onCurrencyChange(securityId: string, status: boolean) {
    const security = this.securities.find(s => s.id === parseInt(securityId, 0));
    const dealtCcyId = security.primaryCcy.id;
    const dealtCcyCode = security.primaryCcy.code;

    if (status) {
      this.fxorderFirstForm.patchValue({
        securityId,
        dealtCcyId
      });

      this.fxorderThenForm.patchValue({
        securityId,
        dealtCcyId
      });

      this.firstFormDealtCcyName = dealtCcyCode;
      this.thenFormDealtCcyName = dealtCcyCode;
    } else {
      this.fxorderThenForm.patchValue({
        dealtCcyId
      });

      this.thenFormDealtCcyName = dealtCcyCode;
    }
  }

  toggleDealtCurrency() {
    const securityId    = this.fxorderFirstForm.value.securityId;
    let dealtCcyId: number;
    let dealtCcyCode: string;
    if (securityId === null) {
        alert('Please select a currency pair first !');
        return;
    }

    const security      = this.securities.find(s => s.id === parseInt(securityId, 0));
    const primCcyId     = security.primaryCcy.id;
    const primCcyCode   = security.primaryCcy.code;
    const secCcyId      = security.secCcy.id;
    const secCcyCode    = security.secCcy.code;

    if (this.fxorderFirstForm.value.dealtCcyId === primCcyId) {
        dealtCcyId      = secCcyId;
        dealtCcyCode    = secCcyCode;
    } else {
        dealtCcyId      = primCcyId;
        dealtCcyCode    = primCcyCode;
    }

    this.fxorderFirstForm.patchValue({
        dealtCcyId
      });

    this.fxorderThenForm.patchValue({
        securityId,
        dealtCcyId
      });

    this.firstFormDealtCcyName = dealtCcyCode;
    this.thenFormDealtCcyName = dealtCcyCode;
  }

  onNotionalChange(value: any, status: boolean) {
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

      if (status) {
        this.fxorderFirstForm.patchValue({
          notional
        });

        this.fxorderThenForm.patchValue({
          notional
        });
      } else {
        this.fxorderThenForm.patchValue({
          notional
        });
      }
    }
  }

  onTenorChange(value: string, status: boolean) {
    const tenor           = this.tenors.find(f => f.id === parseInt(value, 0));
    const tenorId         = tenor.id;
    const validFrom       = new Date();
    const validTill       = new Date(new Date().setDate(validFrom.getDate() + tenor.fwdDays));
    const settlementDate  = validTill;


    if (status) {
      this.fxorderFirstForm.patchValue({
        settlementDate,
        validFrom,
        validTill
      });

      this.fxorderThenForm.patchValue({
        tenorId,
        settlementDate,
        validFrom,
        validTill
      });
    } else {
      this.fxorderThenForm.patchValue({
        settlementDate,
        validFrom,
        validTill
      });
    }
  }

  onSettlementDateChange(settlementDate: any, status: boolean) {
    const validTill = settlementDate;

    // if (!isNaN(validTill.getDay())) {
    //   const addDays = 5 - validTill.getDay();
    //   validTill.setDate(validTill.getDate() + addDays);
    // }

    if (status) {
      this.fxorderFirstForm.patchValue({
        validTill
      });

      this.fxorderThenForm.patchValue({
        settlementDate,
        validTill
      });
    } else {
      this.fxorderThenForm.patchValue({
        validTill
      });
    }
  }

  toggleTimeZone(timezone: string) {
    if (timezone === 'EST') {
      timezone = 'SGT';
    } else {
      timezone = 'EST';
    }

    return timezone;
  }

  onAccountChange(accountId: number) {
    this.fxorderThenForm.patchValue({
      accountId
    });
  }

  onBrokerChange(brokerId: number) {
    this.fxorderThenForm.patchValue({
      brokerId
    });
  }

  onGoodFromDateChange(value: string, status: boolean) {
    if (status === true) {
      this.fxorderThenForm.patchValue({
        validFrom : value
      });
    } else {
      this.fxorderFirstForm.patchValue({
        validFrom : value
      });
    }
  }

  onGoodUntilDateChange(value: string, status: boolean) {
    if (status === true) {
      this.fxorderThenForm.patchValue({
        validTill : value
      });
    } else {
      this.fxorderFirstForm.patchValue({
        validTill : value
      });
    }
  }

  onGoodFromTimeChange(status: boolean) {
    if (status === true) {
      this.thenFormGoodFromTime = this.firstFormGoodFromTime;
    } else {
      this.firstFormGoodFromTime = this.thenFormGoodFromTime;
    }
  }

  onAllocTempChange(tsAllocTemp: string, status: boolean) {
    if (status) {
      this.fxorderThenForm.patchValue({
        tsAllocTemp
      });
    } else {
      this.fxorderFirstForm.patchValue({
        tsAllocTemp
      });
    }
  }

  save() {
    if (this.isSpot === true) {
      this.fxorderFirstForm.controls.settlementDate.enable();
      this.fxorderThenForm.controls.settlementDate.enable();
    }

    if (!this.isProcessing) {
      this.isProcessing = true;
      const firstModel  = this.fxorderFirstForm.value;
      const thenModel   = this.fxorderThenForm.value;

      firstModel.accountId      = parseInt(firstModel.accountId.toString(), 0);
      thenModel.accountId       = parseInt(thenModel.accountId.toString(), 0);

      firstModel.brokerId       = parseInt(firstModel.brokerId.toString(), 0);
      thenModel.brokerId        = parseInt(thenModel.brokerId.toString(), 0);

      firstModel.notional       = parseFloat(firstModel.notional.replace(/,/g, '').toString());
      thenModel.notional        = parseFloat(thenModel.notional.replace(/,/g, '').toString());

      firstModel.price          = parseFloat(firstModel.price.toString());
      thenModel.price           = parseFloat(thenModel.price.toString());

      firstModel.securityId     = parseInt(firstModel.securityId.toString(), 0);
      thenModel.securityId      = parseInt(thenModel.securityId.toString(), 0);

      thenModel.tsAllocTemp     = firstModel.tsAllocTemp;

      // firstModel.tenorId        = parseInt(firstModel.tenorId.toString());
      // thenModel.tenorId         = parseInt(thenModel.tenorId.toString());

      firstModel.loopOrderCount = this.loopOrderCount;
      thenModel.loopOrderCount  = firstModel.loopOrderCount;

    // Order Date
      firstModel.orderDate      = this.dateFormat(firstModel.orderDate, firstModel.orderDate, 'SGT');
      thenModel.orderDate       = this.dateFormat(thenModel.orderDate, thenModel.orderDate, 'SGT');

    // Settlement Date
      if (this.isSpot === false) {
        firstModel.isSpot         = false;
        thenModel.isSpot          = false;

        firstModel.settlementDate = this.dateFormat(firstModel.settlementDate, firstModel.settlementDate, 'SGT');
        thenModel.settlementDate  = this.dateFormat(thenModel.settlementDate, thenModel.settlementDate, 'SGT');
      } else {
        firstModel.isSpot         = true;
        thenModel.isSpot          = true;

        firstModel.settlementDate = this.dateFormat(firstModel.settlementDate, firstModel.settlementDate, 'SGT');
        thenModel.settlementDate  = this.dateFormat(thenModel.settlementDate, thenModel.settlementDate, 'SGT');
      }

    // Bind Time to Dates
      firstModel.validFrom      = this.dateFormat(firstModel.validFrom, this.firstFormGoodFromTime, this.firstFormGoodFromTimeZone);
      firstModel.validTill      = this.dateFormat(firstModel.validTill, this.firstFormGoodUntilTime, this.firstFormGoodUntilTimeZone);
      thenModel.validFrom       = this.dateFormat(thenModel.validFrom, this.thenFormGoodFromTime, this.thenFormGoodFromTimeZone);
      thenModel.validTill       = this.dateFormat(thenModel.validTill, this.thenFormGoodUntilTime, this.thenFormGoodUntilTimeZone);

    // If Time Limit is Active
      if (this.timeLimitStatus) {
        firstModel.timeOut  = this.timeLimitMins;
        firstModel.expTime  = this.dateFormat(new Date(), new Date(), 'IST', firstModel.timeOut, 'string');
        thenModel.timeOut   = this.timeLimitMins;
        thenModel.expTime   = this.dateFormat(new Date(), new Date(), 'IST', thenModel.timeOut, 'string');
      }

      // console.log([firstModel, thenModel]);
      // return;

      this.fxorderService.save([firstModel, thenModel]).subscribe((resp: Resp<Fxorder>) => {
        this.fxOrderNotification = resp;
        this.close();
      });
    }
  }

  dateFormat(date: Date, time: Date, zone: string, timeOut = 0, format = 'date', addDays = 0): any {
    switch (zone) {
      case 'EST' : {
        zone = 'UTC-4';
        break;
      }
      case 'IST' : {
        zone = 'UTC+5:30';
        break;
      }
      case 'SGT' : {
        zone = 'UTC+8';
        break;
      }
      default : {
        zone = 'UTC';
      }
    }

    const output  = new Date( formatDate( new Date(
        date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds(), 0),
        'MM/dd/yy hh:mm:ss a',
        'en-US',
        'UTC+5:30'
      ) + ' ' + zone);

    output.setFullYear(date.getFullYear());
    output.setMonth(date.getMonth());
    output.setDate(date.getDate() + addDays);
    output.setMinutes(output.getMinutes() + timeOut);

    if (format === 'string') {
      return output.toISOString();
    } else if (format === 'date') {
      return output;
    }
  }

  // bindDateTimeZone(date: Date, time: Date, zone: string): Date {
  //   let timeZone: string;
  //   let newDate: Date;
  //   let minutes: number;

  //   if (zone === 'EST') {
  //     // group = 'UTC−05:00';
  //     timeZone  = 'America/New_York';
  //     minutes   = 570;
  //   } else if (zone === 'SGT') {
  //     // group = 'UTC+8';
  //     timeZone = 'Asia/Singapore';
  //     minutes  = -150;
  //   }

  //   newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());
  //   // newDate = new Date(newDate.toLocaleString('en-US', { timeZone }));
  //   newDate = new Date(newDate.getTime() + minutes * 60000);
  //   newDate.setFullYear(date.getFullYear());
  //   newDate.setMonth(date.getMonth());
  //   newDate.setDate(date.getDate());

  //   return newDate;
  // }

  close() {
    this.modalRef.hide();
  }
}
