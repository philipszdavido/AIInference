var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/core/index.ts
var core_exports = {};
__export(core_exports, {
  default: () => core_default
});

// src/assert/assert.ts
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Fail: The condition is false.");
  }
}

// src/math/vector/sum.ts
function elementwise_multiplication(vec_a, vec_b) {
  assert(vec_a.length == vec_b.length);
  let output = Array(vec_a.length);
  for (let index = 0; index < vec_a.length; index++) {
    const a = vec_a.get(index);
    const b = vec_b.get(index);
    output[index] = a * b;
  }
  return output;
}
function elementwise_addition(vec_a, vec_b) {
  assert(vec_a.length == vec_b.length);
  let output = Array(vec_a.length);
  for (let index = 0; index < vec_a.length; index++) {
    const a = vec_a.get(index);
    const b = vec_b.get(index);
    output[index] = a + b;
  }
  return output;
}

// src/core/Tensor.ts
var Tensor = class _Tensor {
  constructor(shape) {
    this.shape = shape;
    const size = shape.reduce(
      (a, b) => a * b,
      1
    );
    this.data = new Float64Array(size);
    this.strides = _Tensor.computeStrides(shape);
  }
  shape;
  data;
  strides;
  offset(indices) {
    if (indices.length !== this.shape.length) {
      throw new Error("Invalid number of indices");
    }
    let index = 0;
    for (let i = 0; i < indices.length; i++) {
      index += indices[i] * this.strides[i];
    }
    return index;
  }
  get(...indices) {
    return this.data[this.offset(indices)];
  }
  set(value, ...indices) {
    this.data[this.offset(indices)] = value;
  }
  size() {
    return this.data.length;
  }
  static computeStrides(shape) {
    const strides = new Array(shape.length);
    let stride = 1;
    for (let i = shape.length - 1; i >= 0; i--) {
      strides[i] = stride;
      stride *= shape[i];
    }
    return strides;
  }
  reshape(newShape) {
    const newSize = newShape.reduce((a, b) => a * b, 1);
    if (newSize !== this.data.length) {
      throw new Error("Invalid reshape");
    }
    const t = new _Tensor(newShape);
    t.data.set(this.data);
    return t;
  }
  fill(value) {
    this.data.fill(value);
  }
  setFloatArray(data) {
    for (let i = data.length - 1; i >= 0; i--) {
      this.data[i] = data[i];
    }
  }
  static zeros(shape) {
    const tensor = new _Tensor(shape);
    tensor.fill(0);
    return tensor;
  }
  static fromArrayShape(shape, values) {
    const tensor = new _Tensor(shape);
    for (let i = 0; i < values.length; i++) {
      tensor.data[i] = values[i];
    }
    return tensor;
  }
  clone() {
    const tensor = new _Tensor(this.shape);
    tensor.setFloatArray(this.data);
    return tensor;
  }
  toMatrix() {
    const rows = this.shape[0];
    const cols = this.shape[1];
    const matrix = new Matrix(rows, cols);
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        matrix.set(
          r,
          c,
          this.data[idx++]
        );
      }
    }
    return matrix;
  }
  static fromMatrix(matrix) {
    const tensor = new _Tensor([
      matrix.rows,
      matrix.columns
    ]);
    let idx = 0;
    for (let r = 0; r < matrix.rows; r++) {
      for (let c = 0; c < matrix.columns; c++) {
        tensor.data[idx++] = matrix.get(r, c);
      }
    }
    return tensor;
  }
  toVector() {
    if (this.shape.length !== 1) {
      throw new Error(
        "Tensor is not 1-dimensional"
      );
    }
    const v = new Vector(this.shape[0]);
    for (let i = 0; i < this.data.length; i++) {
      v.set(i, this.data[i]);
    }
    return v;
  }
  add(other) {
    if (this.data.length !== other.data.length) {
      throw new Error("Shape mismatch");
    }
    const result = new _Tensor(this.shape);
    for (let i = 0; i < this.data.length; i++) {
      result.data[i] = this.data[i] + other.data[i];
    }
    return result;
  }
  sub(other) {
    if (this.data.length !== other.data.length) {
      throw new Error("Shape mismatch");
    }
    const result = new _Tensor(this.shape);
    for (let i = 0; i < this.data.length; i++) {
      result.data[i] = this.data[i] - other.data[i];
    }
    return result;
  }
  mul(other) {
    if (this.data.length !== other.data.length) {
      throw new Error("Shape mismatch");
    }
    const result = new _Tensor(this.shape);
    for (let i = 0; i < this.data.length; i++) {
      result.data[i] = this.data[i] * other.data[i];
    }
    return result;
  }
  mulScalar(scalar) {
    const result = new _Tensor(this.shape);
    for (let i = 0; i < this.data.length; i++) {
      result.data[i] = this.data[i] * scalar;
    }
    return result;
  }
  addScalar(scalar) {
    const result = new _Tensor(this.shape);
    for (let i = 0; i < this.data.length; i++) {
      result.data[i] = this.data[i] + scalar;
    }
    return result;
  }
  _matMul(other) {
    const [m, n] = this.shape;
    const [n2, p] = other.shape;
    if (this.shape.length !== 2 || other.shape.length !== 2) {
      this.prettyPrint();
      other.prettyPrint("Other");
      throw new Error("matMul only supports 2D tensors");
    }
    if (n !== n2) {
      throw new Error("Shape mismatch for matMul");
    }
    const result = new _Tensor([m, p]);
    const out = result.data;
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < p; j++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += this.data[i * n + k] * other.data[k * p + j];
        }
        out[i * p + j] = sum;
      }
    }
    return result;
  }
  matMul(other) {
    const aDims = this.shape.length;
    const bDims = other.shape.length;
    if (aDims === 1 && bDims === 2) {
      return this.vectorMatrixMatMul(other);
    }
    if (aDims === 2 && bDims === 1) {
      return this.matrixVectorMatMul(other);
    }
    if (aDims === 2 && bDims === 2) {
      return this.matrixMatrixMatMul(other);
    }
    throw new Error(
      `matMul not supported for shapes [${this.shape}] and [${other.shape}]`
    );
  }
  dot(other) {
    const n = this.shape[0];
    if (n !== other.shape[0]) {
      throw new Error("Shape mismatch for dot product");
    }
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += this.data[i] * other.data[i];
    }
    return sum;
  }
  vectorMatrixMatMul(other) {
    const n = this.shape[0];
    const rows = other.shape[0];
    const cols = other.shape[1];
    if (n !== rows) {
      throw new Error("Shape mismatch");
    }
    const result = new _Tensor([cols]);
    for (let j = 0; j < cols; j++) {
      let sum = 0;
      for (let i = 0; i < n; i++) {
        sum += this.data[i] * other.get(i, j);
      }
      result.set(sum, j);
    }
    return result;
  }
  matrixVectorMatMul(other) {
    const rows = this.shape[0];
    const cols = this.shape[1];
    const n = other.shape[0];
    if (cols !== n) {
      throw new Error("Shape mismatch");
    }
    const result = new _Tensor([rows]);
    for (let i = 0; i < rows; i++) {
      let sum = 0;
      for (let j = 0; j < cols; j++) {
        sum += this.get(i, j) * other.data[j];
      }
      result.set(sum, i);
    }
    return result;
  }
  matrixMatrixMatMul(other) {
    const m = this.shape[0];
    const n = this.shape[1];
    const n2 = other.shape[0];
    const p = other.shape[1];
    if (n !== n2) {
      this.prettyPrint();
      other.prettyPrint("Other");
      throw new Error("Shape mismatch");
    }
    const result = new _Tensor([m, p]);
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < p; j++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += this.get(i, k) * other.get(k, j);
        }
        result.set(sum, i, j);
      }
    }
    return result;
  }
  static fromArray(values) {
    const tensor = new _Tensor([values.length]);
    for (let i = 0; i < values.length; i++) {
      tensor.set(values[i], i);
    }
    return tensor;
  }
  static from2DArray(values) {
    const rows = values.length;
    const cols = values[0].length;
    const tensor = new _Tensor([rows, cols]);
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        tensor.set(values[r][c], r, c);
      }
    }
    return tensor;
  }
  toArray() {
    return Array.from(this.data);
  }
  toNestedArray() {
    if (this.shape.length !== 2) {
      throw new Error("toNestedArray only supports 2D tensors");
    }
    const [rows, cols] = this.shape;
    const result = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push(this.get(r, c));
      }
      result.push(row);
    }
    return result;
  }
  prettyPrint(label) {
    if (label) console.log(`${label}`);
    const format = (value) => value.toFixed(4).padStart(10, " ");
    const shape = this.shape;
    if (shape.length === 1) {
      let out = "[ ";
      for (let i = 0; i < shape[0]; i++) {
        out += format(this.get(i)) + " ";
      }
      out += "]";
      console.log(out);
      return;
    }
    if (shape.length === 2) {
      const [rows, cols] = shape;
      console.log(`Tensor(${rows}x${cols})`);
      for (let r = 0; r < rows; r++) {
        let row = "[ ";
        for (let c = 0; c < cols; c++) {
          row += format(this.get(r, c)) + " ";
        }
        row += "]";
        console.log(row);
      }
      return;
    }
    console.log(`Tensor(shape=[${shape.join(", ")}])`);
    console.log(Array.from(this.data));
  }
  transpose() {
    const t = this;
    const [rows, cols] = t.shape;
    const result = new _Tensor([cols, rows]);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result.set(t.get(i, j), j, i);
      }
    }
    return result;
  }
};

// src/core/Vector.ts
var Vector = class _Vector {
  data;
  constructor(size) {
    this.data = new Float64Array(size);
  }
  set(i, val) {
    this.data[i] = val;
  }
  get(index) {
    return this.data[index];
  }
  get length() {
    return this.data.length;
  }
  sum() {
    let result = 0;
    for (let i = 0; i < this.data.length; i++) {
      result += this.data[i];
    }
    return result;
  }
  mul() {
    assert(this.data.length === 0);
    let result = 1;
    for (let i = 0; i < this.data.length; i++) {
      result *= this.data[i];
    }
    return result;
  }
  avg() {
    return this.data.length === 0 ? 0 : this.sum() / this.data.length;
  }
  toArray() {
    return Array.from(this.data);
  }
  static from(array) {
    const vec = new _Vector(array.length);
    vec.data.set(array);
    return vec;
  }
  // @TODO: test this
  static fromData(data) {
    const newData = new _Vector(data.length);
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      newData.set(index, element);
    }
    return newData;
  }
  print(label) {
    const formatted = Array.from(this.data).map((v) => v.toFixed(4)).join(", ");
    console.log(`${label ? label + ": " : ""}[ ${formatted} ] (Length: ${this.data.length})`);
  }
  static random(size) {
    const vec = new _Vector(size);
    for (let i = 0; i < size; i++) vec.set(i, Math.random());
    return vec;
  }
  static zeros(size) {
    return new _Vector(size);
  }
  static addVectors(v1, v2) {
    const res = new _Vector(v1.length);
    for (let i = 0; i < v1.length; i++) {
      res.set(i, v1.get(i) + v2.get(i));
    }
    return res;
  }
  static subVectors(left, right) {
    const res = new _Vector(left.length);
    for (let i = 0; i < left.length; i++) {
      res.set(i, left.get(i) - right.get(i));
    }
    return res;
  }
  static multiplyScalar(vec, scalar) {
    const res = new _Vector(vec.length);
    for (let i = 0; i < vec.length; i++) {
      res.set(i, vec.get(i) * scalar);
    }
    return res;
  }
  static mulVectors(vec_a, vec_b) {
    return _Vector.from(elementwise_multiplication(vec_a, vec_b));
  }
  toTensor() {
    const tensor = new Tensor([1, this.length]);
    for (let i = 0; i < this.length; i++) {
      tensor.set(this.data[i], 0, i);
    }
    return tensor;
  }
};

// src/core/Matrix.ts
var Matrix = class _Matrix {
  constructor(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.data = new Float64Array(rows * columns);
  }
  rows;
  columns;
  data;
  get(r, c) {
    return this.data[r * this.columns + c];
  }
  set(r, c, val) {
    this.data[r * this.columns + c] = val;
  }
  getRow(r) {
    const start = r * this.columns;
    return this.data.subarray(
      start,
      start + this.columns
    );
  }
  setRow(r, row) {
    const start = r * this.columns;
    this.data.set(row, start);
  }
  fill(val) {
    for (let index = 0; index < this.rows; index++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(index, j, val);
      }
    }
  }
  static matrixMulVector(m, v) {
    assert(m.columns === v.length, `Shape mismatch: Matrix columns (${m.columns}) must equal Vector length (${v.length})`);
    const result = new Vector(m.rows);
    for (let i = 0; i < m.rows; i++) {
      let sum = 0;
      const rowOffset = i * m.columns;
      for (let j = 0; j < m.columns; j++) {
        sum += m.data[rowOffset + j] * v.get(j);
      }
      result.set(i, sum);
    }
    return result;
  }
  static outerProduct(a, b) {
    const result = new _Matrix(a.length, b.length);
    for (let i = 0; i < a.length; i++) {
      const rowOffset = i * b.length;
      const aval = a.get(i);
      for (let j = 0; j < b.length; j++) {
        result.data[rowOffset + j] = aval * b.get(j);
      }
    }
    return result;
  }
  static zeros(rows, columns) {
    const data = new _Matrix(rows, columns);
    for (let index = 0; index < rows; index++) {
      for (let j = 0; j < columns; j++) {
        data.set(index, j, 0);
      }
    }
    return data;
  }
  print(label) {
    if (label) console.log(`
${label}`);
    console.log(`Matrix(${this.rows}x${this.columns})`);
    for (let i = 0; i < this.rows; i++) {
      let rowStr = "[ ";
      for (let j = 0; j < this.columns; j++) {
        rowStr += this.get(i, j).toFixed(4) + " ";
      }
      console.log(rowStr + "]");
    }
  }
  static add(m, v) {
    assert(m.columns === v.columns, `Shape mismatch: Matrix columns (${m.columns}) must equal Matrix columns (${v.columns})`);
    const result = new _Matrix(m.rows, m.columns);
    for (let r = 0; r < m.rows; r++) {
      for (let c = 0; c < m.columns; c++) {
        const dVal = v.get(r, c);
        result.set(r, c, m.get(r, c) + dVal);
      }
    }
    return result;
  }
  static sub(left, right) {
    assert(left.columns === right.columns, `Shape mismatch: Matrix columns (${left.columns}) must equal Matrix columns (${left.columns})`);
    const result = new _Matrix(right.rows, right.columns);
    for (let r = 0; r < left.rows; r++) {
      for (let c = 0; c < left.columns; c++) {
        const rVal = right.get(r, c);
        result.set(r, c, left.get(r, c) - rVal);
      }
    }
    return result;
  }
  // @TODO: test this
  // [[0,1,2,3,4,5]]
  static from(arr) {
    const data = new _Matrix(arr.length, arr[0].length);
    for (let index = 0; index < arr.length; index++) {
      const col = arr[index];
      for (let j = 0; j < col.length; j++) {
        data.set(index, j, col[j]);
      }
    }
    return data;
  }
  // @TODO: test this
  static fromVector(vec) {
    const data = new _Matrix(vec.length, 1);
    for (let index = 0; index < vec.length; index++) {
      data.set(0, index, vec.get(index));
    }
    return data;
  }
  static random(rows, columns) {
    const data = new _Matrix(rows, columns);
    for (let index = 0; index < rows; index++) {
      for (let j = 0; j < columns; j++) {
        data.set(index, j, Math.random());
      }
    }
    return data;
  }
  // @TODO: test this
  mul(a) {
    const newData = new _Matrix(a.rows, this.columns);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < a.columns; j++) {
        let sum = 0;
        for (let k = 0; k < this.columns; k++) {
          const result = this.get(i, j) * a.get(i, j);
          sum += result;
        }
        newData.set(i, j, sum);
      }
    }
    return newData;
  }
  // @TODO: test this
  static batchMul(X, W) {
    assert(X.columns === W.rows, "Shape mismatch: Batch \xD7 Weights");
    const result = new _Matrix(X.rows, W.columns);
    for (let i = 0; i < X.rows; i++) {
      for (let j = 0; j < W.columns; j++) {
        let sum = 0;
        for (let k = 0; k < X.columns; k++) {
          sum += X.get(i, k) * W.get(k, j);
        }
        result.set(i, j, sum);
      }
    }
    return result;
  }
  toNestedArray() {
    const result = [];
    for (let r = 0; r < this.rows; r++) {
      const rowData = Array.from(this.getRow(r));
      result.push(rowData);
    }
    return result;
  }
  static multiplyScalar(matrix, scalar) {
    const result = new _Matrix(matrix.rows, matrix.columns);
    for (let r = 0; r < matrix.rows; r++) {
      for (let c = 0; c < matrix.columns; c++) {
        result.set(r, c, matrix.get(r, c) * scalar);
      }
    }
    return result;
  }
  copy() {
    const c = new _Matrix(this.rows, this.columns);
    for (let ii = 0; ii < this.rows; ii++) {
      for (let jj = 0; jj < this.columns; jj++) {
        c.set(ii, jj, this.get(ii, jj));
      }
    }
    return c;
  }
  toTensor() {
    const tensor = new Tensor([this.rows, this.columns]);
    let idx = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns; c++) {
        tensor.set(this.get(r, c), r, c);
      }
    }
    return tensor;
  }
  static toMatrix(pixels, row, column) {
    return _Matrix.fromArray(pixels, row, column);
  }
  static fromArray(values, row, column) {
    const m = new _Matrix(row, column);
    let k = 0;
    for (let r = 0; r < row; r++) {
      for (let c = 0; c < column; c++) {
        m.set(r, c, values[k++]);
      }
    }
    return m;
  }
  static fromNestedArray(nestedArray, rows, columns) {
    const m = new _Matrix(rows, columns);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        m.set(r, c, nestedArray[r][c]);
      }
    }
    return m;
  }
};

// src/core/index.ts
var core_default = {
  Matrix,
  Tensor,
  Vector
};

// src/models/index.ts
var models_exports = {};
__export(models_exports, {
  ActivationEnum: () => ActivationEnum,
  ActivationUse: () => ActivationUse,
  BCE: () => BCE,
  DiscretePerceptron: () => DiscretePerceptron,
  LeakyReLUActivation: () => LeakyReLUActivation,
  LinearActivation: () => LinearActivation,
  LinearRegression: () => LinearRegression,
  LogisticRegression: () => LogisticRegression,
  Loss: () => Loss,
  LossEnum: () => LossEnum,
  MSE: () => MSE,
  NaiveBayes: () => NaiveBayes,
  NeuralNetwork: () => NeuralNetwork,
  PolynomialRegression: () => PolynomialRegression,
  ReLUActivation: () => ReLUActivation,
  SigmoidActivation: () => SigmoidActivation,
  SoftmaxCE: () => SoftmaxCE,
  SoftmaxCrossEntropy: () => SoftmaxCrossEntropy,
  SoftmaxPassThrough: () => SoftmaxPassThrough,
  TanhActivation: () => TanhActivation
});

// src/math/vector/dot.ts
function dot(a, b) {
  assert(a.length == b.length);
  let sum = 0;
  for (let index = 0; index < a.length; index++) {
    const a1 = a.get(index);
    const b1 = b.get(index);
    if (index == 0) {
      sum = a1 * b1;
      continue;
    }
    sum += a1 * b1;
  }
  return sum;
}

// src/models/Model.ts
var Model = class {
  constructor(inputSize, bias = 0) {
    this.inputSize = inputSize;
    this.bias = bias;
    this.weights = this.initializeWeights(inputSize);
    this.gradWeights = new Array(inputSize).fill(0);
    this.gradBias = 0;
  }
  inputSize;
  bias;
  weights;
  gradBias;
  gradWeights;
  initializeWeights(size) {
    const limit = Math.sqrt(1 / size);
    return Array.from({ length: size }, () => (Math.random() * 2 - 1) * limit);
  }
  getWeights() {
    return this.weights;
  }
  getBias() {
    return this.bias;
  }
  getGradWeights() {
    return this.gradWeights;
  }
  getGradBias() {
    return this.gradBias;
  }
};

// src/error/error.ts
function error(predicted, actual) {
  return predicted - actual;
}

// src/models/LinearRegression.ts
var LinearRegression = class extends Model {
  constructor(inputSize, bias = 0) {
    super(inputSize, bias);
    this.inputSize = inputSize;
    this.bias = bias;
  }
  inputSize;
  bias;
  calc(x, weights, bias) {
    return dot(Vector.from(x), Vector.from(weights)) + bias;
  }
  setBias(bias) {
    this.bias = bias;
  }
  setWeights(weights) {
    this.weights = weights;
  }
  activate(x) {
    return x;
  }
  predict(x) {
    return this.forward(x);
  }
  forward(x) {
    return this.activate(this.calc(x, this.weights, this.bias));
  }
  backward(x, y, yHat) {
    const errorValue = error(yHat, y);
    for (let i = 0; i < this.weights.length; i++) {
      this.gradWeights[i] = errorValue * x[i];
    }
    this.gradBias = errorValue;
  }
};

// src/math/sigmoid.ts
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}
function Sigmoid(vec) {
  const v = new Vector(vec.length);
  for (let i = 0; i < vec.length; i++) {
    v.set(i, sigmoid(vec.get(i)));
  }
  return v;
}
function Sigmoid_derivative(_, a) {
  const v = new Vector(a.length);
  for (let i = 0; i < a.length; i++) {
    const val = a.get(i);
    v.set(i, val * (1 - val));
  }
  return v;
}

// src/models/LogisticRegression.ts
var LogisticRegression = class extends Model {
  constructor(inputSize, bias = -1) {
    super(inputSize, bias);
    this.inputSize = inputSize;
    this.bias = bias;
  }
  inputSize;
  bias;
  calc(x, weights, bias) {
    return dot(Vector.from(x), Vector.from(weights)) + bias;
  }
  setBias(bias) {
    this.bias = bias;
  }
  setWeights(weights) {
    this.weights = weights;
  }
  activate(x) {
    return sigmoid(x);
  }
  predict(x) {
    return this.activate(this.calc(x, this.weights, this.bias));
  }
  forward(x) {
    return this.predict(x);
  }
  backward(x, y, yHat) {
    const errorValue = error(yHat, y);
    for (let i = 0; i < this.weights.length; i++) {
      this.gradWeights[i] = errorValue * x[i];
    }
    this.gradBias = errorValue;
  }
};

// src/models/NaiveBayes.ts
var NaiveBayes = class {
  constructor(samples, labels) {
    this.samples = samples;
    this.labels = labels;
  }
  samples;
  labels;
  TotalOfAllWordsInLabel = {};
  TotalOfAWordPerLabel = {};
  TotalCountOfLabels = {};
  train() {
    const labels = this.labels;
    const samples = this.samples;
    for (let i = 0; i < samples.length; i++) {
      const sample = samples[i];
      const label = sample.label;
      if (!this.TotalOfAllWordsInLabel[label]) {
        this.TotalOfAllWordsInLabel[label] = 0;
      }
      if (!this.TotalCountOfLabels[label]) {
        this.TotalCountOfLabels[label] = 0;
      }
      this.TotalCountOfLabels[label]++;
      const words = this.tokenize(sample.data);
      for (let j = 0; j < words.length; j++) {
        const word = words[j];
        if (!this.TotalOfAWordPerLabel[word]) {
          this.TotalOfAWordPerLabel[word] = {};
          for (const label2 of labels) {
            this.TotalOfAWordPerLabel[word][label2] = 0;
          }
        }
        this.TotalOfAWordPerLabel[word][label] += 1;
        this.TotalOfAllWordsInLabel[label] += 1;
      }
    }
  }
  predict(sampleText) {
    const text = sampleText.split(" ");
    const labels = this.labels;
    const scores = {};
    for (const label of labels) {
      scores[label] = [];
    }
    for (const word of text) {
      for (const label of labels) {
        const wordProbInLabel = (this.TotalOfAWordPerLabel?.[word]?.[label] || 0) / this.TotalOfAllWordsInLabel[label];
        let TotalOfWordsNotInThisLabel = 0;
        let TotalOfAWordPerNotInThisLabel = 0;
        for (const _label of labels) {
          if (_label == label) continue;
          TotalOfWordsNotInThisLabel += this.TotalOfAllWordsInLabel[_label];
          TotalOfAWordPerNotInThisLabel += this.TotalOfAWordPerLabel?.[word]?.[_label] || 0;
        }
        const otherP = TotalOfAWordPerNotInThisLabel / TotalOfWordsNotInThisLabel;
        scores[label].push(wordProbInLabel / (wordProbInLabel + otherP) || 0);
      }
    }
    const TotalScores = {};
    let highestScore = 0;
    let highest = "";
    for (const label of labels) {
      const Total = scores[label].reduce((acc, val) => acc + val, 0);
      TotalScores[label] = Total;
      if (Total > highestScore) {
        highestScore = Total;
        highest = label;
      }
    }
    return highest;
  }
  tokenize(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
  }
};

// src/models/Perceptron.ts
var DiscretePerceptron = class extends Model {
  constructor(inputSize, bias = -1) {
    super(inputSize, bias);
    this.inputSize = inputSize;
    this.bias = bias;
  }
  inputSize;
  bias;
  calc(x, weights, bias) {
    return dot(Vector.from(x), Vector.from(weights)) + bias;
  }
  step(logit) {
    assert(typeof logit == "number");
    return logit >= 0 ? 1 : 0;
  }
  forward(x) {
    return this.step(this.calc(x, this.weights, this.bias));
  }
  backward(x, y, yHat) {
    const errorValue = error(y, yHat);
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] += errorValue * x[i] * 0.1;
    }
    this.bias += errorValue * 0.1;
  }
  setBias(bias) {
    this.bias = bias;
  }
  setWeights(weights) {
    this.weights = weights;
  }
};

// src/models/PolyNomialRegression.ts
var PolynomialRegression = class extends LinearRegression {
  constructor(degree = 2, inputSize) {
    super(inputSize);
    this.degree = degree;
    this.inputSize = inputSize;
  }
  degree;
  inputSize;
  getDegree() {
    return this.degree;
  }
  predict(x) {
    const _x = this.transform([x]);
    return this.forward(_x[0]);
  }
  transform(x) {
    return x.map((_x) => {
      const expanded = [];
      for (let j = 0; j < _x.length; j++) {
        for (let i = 1; i <= this.getDegree(); i++) {
          expanded.push(_x[j] * i);
        }
      }
      return expanded;
    });
  }
};

// src/math/relu.ts
function relu(x) {
  return Math.max(0, x);
}
function ReLU(vec) {
  const v = new Vector(vec.length);
  for (let i = 0; i < vec.length; i++) {
    v.set(i, relu(vec.get(i)));
  }
  return v;
}
function ReLU_derivative(v, _) {
  const result = new Vector(v.length);
  for (let i = 0; i < v.length; i++) {
    result.set(i, v.get(i) > 0 ? 1 : 0);
  }
  return result;
}

// src/models/neural/SoftmaxCrossEntropy.ts
var SoftmaxCrossEntropy = class {
  lastPredictions;
  forward(z) {
    const raw = z.toArray();
    const maxAttr = Math.max(...raw);
    const exps = raw.map((x) => Math.exp(x - maxAttr));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    const softmaxData = exps.map((x) => x / sumExps);
    this.lastPredictions = Vector.from(softmaxData);
    return this.lastPredictions;
  }
  loss(y, pred) {
    const yArr = y.toArray();
    const predArr = pred.toArray();
    let totalLoss = 0;
    for (let i = 0; i < yArr.length; i++) {
      totalLoss -= yArr[i] * Math.log(predArr[i] + 1e-15);
    }
    return totalLoss;
  }
  fusedGradient(y) {
    if (!this.lastPredictions) {
      throw new Error("Forward pass must be called before backward pass.");
    }
    const predArr = this.lastPredictions.toArray();
    const yArr = y.toArray();
    const gradientData = predArr.map((pred, i) => pred - yArr[i]);
    return Vector.from(gradientData);
  }
};

// src/math/initialization/He.ts
function He(inputs) {
  return Math.sqrt(2 / inputs);
}

// src/math/initialization/Xavier.ts
function Xavier(inputs) {
  return Math.sqrt(1 / inputs);
}

// src/math/tanh.ts
function tanh(value) {
  return Math.tanh(value);
}
function Tanh(x) {
  const arr = x.toArray().map((_x) => tanh(_x));
  return Vector.from(arr);
}

// src/models/neural/Activation.ts
var LinearActivation = {
  forward: (x) => x,
  derivative: (x) => {
    const data = new Array(x.length).fill(1);
    return Vector.from(data);
  },
  initializer(inputs) {
    return Math.sqrt(1 / inputs);
  }
};
var ReLUActivation = {
  forward: ReLU,
  derivative: ReLU_derivative,
  initializer(inputs) {
    return Math.sqrt(2 / inputs);
  }
};
var LeakyReLUActivation = {
  derivative(x, y) {
    const arr = y.toArray().map((_y) => _y > 0 ? 1 : 0.01);
    return Vector.from(arr);
  },
  forward(x) {
    const arr = x.toArray().map((_x) => _x > 0 ? _x : 0.01 * _x);
    return Vector.from(arr);
  },
  initializer: He
};
var TanhActivation = {
  derivative(x, y) {
    const arr = x.toArray().map((actVal) => 1 - actVal ** 2);
    return Vector.from(arr);
  },
  forward: Tanh,
  initializer: Xavier
};
var SigmoidActivation = {
  forward: Sigmoid,
  derivative: Sigmoid_derivative,
  initializer(inputs) {
    return Math.sqrt(1 / inputs);
  }
};
var SoftmaxCE = new SoftmaxCrossEntropy();
var SoftmaxPassThrough = {
  forward: (x) => SoftmaxCE.forward(x),
  derivative: () => {
    throw new Error("Fused");
  },
  initializer: (inputs) => Math.sqrt(1 / inputs)
};

// src/error/mse.ts
function meanSquareError(x, y) {
  assert(x.length == y.length);
  let sum = 0;
  for (let i = 0; i < x.length; i++) {
    const result = (x[i] - y[i]) ** 2;
    sum += result;
  }
  return sum / x.length;
}
function meanSquareErrorVector(y, pred) {
  return meanSquareError(y.toArray(), pred.toArray());
}
function MSEGradient(y, pred) {
  return Vector.from(pred.toArray().map((p, i) => (p - y.get(i)) / y.length));
}

// src/loss/BCELoss.ts
function BCEVector(y, pred) {
  return -y.toArray().reduce((s, v, i) => {
    const p = Math.max(pred.get(i), 1e-15);
    return s + v * Math.log(p) + (1 - v) * Math.log(Math.max(1 - p, 1e-15));
  }, 0) / y.length;
}
function BCEGradient(y, pred) {
  return Vector.from(pred.toArray().map((p, i) => {
    const t = y.get(i);
    const eps = 1e-15;
    return -(t / Math.max(p, eps) - (1 - t) / Math.max(1 - p, eps)) / y.length;
  }));
}

// src/models/neural/LossFunction.ts
var MSE = {
  loss: meanSquareErrorVector,
  gradient: MSEGradient
};
var BCE = {
  loss: BCEVector,
  gradient: BCEGradient
};
var LossEnum = /* @__PURE__ */ ((LossEnum3) => {
  LossEnum3[LossEnum3["mce"] = 0] = "mce";
  LossEnum3[LossEnum3["bce"] = 1] = "bce";
  LossEnum3[LossEnum3["softmaxce"] = 2] = "softmaxce";
  return LossEnum3;
})(LossEnum || {});
var Loss = {
  [0 /* mce */]: MSE,
  [1 /* bce */]: BCE,
  [2 /* softmaxce */]: SoftmaxCE
};

// src/math/transpose.ts
function transpose(matrix) {
  const result = new Matrix(matrix.columns, matrix.rows);
  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.columns; j++) {
      result.set(j, i, matrix.get(i, j));
    }
  }
  return result;
}

// src/models/neural/Types.ts
var ActivationEnum = /* @__PURE__ */ ((ActivationEnum6) => {
  ActivationEnum6[ActivationEnum6["relu"] = 0] = "relu";
  ActivationEnum6[ActivationEnum6["softmax"] = 1] = "softmax";
  ActivationEnum6[ActivationEnum6["sigmoid"] = 2] = "sigmoid";
  ActivationEnum6[ActivationEnum6["linear"] = 3] = "linear";
  ActivationEnum6[ActivationEnum6["leakyRelu"] = 4] = "leakyRelu";
  ActivationEnum6[ActivationEnum6["tanh"] = 5] = "tanh";
  return ActivationEnum6;
})(ActivationEnum || {});
var ActivationUse = {
  [0 /* relu */]: ReLUActivation,
  [1 /* softmax */]: SoftmaxPassThrough,
  [2 /* sigmoid */]: SigmoidActivation,
  [3 /* linear */]: LinearActivation,
  [4 /* leakyRelu */]: LeakyReLUActivation,
  [5 /* tanh */]: TanhActivation
};

// src/models/neural/NeuralNetwork.ts
var NeuralNetwork = class {
  constructor(input, hidden, output, loss) {
    this.input = input;
    this.hidden = hidden;
    this.output = output;
    this.loss = loss;
    let currentInputs = input.size;
    for (let i = 0; i < hidden.length; i++) {
      const { size, activation } = hidden[i];
      const weight2 = this.initializeWeights(
        size,
        currentInputs,
        this.getActivation(activation)
      );
      const dW2 = Matrix.zeros(size, currentInputs);
      const bias2 = Vector.zeros(size);
      const dB2 = Vector.zeros(size);
      this.layers.push({ weight: weight2, bias: bias2, dW: dW2, dB: dB2, activation });
      currentInputs = size;
    }
    const weight = this.initializeWeights(
      output.size,
      currentInputs,
      this.getActivation(output.activation)
    );
    const bias = Vector.zeros(output.size);
    const dW = Matrix.zeros(output.size, currentInputs);
    const dB = Vector.zeros(output.size);
    this.layers.push({ weight, bias, dW, dB, activation: output.activation });
  }
  input;
  hidden;
  output;
  loss;
  layers = [];
  isTraining = true;
  forward(input) {
    let a = Vector.from(input);
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const z = Matrix.matrixMulVector(layer.weight, a);
      const zWithBias = Vector.from(elementwise_addition(z, layer.bias));
      layer.z = zWithBias;
      layer.input = a;
      layer.a = this.getActivation(layer.activation).forward(zWithBias);
      a = layer.a;
    }
    return a;
  }
  backward(y) {
    const output = this.layers[this.layers.length - 1];
    const Y = Vector.from(y);
    let delta;
    if (this.loss instanceof SoftmaxCrossEntropy) {
      delta = this.loss.fusedGradient(Y);
    } else {
      const Predicted = output.a;
      const lossGrad = this.loss.gradient(Y, Predicted);
      delta = Vector.mulVectors(lossGrad, this.getActivation(output.activation).derivative(output.z, output.a));
    }
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      layer.dB = Vector.addVectors(Vector.from(delta.toArray()), layer.dB);
      layer.dW = Matrix.add(layer.dW, Matrix.outerProduct(delta, layer.input));
      if (i > 0) {
        const prevLayer = this.layers[i - 1];
        const WT = transpose(layer.weight);
        delta = Vector.mulVectors(
          Matrix.matrixMulVector(WT, delta),
          this.getActivation(prevLayer.activation).derivative(prevLayer.a, prevLayer.z)
        );
      }
    }
  }
  update(lr) {
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      for (let r = 0; r < layer.weight.rows; r++) {
        for (let c = 0; c < layer.weight.columns; c++) {
          const current = layer.weight.get(r, c);
          const grad = layer.dW.get(r, c);
          layer.weight.set(r, c, current - lr * grad);
          layer.dW.set(r, c, 0);
        }
      }
      for (let j = 0; j < layer.bias.length; j++) {
        const current = layer.bias.get(j);
        const grad = layer.dB.get(j);
        layer.bias.set(j, current - lr * grad);
        layer.dB.set(j, 0);
      }
    }
  }
  initializeWeights(outputs, inputs, activation) {
    const std = activation.initializer(inputs);
    const W = Matrix.zeros(outputs, inputs);
    for (let r = 0; r < outputs; r++) {
      for (let c = 0; c < inputs; c++) {
        const u1 = Math.random() || 1e-10;
        const u2 = Math.random();
        const norm = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        W.set(r, c, norm * std);
      }
    }
    return W;
  }
  getWeightsAndBiases() {
    return {
      weights: this.layers.map((layer) => layer.weight.toNestedArray()),
      biases: this.layers.map((layer) => layer.bias.toArray())
    };
  }
  setMode(mode) {
    this.isTraining = mode === "train";
  }
  getActivation(type) {
    return ActivationUse[type];
  }
  getWeights() {
    return this.layers.map((layer, index) => ({
      layerIndex: index,
      weights: layer.weight.toNestedArray(),
      biases: layer.bias.toArray()
    }));
  }
  setWeights(savedLayers) {
    savedLayers.forEach((savedLayer, index) => {
      this.layers[index] = savedLayer.weights;
      this.layers[index] = savedLayer.biases;
    });
  }
};

// src/api/InferenceEngine.ts
var ModelInferenceEngine = class {
  layers = [];
  constructor(modelData) {
    this.assembleLayers(modelData);
  }
  assembleLayers(modelData) {
    const { weights, biases, architecture } = modelData;
    const totalLayers = architecture.hidden.length + 1;
    for (let i = 0; i < totalLayers; i++) {
      const isOutputLayer = i === architecture.hidden.length;
      const activationStrategy = isOutputLayer ? architecture.output.activation : architecture.hidden[i].activation;
      const layer = {
        weight: Matrix.from(weights[i]),
        bias: Vector.from(biases[i]),
        activation: activationStrategy
      };
      this.layers.push(layer);
    }
  }
  forward(input) {
    let a = Vector.from(input);
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const z = Matrix.matrixMulVector(layer.weight, a);
      const zWithBias = Vector.from(elementwise_addition(z, layer.bias));
      a = ActivationUse[layer.activation].forward(zWithBias);
    }
    return a.toArray();
  }
};

// src/models/neural/convo2d/SlidingWindow.ts
var SlidingWindow = class {
  constructor(stride, kernel) {
    this.stride = stride;
    this.kernel = kernel;
  }
  stride;
  kernel;
  extractWindow(input, row, col) {
    const holder = Matrix.zeros(this.kernel.rows, this.kernel.columns);
    let iter_row = row;
    let iter_col = col;
    for (let j = 0; j < this.kernel.rows; j++) {
      for (let k = 0; k < this.kernel.columns; k++) {
        holder.set(j, k, input.get(iter_row, iter_col));
        iter_col++;
      }
      iter_col = col;
      iter_row++;
    }
    return holder;
  }
  slide_vert_fn(col1, col2) {
    let acc = 0;
    let temp = col2;
    for (let i = 0; i < col2; i = i + this.stride) {
      const diff = temp - col1;
      if (diff < 0) break;
      temp = temp - this.stride;
      acc += 1;
    }
    return acc;
  }
  slide_down_fn(row1, row2) {
    let acc = 0;
    let temp = row2;
    for (let i = 0; i < row2; i = i + this.stride) {
      const diff = temp - row1;
      if (diff < 0) break;
      temp = temp - this.stride;
      acc += 1;
    }
    return acc;
  }
};

// src/models/neural/convo2d/Convo2D.ts
var Convo2D = class {
  constructor(kernel, stride = 1) {
    this.kernel = kernel;
    this.stride = stride;
    for (let i = 0; i < this.kernel.length; i++) {
      const kernel2 = this.kernel[i];
      this.slidingWindow.push(new SlidingWindow(stride, kernel2));
      this.dKernel.push(Matrix.zeros(kernel2.rows, kernel2.columns));
    }
  }
  kernel;
  stride;
  feature = [];
  slidingWindow = [];
  dKernel = [];
  input;
  inputRows;
  inputColumns;
  forward(input) {
    this.input = input;
    this.inputRows = input.rows;
    this.inputColumns = input.columns;
    for (let i = 0; i < this.kernel.length; i++) {
      const kernel = this.kernel[i];
      this.feature[i] = this.convolution(input, i);
    }
    return this.feature;
  }
  convolution(input, index) {
    const slide_vert = this.slidingWindow[index].slide_vert_fn(this.kernel[index].columns, input.columns);
    const slide_down = this.slidingWindow[index].slide_down_fn(this.kernel[index].rows, input.rows);
    const feature = new Matrix(slide_down, slide_vert);
    for (let i = 0; i < slide_down; i++) {
      for (let j = 0; j < slide_vert; j++) {
        const extractedWindow = this.slidingWindow[index].extractWindow(input, i * this.stride, j * this.stride);
        feature.set(i, j, this.convolveWindow(extractedWindow, index));
      }
    }
    return feature;
  }
  convolveWindow(holder, index) {
    let sum = 0;
    for (let i = 0; i < holder.rows; i++) {
      for (let j = 0; j < holder.columns; j++) {
        const h = holder.get(i, j);
        const fill = this.kernel[index].get(i, j);
        sum += fill * h;
      }
    }
    return sum;
  }
  backward(dOutput) {
    for (let index = 0; index < dOutput.length; index++) {
      const dInput = Matrix.zeros(
        this.input.rows,
        this.input.columns
      );
      for (let r = 0; r < dOutput[index].rows; r++) {
        for (let c = 0; c < dOutput[index].columns; c++) {
          const grad = dOutput[index].get(r, c);
          const rowStart = r * this.stride;
          const colStart = c * this.stride;
          for (let kr = 0; kr < this.kernel[index].rows; kr++) {
            for (let kc = 0; kc < this.kernel[index].columns; kc++) {
              const currentKernelGrad = this.dKernel[index].get(kr, kc);
              this.dKernel[index].set(
                kr,
                kc,
                currentKernelGrad + grad * this.input.get(
                  rowStart + kr,
                  colStart + kc
                )
              );
              const currentInputGrad = dInput.get(
                rowStart + kr,
                colStart + kc
              );
              dInput.set(
                rowStart + kr,
                colStart + kc,
                currentInputGrad + grad * this.kernel[index].get(kr, kc)
              );
            }
          }
        }
      }
      return dInput;
    }
    return this.input;
  }
  updateWeights(lr) {
    for (let i = 0; i < this.kernel.length; i++) {
      const kernel = this.kernel[i];
      const dKernel = this.dKernel[i];
      for (let r = 0; r < kernel.rows; r++) {
        for (let c = 0; c < kernel.columns; c++) {
          kernel.set(
            r,
            c,
            kernel.get(r, c) - lr * dKernel.get(r, c)
          );
        }
      }
      this.zeroGrad(i);
    }
  }
  zeroGrad(index) {
    this.dKernel[index].fill(0);
  }
  getWeights() {
    return this.kernel.map((filter) => filter.toNestedArray());
  }
  setWeights(savedFilters, kernelSize) {
    this.kernel = savedFilters.map((fArray) => Matrix.fromNestedArray(fArray, kernelSize, kernelSize));
  }
  setInputRowsAndColumns(rows, cols) {
    this.inputColumns = cols;
    this.inputRows = rows;
  }
  getInputRowsColumns() {
    return { rows: this.inputRows, columns: this.inputColumns };
  }
};

// src/models/neural/convo2d/ReLU2DLayer.ts
var ReLU2D = class {
  input;
  forward(input) {
    this.input = input;
    const outputs = [];
    for (let index = 0; index < input.length; index++) {
      const out = Matrix.zeros(
        input[index].rows,
        input[index].columns
      );
      for (let i = 0; i < input[index].rows; i++) {
        for (let j = 0; j < input[index].columns; j++) {
          out.set(
            i,
            j,
            Math.max(
              0,
              input[index].get(i, j)
            )
          );
        }
      }
      outputs.push(out);
    }
    return outputs;
  }
  backward(input) {
    const o = [];
    for (let index = 0; index < input.length; index++) {
      const b = Matrix.zeros(input[index].rows, input[index].columns);
      for (let j = 0; j < b.rows; j++) {
        for (let k = 0; k < b.columns; k++) {
          b.set(j, k, this.input[index].get(j, k) > 0 ? input[index].get(j, k) : 0);
        }
      }
      o.push(b);
    }
    return o;
  }
  updateWeights() {
  }
};

// src/models/neural/convo2d/MaxPooling2D.ts
var MaxPooling2D = class {
  constructor(kernel, stride = 1) {
    this.kernel = kernel;
    this.stride = stride;
    for (let i = 0; i < this.kernel.length; i++) {
      const kernel2 = this.kernel[i];
      this.slidingWindow[i] = new SlidingWindow(stride, kernel2);
    }
  }
  kernel;
  stride;
  feature = [];
  slidingWindow = [];
  input;
  maxPositionsCache = [];
  forward(input) {
    this.input = input;
    for (let i = 0; i < this.kernel.length; i++) {
      this.maxPool(input[i], i);
    }
    return this.feature;
  }
  maxPool(input, index) {
    const slide_vert = this.slidingWindow[index].slide_vert_fn(this.kernel[index].columns, input.columns);
    const slide_down = this.slidingWindow[index].slide_down_fn(this.kernel[index].rows, input.rows);
    this.maxPositionsCache[index] = /* @__PURE__ */ new Map();
    this.feature[index] = new Matrix(slide_down, slide_vert);
    for (let i = 0; i < slide_down; i++) {
      for (let j = 0; j < slide_vert; j++) {
        const extractedWindow = this.slidingWindow[index].extractWindow(input, i * this.stride, j * this.stride);
        const result = this.max(extractedWindow);
        this.feature[index].set(i, j, result.max);
        this.maxPositionsCache[index].set(`${i},${j}`, {
          row: i * this.stride + result.localRow,
          col: j * this.stride + result.localCol
        });
      }
    }
    return this.feature;
  }
  max(extractedWindow) {
    let localRow = 0;
    let localCol = 0;
    let max = -Infinity;
    for (let i = 0; i < extractedWindow.rows; i++) {
      for (let j = 0; j < extractedWindow.columns; j++) {
        let v = extractedWindow.get(i, j);
        if (v > max) {
          localRow = i;
          localCol = j;
          max = v;
        }
      }
    }
    return { max, localRow, localCol };
  }
  backward(output) {
    const inputs = [];
    for (let index = 0; index < output.length; index++) {
      const input = Matrix.zeros(this.input[index].rows, this.input[index].columns);
      for (let i = 0; i < output[index].rows; i++) {
        for (let j = 0; j < output[index].columns; j++) {
          const grad = output[index].get(i, j);
          const pos = this.maxPositionsCache[index].get(`${i},${j}`);
          if (pos) {
            const currentGrad = input.get(pos.row, pos.col);
            input.set(pos.row, pos.col, currentGrad + grad);
          }
        }
      }
      inputs.push(input);
    }
    return inputs;
  }
  updateWeights() {
  }
};

// src/models/neural/convo2d/Flatten.ts
var Flatten = class {
  inputShape = [];
  forward(input) {
    this.inputShape = input.map((m) => ({ rows: m.rows, cols: m.columns }));
    const flattenedData = [];
    for (const matrix of input) {
      for (let r = 0; r < matrix.rows; r++) {
        for (let c = 0; c < matrix.columns; c++) {
          flattenedData.push(matrix.get(r, c));
        }
      }
    }
    return Vector.from(flattenedData);
  }
  backward(grad) {
    const output = [];
    let cursor = 0;
    for (const shape of this.inputShape) {
      const matrix = new Matrix(shape.rows, shape.cols);
      for (let r = 0; r < shape.rows; r++) {
        for (let c = 0; c < shape.cols; c++) {
          matrix.set(r, c, grad.get(cursor++));
        }
      }
      output.push(matrix);
    }
    return output;
  }
  updateWeights() {
  }
};

// src/models/neural/dense/NeuralNetworkDense.ts
var NeuralNetworkDense = class {
  constructor(denseLayers, loss) {
    this.denseLayers = denseLayers;
    this.loss = loss;
  }
  denseLayers;
  loss;
  forward(input) {
    let a = Vector.from(input);
    for (let i = 0; i < this.denseLayers.length; i++) {
      const denseLayer = this.denseLayers[i];
      a = denseLayer.forward(a.toArray());
    }
    return a;
  }
  backward(y) {
    const output = this.lastDenseLayer();
    const Y = Vector.from(y);
    let delta;
    if (this.loss instanceof SoftmaxCrossEntropy) {
      delta = this.loss.fusedGradient(Y);
    } else {
      const Predicted = output.a;
      const lossGrad = this.loss.gradient(Y, Predicted);
      delta = Vector.mulVectors(lossGrad, output.activation.derivative(output.z, output.a));
    }
    for (let i = this.denseLayers.length - 1; i >= 0; i--) {
      const denseLayer = this.denseLayers[i];
      const prevLayer = this.denseLayers[i - 1];
      const dA = denseLayer.backward(delta);
      if (i > 0) {
        delta = Vector.mulVectors(
          dA,
          prevLayer.activation.derivative(prevLayer.a, prevLayer.z)
        );
      } else delta = dA;
    }
    return delta;
  }
  update(lr) {
    for (let i = 0; i < this.denseLayers.length; i++) {
      const denseLayer = this.denseLayers[i];
      denseLayer.updateWeights(lr);
    }
  }
  applyBatchGradients(batchSize, learningRate) {
    for (const layer of this.denseLayers) {
      layer.dW = Matrix.multiplyScalar(layer.dW, 1 / batchSize);
      layer.dB = Vector.from(layer.dB.toArray().map((b) => b / batchSize));
      layer.updateWeights(learningRate);
    }
  }
  lastDenseLayer() {
    return this.denseLayers[this.denseLayers.length - 1];
  }
  getWeights() {
    return this.denseLayers.map((layer, index) => ({
      layerIndex: index,
      weights: layer.getWeight(),
      biases: layer.getBias()
    }));
  }
  setWeights(savedLayers) {
    savedLayers.forEach((savedLayer, index) => {
      this.denseLayers[index].setWeight(savedLayer.weights);
      this.denseLayers[index].setBias(savedLayer.biases);
    });
  }
};

// src/models/neural/dense/DenseLayer.ts
var DenseLayer = class {
  // L2 Regularization
  constructor(inputSize, outputSize, actEnum) {
    this.inputSize = inputSize;
    this.outputSize = outputSize;
    this.actEnum = actEnum;
    this.activation = ActivationUse[actEnum];
    this.weight = this.initializeWeights(
      outputSize,
      inputSize,
      this.activation
    );
    this.dW = Matrix.zeros(outputSize, inputSize);
    this.bias = Vector.zeros(outputSize);
    this.dB = Vector.zeros(outputSize);
  }
  inputSize;
  outputSize;
  actEnum;
  weight;
  // W (out × in)
  bias;
  // b (out)
  dW;
  dB;
  input;
  z;
  // pre-activation
  a;
  // activation
  activation;
  l1;
  // L1 Regularization
  l2;
  forward(input) {
    let a = Vector.from(input);
    const z = Matrix.matrixMulVector(this.weight, a);
    const zWithBias = Vector.addVectors(z, this.bias);
    this.z = zWithBias;
    this.input = a;
    this.a = this.activation.forward(zWithBias);
    a = this.a;
    return a;
  }
  backward(delta) {
    this.dB = Vector.addVectors(Vector.from(delta.toArray()), this.dB);
    this.dW = Matrix.add(this.dW, Matrix.outerProduct(delta, this.input));
    const WT = transpose(this.weight);
    return Matrix.matrixMulVector(WT, delta);
  }
  updateWeights(learningRate) {
    this.weight = Matrix.sub(this.weight, Matrix.multiplyScalar(this.dW, learningRate));
    this.dW = Matrix.zeros(this.dW.rows, this.dW.columns);
    this.bias = Vector.subVectors(this.bias, Vector.multiplyScalar(this.dB, learningRate));
    this.dB = Vector.zeros(this.dB.length);
  }
  initializeWeights(outputs, inputs, activation) {
    const std = activation.initializer(inputs);
    const W = Matrix.zeros(outputs, inputs);
    for (let r = 0; r < outputs; r++) {
      for (let c = 0; c < inputs; c++) {
        const u1 = Math.random() || 1e-10;
        const u2 = Math.random();
        const norm = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        W.set(r, c, norm * std);
      }
    }
    return W;
  }
  getWeight() {
    return this.weight.toNestedArray();
  }
  getBias() {
    return this.bias.toArray();
  }
  setWeight(weights) {
    this.weight = Matrix.from(weights);
  }
  setBias(bias) {
    this.bias = Vector.from(bias);
  }
};

// src/api/Sequential.ts
var SequentialModel = class {
  pipeline = [];
  constructor(rawData) {
    this.loadAndBuildModel(rawData);
  }
  loadAndBuildModel(rawData) {
    const { architecture, weights } = rawData;
    architecture.forEach((layerConf) => {
      switch (layerConf.type) {
        case "Convo2D":
          const convo2DFilters = new Array(layerConf.filters).fill(Matrix.random(layerConf.kernelSize, layerConf.kernelSize));
          const convLayer = new Convo2D(convo2DFilters, layerConf.stride);
          convLayer.setInputRowsAndColumns(layerConf.input.rows, layerConf.input.columns);
          convLayer.setWeights(weights.convWeights, layerConf.kernelSize);
          this.pipeline.push(convLayer);
          break;
        case "ReLU2D":
          this.pipeline.push(new ReLU2D());
          break;
        case "MaxPooling2D":
          const poolMap = Matrix.fromArray(new Array(layerConf.poolSize * layerConf.poolSize).fill(1), layerConf.poolSize, layerConf.poolSize);
          const maxPooling2DFilters = new Array(layerConf.filters).fill(poolMap);
          this.pipeline.push(new MaxPooling2D(maxPooling2DFilters, layerConf.stride));
          break;
        case "Flatten":
          this.pipeline.push(new Flatten());
          break;
        case "Dense":
          const denseLayers = layerConf.layers.map((dLayer) => {
            return new DenseLayer(dLayer.inputSize, dLayer.outputSize, dLayer.activation);
          });
          const denseNet = new NeuralNetworkDense(denseLayers, SoftmaxCE);
          denseNet.setWeights(weights.denseWeights);
          this.pipeline.push(denseNet);
          break;
        default:
          throw new Error(`Unknown layer type in config: ${layerConf.type}`);
      }
    });
    console.log(`Successfully built model with ${this.pipeline.length} layers dynamic pipeline.`);
  }
  predict(inputData) {
    let currentOutput = inputData;
    for (const layer of this.pipeline) {
      if (layer instanceof NeuralNetworkDense) {
        currentOutput = layer.forward(currentOutput?.toArray ? currentOutput.toArray() : currentOutput);
      } else {
        if (layer instanceof Convo2D) {
          const { rows, columns } = layer.getInputRowsColumns();
          currentOutput = Matrix.fromArray(currentOutput, rows, columns);
        }
        currentOutput = layer.forward(currentOutput);
      }
    }
    return currentOutput.toArray();
  }
};
export {
  core_exports as Core,
  ModelInferenceEngine,
  models_exports as Models,
  SequentialModel
};
