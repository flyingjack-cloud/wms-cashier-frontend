import { Routes } from '@angular/router';
import { CallbackComponent } from './callback/callback.component';
import { WelcomeComponent } from './views/welcome/welcome.component';
import { CashierComponent } from './views/cashier/cashier/cashier.component';
import { CashierHomeComponent } from './views/cashier/home/cashier-home.component';
import { ShoppingComponent } from './views/cashier/shopping/shopping.component';
import { InventoryComponent } from './views/cashier/inventory/inventory.component';
import { StatisticsComponent } from './views/cashier/statistics/statistics.component';
import { PersonalCenterComponent } from './views/cashier/personal-center/personal-center.component';
import { ProfileComponent } from './views/cashier/personal-center/profile/profile.component';
import { StoreManageComponent } from './views/cashier/personal-center/store-manage/store-manage.component';
import { MemberComponent } from './views/cashier/personal-center/member/member.component';
import { StaffManageComponent } from './views/cashier/personal-center/staff-manage/staff-manage.component';
import { authGuard } from './guards/auth.guard';
import { permissionGuard } from './guards/permission.guard';
import { Permission } from './models/authority';
import { ReceiptSettingsComponent } from './views/cashier/personal-center/receipt-settings/receipt-settings.component';
import { ownerGuard } from './guards/owner.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'callback', component: CallbackComponent },
  { path: 'oauth2/callback', component: CallbackComponent },
  {
    path: 'cashier',
    component: CashierComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: CashierHomeComponent },
      { path: 'shopping', component: ShoppingComponent, canActivate: [permissionGuard(Permission.SHOPPING)] },
      { path: 'inventory', component: InventoryComponent, canActivate: [permissionGuard(Permission.INVENTORY)] },
      { path: 'statistics', component: StatisticsComponent, canActivate: [permissionGuard(Permission.STATISTICS)] },
      { path: 'receipts', component: ReceiptSettingsComponent, canActivate: [ownerGuard] },
      {
        path: 'center',
        component: PersonalCenterComponent,
        children: [
          { path: 'profile', component: ProfileComponent },
          { path: 'store', component: StoreManageComponent },
          { path: 'member', component: MemberComponent },
          { path: 'staff', component: StaffManageComponent },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '/welcome' },
];
