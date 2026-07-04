import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {ToastService} from "../../../../services/toast.service";
import {OrderService} from "../../../../services/order.service";
import {Order} from "../../../../models/order";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {finalize} from "rxjs";

@Component({
  selector: 'app-dialog-return-confirm',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogActions,
    MatDialogContent,
    MatButtonModule,
    MatDialogClose,
    MatProgressBarModule
  ],
  templateUrl: './dialog-return-confirm.component.html',
  styleUrl: './dialog-return-confirm.component.scss'
})
export class DialogReturnConfirmComponent {
  loading: boolean = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data: Order,
              private dialogRef: MatDialogRef<DialogReturnConfirmComponent>,
              private service: OrderService,
              private toast: ToastService) {
  }

  submit() {
    this.loading = true;
    this.service.returnOrder(this.data.id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        complete: () => {
          this.toast.push("退货成功", "success");
          this.dialogRef.close({isSuccess:true})
        }
      });
  }
}
