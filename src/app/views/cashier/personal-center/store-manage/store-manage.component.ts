import {Component, inject} from '@angular/core';
import {AsyncPipe} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {Observable} from "rxjs";
import {GroupService} from "../../../../services/group.service";
import {Group} from "../../../../models/group";
import {ToastService} from "../../../../services/toast.service";
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {DialogCreateStoreComponent} from "./dialog-create-store/dialog-create-store.component";
import {DialogJoinGroupComponent} from "./dialog-join-group/dialog-join-group.component";
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-store-manage',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './store-manage.component.html',
  styleUrl: './store-manage.component.scss'
})
export class StoreManageComponent {
  private groupService = inject(GroupService);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);
  group$: Observable<Group> = this.groupService.getGroup();
  showStoreNameEdit: boolean = false;
  showAddressEdit: boolean = false;
  showContactEdit: boolean = false;
  request$ = this.groupService.getGroupInRequest();

  constructor() {
    this.groupService._refresh();
  }

  editStoreName(storeName: string){
    if (storeName == null || storeName == "") {
      this.toast.push("用户名不能为空或者是'未设置'", "warning");
    } else {
      this.groupService.updateStoreName(storeName).subscribe({
        complete: () => this.showStoreNameEdit = false
      });
    }
  }

  editAddress(address: string){
    if (address == null || address == "") {
      this.toast.push("地址不能为空", "warning");
    } else {
      this.groupService.updateAddress(address).subscribe({
        complete: () => this.showAddressEdit = false
      });
    }
  }

  editContact(contact: string){
    if (contact == null || contact == "") {
      this.toast.push("联系电话不能为空", "warning");
    } else {
      this.groupService.updateContact(contact).subscribe({
        complete: () => this.showContactEdit = false
      });
    }
  }

  openDialogCreate() {
    this.dialog.open(DialogCreateStoreComponent, {
      width: '350px',
      height: '400px'
    });
  }

  openDialogJoin() {
    this.dialog.open(DialogJoinGroupComponent, {
      width: '400px',
      height: '350px'
    });
  }

  openDialogDeleteRequest() {
    this.dialog.open(DialogDeleteRequestComponent, {
      width: '250px'
    })
  }
}

@Component({
  selector: "dialog-delete-request",
  template: `
    <h2 mat-dialog-title>撤回加入请求</h2>
    <mat-dialog-content>
      您确定要撤回加入请求吗?
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>否</button>
      <button mat-raised-button color="warn" (click)="deleteRequest()">是</button>
    </mat-dialog-actions>
  `,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatDialogClose
  ],
  standalone: true
})
export class DialogDeleteRequestComponent {
  constructor( public dialogRef: MatDialogRef<DialogDeleteRequestComponent>,
               private groupService: GroupService, private toast: ToastService) {}
  deleteRequest(){
    this.groupService.deleteJoinRequest().subscribe({
      complete: () => {
        this.toast.push("撤销成功", "success");
        location.reload();
      }
    });
  }
}
