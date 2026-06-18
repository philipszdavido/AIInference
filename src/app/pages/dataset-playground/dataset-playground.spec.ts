import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetPlayground } from './dataset-playground';

describe('DatasetPlayground', () => {
  let component: DatasetPlayground;
  let fixture: ComponentFixture<DatasetPlayground>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetPlayground]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetPlayground);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
