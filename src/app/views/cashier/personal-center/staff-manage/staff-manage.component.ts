import {Component, inject, Inject} from '@angular/core';
import {MatDividerModule} from "@angular/material/divider";
import {GroupService} from "../../../../services/group.service";
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {UserService} from "../../../../services/user.service";
import {UserProfile} from "../../../../models/profile";
import {MatTableModule} from "@angular/material/table";
import {MatButtonModule} from "@angular/material/button";
import {
  MAT_DIALOG_DATA, MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {ToastService} from "../../../../services/toast.service";
import {DialogAgreeComponent} from "./dialog-agree/dialog-agree.component";
import {DialogEditPermissionComponent} from "./dialog-edit-permission/dialog-edit-permission.component";

@Component({
  selector: 'app-staff-manage',
  standalone: true,
  imports: [
    MatDividerModule,
    MatListModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule
  ],
  templateUrl: './staff-manage.component.html',
  styleUrl: './staff-manage.component.scss'
})
export class StaffManageComponent {
  private groupService = inject(GroupService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  staffs$ = this.groupService.getUsersInGroup();
  displayedColumnsStaff: string[] = ["id", "nickname", "phone", "edit", "delete"];

  requests$ = this.groupService.getUsersUnderRequest();
  displayedColumnsRequest: string[] = ["id", "nickname", "phone", "agree", "disagree"];

  constructor() {
  }

  isOperator(user : UserProfile){
    let result = false;
    this.userService.getProfile().subscribe(
      data => {
        result = data.userId == user.userId
      }
    );
    return result;
  }

  openDialogDisagree(userId: number) {
    if (userId > 0) {
      this.dialog.open(DialogDisagreeConfirmComponent, {
        width: '300px',
        data: {
          data: userId
        }
      });
    }
  }

  openDialogAgree(user: UserProfile){
    this.dialog.open(DialogAgreeComponent, {
      width: '350px',
      data: {
        user: user
      }
    });
  }

  openDialogEditPermission(user: UserProfile){
    this.dialog.open(DialogEditPermissionComponent, {
      width: '350px',
      data: {
        user: user
      }
    });
  }

  openDialogUserDeleteInGroup(user: UserProfile) {
    this.dialog.open(DialogDeleteUserInGroupComponent, {
      width: '350px',
      data: {
        user: user
      }
    });
  }
}

@Component({
  selector: "dialog-disagree-request",
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
export class DialogDisagreeConfirmComponent {
  constructor( @Inject(MAT_DIALOG_DATA) public data: {data: number},
               public dialogRef: MatDialogRef<DialogDisagreeConfirmComponent>,
               private groupService: GroupService, private toast: ToastService) {}
  deleteRequest(){
    this.groupService.disagreeRequest(this.data.data).subscribe({
      complete: () => {
        this.toast.push("撤销成功", "success");
        location.reload();
      }
    });
  }
}

@Component({
  selector: "dialog-delete-user-group",
  template: `
    <h2 mat-dialog-title>移除该用户？</h2>
    <mat-dialog-content>
      您确定要删除该用户({{ data.user.userId }})吗?
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>否</button>
      <button mat-raised-button color="warn" (click)="deleteUserInGroup()">是</button>
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
export class DialogDeleteUserInGroupComponent {
  constructor( @Inject(MAT_DIALOG_DATA) public data: {user: UserProfile},
               public dialogRef: MatDialogRef<DialogDisagreeConfirmComponent>,
               private groupService: GroupService, private toast: ToastService) {}
  deleteUserInGroup(){
    this.groupService.deleteUserInGroup(this.data.user.userId).subscribe({
      complete: () => {
        this.toast.push("删除成功", "success");
        location.reload();
      }
    })
  }
}
