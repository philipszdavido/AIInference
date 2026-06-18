import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Benchmarks } from './benchmarks';

describe('Benchmarks', () => {
  let component: Benchmarks;
  let fixture: ComponentFixture<Benchmarks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Benchmarks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Benchmarks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
