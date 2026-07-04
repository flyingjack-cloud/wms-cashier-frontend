import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreManageComponent } from './store-manage.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('StoreManageComponent', () => {
  let component: StoreManageComponent;
  let fixture: ComponentFixture<StoreManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreManageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
