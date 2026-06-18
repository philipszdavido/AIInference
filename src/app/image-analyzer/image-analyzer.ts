import {AfterViewInit, Component} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {SequentialModel} from "../dist/TensorForge";

@Component({
  selector: 'app-image-analyzer',
  imports: [],
  templateUrl: './image-analyzer.html',
  styleUrl: './image-analyzer.css',
})
export class ImageAnalyzer implements AfterViewInit {

  private inferenceEngine: any;
  private canvas = document.getElementById('digit-canvas') as HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;

  private predictionOutput = document.getElementById('prediction-output') as HTMLDivElement;
  private digitResultBox = document.getElementById('digit-result-box') as HTMLDivElement;
  private predictedDigitDisplay = document.getElementById('predicted-digit') as HTMLSpanElement;
  private confidenceBreakdown = document.getElementById('confidence-breakdown') as HTMLDivElement;
  private model!: SequentialModel;

  constructor(private http: HttpClient) {
  }

  async ngAfterViewInit() {
    this.canvas = document.getElementById('digit-canvas') as HTMLCanvasElement;

    this.predictionOutput = document.getElementById('prediction-output') as HTMLDivElement;
    this.digitResultBox = document.getElementById('digit-result-box') as HTMLDivElement;
    this.predictedDigitDisplay = document.getElementById('predicted-digit') as HTMLSpanElement;
    this.confidenceBreakdown = document.getElementById('confidence-breakdown') as HTMLDivElement;

    const mnist_model = await firstValueFrom(
        this.http.get<any>('assets/model/mnist_model_weights.json')
    );

    const rawJsonData = await firstValueFrom(
        this.http.get<any>('assets/model/image28x28-model.json')
    );

    // const modelPayload: ModelPayload = {
    //   weights: rawJsonData.weights,
    //   biases: rawJsonData.biases,
    //   architecture: {
    //     input: rawJsonData.architecture.input,
    //     hidden: rawJsonData.architecture.hiddenLayers,
    //     output: rawJsonData.architecture.output
    //   }
    // };

    // this.inferenceEngine = new ModelInferenceEngine(modelPayload);
    this.model = new SequentialModel(mnist_model)

    this.ctx = this.canvas.getContext('2d', {willReadFrequently: true})!;
    this.setupCanvasProperties();
    this.initEventListeners();
  }

  private setupCanvasProperties(): void {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, 28, 28);

    this.ctx.lineWidth = 2.2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#ffffff';
  }

  private initEventListeners(): void {

    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    window.addEventListener('mouseup', () => this.stopDrawing());

    this.canvas.addEventListener('touchstart', (e) => this.startDrawing(e.touches[0]));
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.draw(e.touches[0]);
    });
    this.canvas.addEventListener('touchend', () => this.stopDrawing());

    document.getElementById('btn-clear-canvas')?.addEventListener('click', () => this.clearCanvas());
    document.getElementById('btn-predict-digit')?.addEventListener('click', () => this.handleImageInference());
  }

  private getCanvasCoords(e: MouseEvent | Touch): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();

    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  private startDrawing(e: MouseEvent | Touch): void {
    this.isDrawing = true;
    const coords = this.getCanvasCoords(e);
    this.ctx.beginPath();
    this.ctx.moveTo(coords.x, coords.y);
  }

  private draw(e: MouseEvent | Touch): void {
    if (!this.isDrawing) return;
    const coords = this.getCanvasCoords(e);
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();
  }

  private stopDrawing(): void {
    this.isDrawing = false;
  }

  private clearCanvas(): void {
    this.setupCanvasProperties();
    this.predictionOutput.classList.add('hidden');
    this.digitResultBox.classList.add('dynamic-empty');
  }

  private handleImageInference(): void {

    const imgData = this.ctx.getImageData(0, 0, 28, 28);
    const data = imgData.data;

    const normalizedPixelVector: number[] = [];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      const intensity = (r + g + b) / 3;

      let normalizedVal = (intensity / 255.0) * (a / 255.0);
      normalizedVal = normalizedVal > 0.15 ? 1.0 : 0.0;

      normalizedPixelVector.push(normalizedVal);
    }

    const centeredVector = this.centerDigitMatrix(normalizedPixelVector);

    // this.printConsoleDebug(centeredVector);

    //const realNetworkProbabilities = this.inferenceEngine.forward(centeredVector);

    const realNetworkProbabilities = this.model.predict(centeredVector)

    const highestScoreIdx = realNetworkProbabilities.indexOf(Math.max(...realNetworkProbabilities));

    this.renderDigitResults(highestScoreIdx, realNetworkProbabilities);
  }

  private printConsoleDebug(pixelVector: number[]): void {
    let asciiArt = "";
    for (let row = 0; row < 28; row++) {
      for (let col = 0; col < 28; col++) {
        const val = pixelVector[row * 28 + col];
        asciiArt += val > 0.2 ? "██" : "  ";
      }
      asciiArt += "\n";
    }
    console.log("%cMatrix Input Shape Verification:", "font-weight: bold; color: #2563eb; font-size: 12px;");
    console.log(asciiArt);
  }

  private renderDigitResults(prediction: number, scores: number[]): void {
    this.digitResultBox.classList.remove('dynamic-empty');
    this.predictionOutput.classList.remove('hidden');

    this.predictedDigitDisplay.textContent = prediction.toString();
    this.confidenceBreakdown.innerHTML = '';

    scores.forEach((prob, digit) => {
      const row = document.createElement('div');
      row.className = 'breakdown-row';
      row.innerHTML = `
        <span>Digit ${digit}:</span>
        <strong>${(prob * 100).toFixed(1)}%</strong>
      `;
      this.confidenceBreakdown.appendChild(row);
    });
  }

  private centerDigitMatrix(pixels: number[]): number[] {
    let totalMass = 0;
    let xMass = 0;
    let yMass = 0;

    for (let y = 0; y < 28; y++) {
      for (let x = 0; x < 28; x++) {
        const val = pixels[y * 28 + x];
        if (val > 0.0) {
          totalMass += val;
          xMass += x * val;
          yMass += y * val;
        }
      }
    }

    if (totalMass === 0) return pixels;

    const centerX = Math.round(xMass / totalMass);
    const centerY = Math.round(yMass / totalMass);

    const shiftX = 14 - centerX;
    const shiftY = 14 - centerY;

    const centeredPixels = new Array(784).fill(0);
    for (let y = 0; y < 28; y++) {
      for (let x = 0; x < 28; x++) {
        const srcVal = pixels[y * 28 + x];
        if (srcVal > 0) {
          const targetX = x + shiftX;
          const targetY = y + shiftY;

          if (targetX >= 0 && targetX < 28 && targetY >= 0 && targetY < 28) {
            centeredPixels[targetY * 28 + targetX] = srcVal;
          }
        }
      }
    }

    return centeredPixels;
  }

}
