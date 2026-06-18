import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpamClassifier } from './spam-classifier';

describe('SpamClassifier', () => {
  let component: SpamClassifier;
  let fixture: ComponentFixture<SpamClassifier>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpamClassifier]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpamClassifier);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
