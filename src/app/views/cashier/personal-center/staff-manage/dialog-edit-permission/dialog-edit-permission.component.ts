import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from "@angular/material/dialog";
import {PreventEnterDirective} from "../../../../../directives/prevent-enter.directive";
import {UserProfile} from "../../../../../models/profile";
import {GroupService} from "../../../../../services/group.service";
import {ToastService} from "../../../../../services/toast.service";
import {finalize} from "rxjs";
import {Permission} from "../../../../../models/authority";

@Component({
  selector: 'app-dialog-edit-permission',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    PreventEnterDirective,
    ReactiveFormsModule
  ],
  templateUrl: './dialog-edit-permission.component.html',
  styleUrl: './dialog-edit-permission.component.scss'
})
export class DialogEditPermissionComponent implements OnInit{
  data = inject<{user: UserProfile}>(MAT_DIALOG_DATA);
  private _formBuilder = inject(FormBuilder);
  private groupService = inject(GroupService);
  private toast = inject(ToastService);
  permissions = this._formBuilder.group({
    shopping: false,
    inventory: false,
    statistics: false,
  });

  loading: boolean = false;

  constructor() {
  }

  ngOnInit() {
    this.groupService.getPermissionsByUserId(this.data.user.userId).subscribe(data =>{
      data.forEach(item => {
        if (item.authority == Permission.SHOPPING) {
          this.permissions.patchValue({shopping: true})
        }
        if (item.authority == Permission.INVENTORY) {
          this.permissions.patchValue({inventory: true})
        }
        if (item.authority == Permission.STATISTICS) {
          this.permissions.patchValue({statistics: true})
        }
      })
    })
  }

  /**
   * 更新permissions
   */
  updatePermissions() {
    if (this.data.user.userId > 0){
      this.loading = true;

      this.groupService.updatePermissions(this.data.user.userId,
          this.permissions.value.shopping!,
          this.permissions.value.inventory!,
          this.permissions.value.statistics!)
        .pipe(finalize(()=> this.loading = false))
        .subscribe({
          complete: () => {
            this.toast.push("修改权限成功，刷新页面或者重新登陆生效", "success");
            location.reload();
          }
        });
    }
  }
}
