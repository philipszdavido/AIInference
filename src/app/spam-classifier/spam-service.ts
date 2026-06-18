import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {ModelInferenceEngine, ModelPayload} from '../dist/api/InferenceEngine';

@Injectable({
  providedIn: 'root'
})
export class SpamClassifierService {
  private inferenceEngine!: any;
  private vocabulary: string[] = [];
  private isModelLoaded = false;

  constructor(private http: HttpClient) {}

  async loadModel(): Promise<void> {
    if (this.isModelLoaded) return;

    try {

      const modelData = await firstValueFrom(
        this.http.get<any>('assets/model/spam-model.json')
      );

      this.vocabulary = modelData.vocabulary;

      const modelPayload: ModelPayload = {
        weights: modelData.weights,
        biases: modelData.biases,
        architecture: {
          input: modelData.architecture.input,
          hidden: modelData.architecture.hiddenLayers,
          output: modelData.architecture.output
        }
      };

      this.inferenceEngine = new ModelInferenceEngine(modelPayload);

      this.isModelLoaded = true;
      console.log('Spam model hydrated successfully in Angular!');
    } catch (error) {
      console.error('Failed to load spam classifier model parameters:', error);
    }
  }

  private textToVector(text: string): number[] {
    const tokens = text.toLowerCase().split(/\s+/);
    const vector = new Array(this.vocabulary.length).fill(0);
    tokens.forEach(token => {
      const idx = this.vocabulary.indexOf(token);
      if (idx !== -1) vector[idx] = 1;
    });
    return vector;
  }

  classify(text: string): { probability: number; isSpam: boolean } {
    if (!this.isModelLoaded) {
      throw new Error('Classifier called before model hydration finished.');
    }

    const inputVector = this.textToVector(text);
    const predictionVector = this.inferenceEngine.forward(inputVector);

    const score = predictionVector[0];

    return {
      probability: score,
      isSpam: score >= 0.5
    };
  }
}
