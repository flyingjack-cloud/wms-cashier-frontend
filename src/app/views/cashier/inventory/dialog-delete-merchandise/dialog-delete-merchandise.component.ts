import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent, MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {Merchandise} from "../../../../models/merchandise";
import {MatButtonModule} from "@angular/material/button";
import {MerchandiseService} from "../../../../services/merchandise.service";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {ToastService} from "../../../../services/toast.service";

@Component({
  selector: 'app-dialog-delete-merchandise',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatProgressBarModule
  ],
  templateUrl: './dialog-delete-merchandise.component.html',
  styleUrl: './dialog-delete-merchandise.component.scss'
})
export class DialogDeleteMerchandiseComponent {
  loading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Merchandise,
              private dialogRef: MatDialogRef<DialogDeleteMerchandiseComponent>,
              private service:MerchandiseService,
              private toast: ToastService) {
  }

  delete() {
    this.service.deleteMerchandise(this.data.id).subscribe(
      {
        complete: () => {
          this.toast.push("删除成功", "success");
          this.dialogRef.close({ data: this.data});
        }
      }
    );
  }
}
