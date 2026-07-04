import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ToastComponent} from '../../components/toast/toast.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {Router, RouterModule} from '@angular/router';
import {MatButtonModule} from "@angular/material/button";
import {DriveStep} from "driver.js";
import {IntroService} from "../../../services/intro.service";
import {GroupService} from "../../../services/group.service";
import {Group} from "../../../models/group";
import {Observable} from "rxjs";
import {UserService} from "../../../services/user.service";
import {MatBadgeModule} from "@angular/material/badge";
import {MatTooltipModule} from "@angular/material/tooltip";
import {Role} from "../../../models/authority";
import {AuthService} from "../../../services/auth.service";

@Component({
  selector: 'app-cashier',
  standalone: true,
  imports: [RouterModule, ToastComponent, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule, MatBadgeModule, MatTooltipModule],
  templateUrl: './cashier.component.html',
  styleUrl: './cashier.component.scss'
})
export class CashierComponent implements OnInit, AfterViewInit{
  group: Observable<Group>;
  requestUsers: number = 0;

  constructor(private authService: AuthService, private router: Router, private introService:IntroService,
              private groupService: GroupService, private userservice: UserService) {
    this.group = groupService.getGroup();
  }

  ngOnInit(): void {
    // 每次刷新主界面时，重新获取group
    this.groupService._refresh();
    this.userservice.refreshRole();
    this.userservice.refreshPermission();

    // 如果是拥有者，首次需要获取加入请求人数
    this.userservice.getRole().subscribe(data => {
      if (data == Role.OWNER) {
        this.groupService.getUsersUnderRequest().subscribe(data => this.requestUsers = data.length);
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.router.url == "/cashier"){
      this.router.navigate(["/cashier/home"]);
    }

    if (!this.introService.checkGuided("home")){
      // 生成引导
      const steps:DriveStep[] = [
        { popover:{ title:"欢迎使用本系统", description:"接下来将进行教程引导", side:"right", align:"start" } },
        { element:"mat-nav-list", popover:{ title:"主要功能区域", description:"在这里切换主要功能", side:"right", align:"start" } },
        { element:"mat-list-item:nth-child(1)", popover:{ title:"收银", description:"收银功能，对商品进行销售", side:"right", align:"start" } },
        { element:"mat-list-item:nth-child(2)", popover:{ title:"库存", description:"录入新商品，库存管理，品牌管理", side:"right", align:"start" } },
        { element:"mat-list-item:nth-child(3)", popover:{ title:"数据", description:"查看销售订单，对商品进行退货", side:"right", align:"start" } },
        { element:"mat-toolbar > a", popover:{ title:"返回主页", description:"任意时刻点击在这里切换可以快速返回主页", side:"right", align:"start" } },
        { element:"mat-list-item:nth-child(2)", popover:{ title:"首次使用", description:"首次使用建议先使用库存功能添加商品", side:"right", align:"start" } },

      ];
      this.introService.create(steps);
      this.introService.setGuided("home")
    }
  }

  logout() {
    this.authService.logout();
  }

  clearTour() {
    this.introService.clear();
    location.reload();
  }
}
