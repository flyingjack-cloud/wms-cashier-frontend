import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CashierComponent } from './cashier.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../../../services/auth.service';

describe('CashierComponent', () => {
  let component: CashierComponent;
  let fixture: ComponentFixture<CashierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashierComponent, RouterTestingModule],
      providers: [
        provideAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { logout: () => {} } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CashierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });
});
