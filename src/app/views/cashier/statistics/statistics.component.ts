import {Component, Inject, ViewChild} from '@angular/core';
import {NgClass} from '@angular/common';
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatCheckboxChange, MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {Order} from "../../../models/order";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {OrderService} from "../../../services/order.service";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {DialogReturnConfirmComponent} from "./dialog-return-confirm/dialog-return-confirm.component";
import {Merchandise} from "../../../models/merchandise";
import {ReceiptPrintComponent} from "../../components/receipt/receipt-print.component";
import {utils, writeFileXLSX} from "xlsx";
import {LocalDatePipe} from "../../../pipes/local-date.pipe";
import {MatSelectModule} from "@angular/material/select";
import {PrinterType} from "../../../models/receipt";
import {OrderExtraDialogComponent} from "./order-extra-dialog/order-extra-dialog.component";

interface DateRangeForm {
  start: FormControl<Date>;
  end: FormControl<Date>;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    LocalDatePipe,
    NgClass,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent {
  displayedColumns: string[] = ['id', 'cate_name', 'imei', 'cost', 'selling_price', 'selling_time', 'remark', 'returned', "reprint"];
  dataSource = new MatTableDataSource<Order>();
  containReturned: boolean = true;
  hideCost: boolean = true;

  form = new FormGroup<DateRangeForm>({
    start: new FormControl<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0), {
      nonNullable: true,
      validators: Validators.required
    }),
    end: new FormControl<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59), {
      nonNullable: true,
      validators: Validators.required
    }),
  });
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private orderService: OrderService, public dialog: MatDialog) {
  }

  ngAfterViewInit() {
    this._refreshData();
    this.dataSource.paginator = this.paginator;

    this.dataSource.filterPredicate = (data: Order, filter: string) => {
      return (this.containReturned ? true : !data.returned) &&
        ( data.merchandise.category.name.toLowerCase().includes(filter.trim())
          || data.merchandise.imei.toLowerCase().includes(filter.trim()));
    };
  }

  applyFilter(event: Event | MatCheckboxChange) {
    if (event instanceof MatCheckboxChange) {
      this.dataSource.filter = this.dataSource.filter + " " ; //通过添加空格，使filter变化触发filter predicate事件
    } else {
      this.dataSource.filter = (event.target as HTMLInputElement).value.toLowerCase() + " "; //通过添加空格，保证全删除时也会筛选containReturned条件
    }
  }

  total(mode: string) {
    let result;
    switch (mode) {
      case 'cost' :
        result = this.dataSource.filteredData.reduce((prev, cur, index, arr) =>
            prev + (cur.returned ? 0 : cur.merchandise.cost), 0);
        break;
      case 'price' : result = this.dataSource.filteredData.reduce((prev, cur, index, arr) =>
        prev +(cur.returned ? 0 : cur.sellingPrice), 0);
      break;
      case 'income' : result = this.dataSource.filteredData.reduce((prev, cur, index, arr) =>
        prev + (cur.returned ? 0 : (cur.sellingPrice - cur.merchandise.cost) ), 0);
      break;
      default:
    }
    return result;
  }

  returning(order:Order) {
    this.dialog.open(DialogReturnConfirmComponent,{
      width: '300px',
      height: '190px',
      data: order
    }).afterClosed().subscribe(result =>
      {
        // 删除结束后刷新
        if (result.isSuccess){
          order.returned = true;
        }
      }
    );
  }

  _refreshData() {
    this.orderService.getOrdersByDateRange(this.form.value.start!, this.form.value.end!).subscribe(
      orders => {
        this.dataSource.data = orders;
      }
    );
  }

  print(order: Order){
    if (order && order.merchandise){
      console.log(order)
      this.dialog.open(DialogPrintConfirmComponent,{
        width: '380px',
        maxWidth: '95vw',
        data: order
      })
    }
  }

  editExtra(order: Order) {
    this.dialog.open(OrderExtraDialogComponent, {
      width: '760px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: order,
    });
  }

  saveToExcel() {
    const wb = utils.book_new();
    // 设置表头
    const heading = [["序号", "型号", "串号", "成本", "实际售价", "是否退货" , "录入时间", "备注"]];

    // map去除不需要的列
    let data = this.dataSource.filteredData.map(item => {
      return {
        id: item.id,
        cate: item.merchandise.category.name,
        imei: item.merchandise.imei,
        cost: item.merchandise.cost,
        sellingPrice: item.sellingPrice,
        returned: item.returned ? "已退货" : "",
        time: item.sellingTime,
        remark: item.remark,
      }
    })

    const ws = utils.json_to_sheet([]);
    utils.sheet_add_aoa(ws, heading)
    utils.sheet_add_json(ws, data, {origin: 'A2', skipHeader: true});
    delete (ws['06'])

    // 设置单元格间距
    var wscols = [
      {wch:6},
      {wch:10},
      {wch:30},
      {wch:10},
      {wch:10},
      {wch:20},
      {wch:50},
      {wch:50},
    ];
    ws['!cols'] = wscols;

    utils.book_append_sheet(wb, ws, "Sheet1");
    const fileName = "销售情况" + "_" +  new Date().getFullYear() +
      "_" +  (new Date().getMonth() + 1) +
      "_" +  new Date().getDay() + ".xlsx";
    writeFileXLSX(wb, fileName);
  }
}

@Component({
  template: `
    <h1 mat-dialog-title>补打票据</h1>
    <mat-dialog-content>
      <mat-form-field style="width: 100%">
        <mat-label>打印纸张</mat-label>
        <mat-select [(ngModel)]="printerType">
          <mat-option value="A4">A4</mat-option>
          <mat-option value="THERMAL_58">58mm 热敏纸</mat-option>
          <mat-option value="THERMAL_80">80mm 热敏纸</mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
        <button mat-button mat-dialog-close >取消</button>
        <button mat-raised-button color="primary" (click)="confirm()" [disabled]="printing">{{ printing ? '准备打印中…' : '确认打印' }}</button>
    </mat-dialog-actions>
    <app-receipt [data]="[data]" [printerType]="printerType" #receipt></app-receipt>
  `,
  selector: 'diaglo-print-confirm',
  imports: [
    MatDialogTitle,
    MatDialogActions,
    MatDialogContent,
    MatDialogClose,
    MatButtonModule,
    ReceiptPrintComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule
  ],
  standalone: true
})
class DialogPrintConfirmComponent{
  printerType: PrinterType = 'A4';
  printing = false;
  @ViewChild('receipt') receipt!:ReceiptPrintComponent;
  constructor(@Inject(MAT_DIALOG_DATA) public data: Order,
              private dialogRef: MatDialogRef<DialogPrintConfirmComponent>) {
  }

  async confirm(){
    if (this.printing) return;
    this.printing = true;
    try {
      await this.receipt.print();
      this.dialogRef.close();
    } finally {
      this.printing = false;
    }
  }
}
