import { Component } from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatDialogClose, MatDialogRef} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {GroupService} from "../../../../../services/group.service";
import {finalize} from "rxjs";
import {ToastService} from "../../../../../services/toast.service";

@Component({
  selector: 'app-dialog-join-group',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogClose,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './dialog-join-group.component.html',
  styleUrl: './dialog-join-group.component.scss'
})
export class DialogJoinGroupComponent {
    identity = new FormControl<number | null>(null, [Validators.required]);
    phone = new FormControl<string | null>(null, [Validators.required, Validators.pattern("^1[3-9]\\d{9}$")]);

    loading: boolean = false;

    constructor(private groupService: GroupService, private toast: ToastService, private dialog: MatDialogRef<DialogJoinGroupComponent>) {
    }

    joinByIdentity() {
      this.loading = true;
      if (this.identity.valid){
          this.groupService.createJoinRequestByGroupId(this.identity.value!).pipe(
            finalize(() => this.loading = false)
          ).subscribe({
            complete: () => {
              this.toast.push("提交申请成功, 请联系店主通过申请","success");
              this.dialog.close();
              location.reload();
            }
            });
      } else {
        this.loading = false;
      }
    }

    joinByPhone(){
      this.loading = true;
      if (this.phone.valid){
        this.groupService.createJoinRequestByPhone(this.phone.value!).pipe(
          finalize(() => this.loading = false)
        ).subscribe({
          complete: () => {
            this.toast.push("提交申请成功, 请联系店主通过申请","success");
            this.dialog.close();
            location.reload();
          }
        });
      } else {
        this.loading = false;
      }
    }
}
