import { Component } from '@angular/core';
import {SpamClassifierService} from './spam-service';
import {FormsModule} from '@angular/forms';
import {NgClass} from '@angular/common';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-spam-classifier',
  imports: [
    FormsModule,
    NgClass,
    RouterLink
  ],
  templateUrl: './spam-classifier.html',
  styleUrl: './spam-classifier.css',
})
export class SpamClassifier {
  emailText = '';
  result: { probability: number; isSpam: boolean } | null = null;

  constructor(private classifier: SpamClassifierService) {}

  async ngOnInit() {
    await this.classifier.loadModel();
  }

  checkMessage() {
    if (!this.emailText.trim()) return;
    this.result = this.classifier.classify(this.emailText);
    console.log(this.result);
  }

}

