import {Component, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent {
  readonly features = [
    {icon: 'point_of_sale', title: '收银结算', text: '快速创建订单，完成销售登记。'},
    {icon: 'inventory_2', title: '库存管理', text: '管理型号、串号、成本和售价。'},
    {icon: 'monitoring', title: '数据统计', text: '查看销售记录、退货和汇总数据。'},
  ];

  readonly loggingIn = signal(false);

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {}

  login(): void {
    if (this.loggingIn()) return;
    this.loggingIn.set(true);
    this.authService
      .initiateLogin(this.route.snapshot.queryParamMap.get('returnUrl'))
      .catch(() => this.loggingIn.set(false));
  }
}
