import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelsManager } from './models-manager';

describe('ModelsManager', () => {
  let component: ModelsManager;
  let fixture: ComponentFixture<ModelsManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelsManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelsManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
