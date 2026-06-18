import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdgeTrainingPipeline } from './edge-training-pipeline';

describe('EdgeTrainingPipeline', () => {
  let component: EdgeTrainingPipeline;
  let fixture: ComponentFixture<EdgeTrainingPipeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdgeTrainingPipeline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EdgeTrainingPipeline);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
