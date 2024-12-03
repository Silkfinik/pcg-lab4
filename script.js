const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const algorithmSelect = document.getElementById("algorithm");
const x0Input = document.getElementById("x0");
const y0Input = document.getElementById("y0");
const x1Input = document.getElementById("x1");
const y1Input = document.getElementById("y1");
const scaleInput = document.getElementById("scale");
const drawButton = document.getElementById("draw");

const timeDisplay = document.getElementById("time");
const stepsDisplay = document.getElementById("steps");
const exampleDisplay = document.getElementById("example");
const descriptionDisplay = document.getElementById("algorithm-description");

const radiusGroup = document.getElementById("radius-group");
const radiusInput = document.getElementById("radius");

const algorithmDescriptions = {
  step: `
<strong>Пошаговый алгоритм (используя y = ax + b):</strong>

Этот алгоритм рисует линию, используя уравнение прямой y = ax + b. Он вычисляет коэффициенты a (наклон) и b (смещение) на основе начальной и конечной точек, затем проходит по каждому целочисленному значению x от x0 до x1, вычисляет соответствующее y, округляет его до ближайшего целого числа и рисует пиксель в полученных координатах.

<strong>Шаги:</strong>
1. Вычисляются разницы по X (dx) и по Y (dy).
2. Если dx равно 0, линия вертикальная:
   - Проходится по всем значениям y от y0 до y1 с шагом направления.
   - Рисуется пиксель с фиксированным x0 и текущим y.
3. Если dx не равно 0:
   - Вычисляется наклон a = dy / dx.
   - Вычисляется смещение b = y0 - a * x0.
   - Определяется направление шага по x (stepDirection), чтобы корректно обрабатывать линии слева направо или справа налево.
   - Для каждого целого значения x от x0 до x1:
     - Вычисляется y = a * x + b.
     - Округляется значение y до ближайшего целого числа roundedY.
     - Рисуется пиксель в координатах (x, roundedY).
    `,
  dda: `
<strong>Алгоритм ЦДА (Digital Differential Analyzer):</strong>

Алгоритм ЦДА строит линию, используя разностный подход. Он аналогичен пошаговому алгоритму, но более систематизирован в вычислениях.

<strong>Шаги:</strong>
1. Вычисляется разница по X (dx) и по Y (dy).
2. Определяется количество шагов (steps) как максимальное значение из |dx| и |dy|.
3. Вычисляются инкременты x_inc = dx / steps и y_inc = dy / steps.
4. Инициализируются текущие координаты (x, y) = (x0, y0).
5. На каждом шаге:
   - Рисуется пиксель в округленных координатах (Math.round(x), Math.round(y)).
   - Обновляются координаты: x += x_inc, y += y_inc.
    `,
  bresenham: `
<strong>Алгоритм Брезенхема (линия):</strong>

Этот алгоритм является эффективным методом построения линий без использования вещественных чисел. Он основывается на выборе пикселя, который наиболее близок к идеальной линии на каждом шаге.

<strong>Шаги:</strong>
1. Вычисляются абсолютные значения разниц по X (dx) и по Y (dy).
2. Определяются направления движения по X (sx) и по Y (sy).
3. Инициализируется ошибка (err) = dx - dy.
4. На каждом шаге:
   - Рисуется пиксель в текущих координатах (x0, y0).
   - Если текущие координаты совпадают с конечными, алгоритм завершается.
   - Вычисляется временная переменная e2 = 2 * err.
   - Если e2 > -dy, обновляется ошибка: err -= dy и x0 += sx.
   - Если e2 < dx, обновляется ошибка: err += dx и y0 += sy.
    `,
  bresenham_circle: `
<strong>Алгоритм Брезенхема (окружность):</strong>

Этот алгоритм используется для построения окружностей. Он эффективно вычисляет пиксели, составляющие окружность, используя симметрию и избегая операций с плавающей запятой.

<strong>Шаги:</strong>
1. Инициализируются координаты (x, y) = (0, radius).
2. Вычисляется начальное значение d = 3 - 2 * radius.
3. На каждом шаге:
   - Рисуются 8 симметричных пикселей относительно центра окружности.
   - Если d < 0:
       - d += 4 * x + 6
   - Иначе:
       - d += 4 * (x - y) + 10
       - y -= 1
   - x += 1
4. Алгоритм завершается, когда x > y.
    `,
};

function toggleRadiusField() {
  const selectedAlgorithm = algorithmSelect.value;
  if (selectedAlgorithm === "bresenham_circle") {
    radiusGroup.style.display = "flex";
    radiusGroup.classList.remove("hidden");
    radiusGroup.classList.add("visible");
  } else {
    radiusGroup.style.display = "none";
    radiusGroup.classList.remove("visible");
    radiusGroup.classList.add("hidden");
  }
}

algorithmSelect.addEventListener("change", () => {
  const selectedAlgorithm = algorithmSelect.value;
  descriptionDisplay.innerHTML =
    algorithmDescriptions[selectedAlgorithm] ||
    "Выберите алгоритм для просмотра его описания.";
  toggleRadiusField();
});

window.addEventListener("load", () => {
  const selectedAlgorithm = algorithmSelect.value;
  descriptionDisplay.innerHTML =
    algorithmDescriptions[selectedAlgorithm] ||
    "Выберите алгоритм для просмотра его описания.";
  toggleRadiusField();
});

drawButton.addEventListener("click", draw);

async function draw() {
  console.log('Нажата кнопка "Нарисовать"');
  const x0 = parseInt(x0Input.value);
  const y0 = parseInt(y0Input.value);
  const x1 = parseInt(x1Input.value);
  const y1 = parseInt(y1Input.value);
  const scale = parseInt(scaleInput.value);
  const algorithm = algorithmSelect.value;
  const radius = parseInt(radiusInput.value);

  console.log(`Выбран алгоритм: ${algorithm}`);
  console.log(`Начальные координаты: (${x0}, ${y0})`);
  if (algorithm !== "bresenham_circle") {
    console.log(`Конечные координаты: (${x1}, ${y1})`);
  } else {
    console.log(`Радиус: ${radius}`);
  }
  console.log(`Масштаб: ${scale}`);

  if (isNaN(x0) || isNaN(y0) || isNaN(scale)) {
    alert(
      "Пожалуйста, введите корректные числовые значения для координат и масштаба."
    );
    return;
  }

  if (algorithm === "bresenham_circle" && (isNaN(radius) || radius <= 0)) {
    alert(
      "Пожалуйста, введите корректное значение радиуса (положительное число)."
    );
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid(scale);
  drawAxes(scale);

  let steps = 0;
  let calculationSteps = "";
  let pixels = [];
  const startTime = performance.now();

  switch (algorithm) {
    case "step":
      ({ steps, calculationSteps, pixels } = generateStepLine(
        x0,
        y0,
        x1,
        y1,
        scale
      ));
      break;
    case "dda":
      ({ steps, calculationSteps, pixels } = generateDDALine(
        x0,
        y0,
        x1,
        y1,
        scale
      ));
      break;
    case "bresenham":
      ({ steps, calculationSteps, pixels } = generateBresenhamLine(
        x0,
        y0,
        x1,
        y1,
        scale
      ));
      break;
    case "bresenham_circle":
      ({ steps, calculationSteps, pixels } = generateBresenhamCircle(
        x0,
        y0,
        radius,
        scale
      ));
      break;
    default:
      alert("Выбран неизвестный алгоритм.");
      return;
  }

  const endTime = performance.now();
  const timeTaken = endTime - startTime;

  timeDisplay.textContent = `Время выполнения: ${timeTaken.toFixed(4)} мс`;
  stepsDisplay.textContent = `Количество шагов: ${steps}`;
  exampleDisplay.textContent = calculationSteps;

  const connectLines = algorithm !== "bresenham_circle";

  await animateDrawing(pixels, connectLines);
}

function drawGrid(scale) {
  console.log("Рисование сетки");
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += scale) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += scale) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawAxes(scale) {
  console.log("Рисование осей координат");
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  ctx.fillStyle = "#000";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const maxX = Math.floor(canvas.width / (2 * scale));
  const maxY = Math.floor(canvas.height / (2 * scale));

  for (let x = -maxX; x <= maxX; x++) {
    if (x === 0) continue;
    const posX = canvas.width / 2 + x * scale;
    const posY = canvas.height / 2;
    ctx.fillText(x, posX, posY + 15);
  }

  for (let y = -maxY; y <= maxY; y++) {
    if (y === 0) continue;
    const posX = canvas.width / 2;
    const posY = canvas.height / 2 - y * scale;
    ctx.fillText(y, posX + 15, posY);
  }
}

function drawPoint(x, y, scale, color = "#f00") {
  const pixelX = Math.round(canvas.width / 2 + x * scale);
  const pixelY = Math.round(canvas.height / 2 - y * scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pixelX, pixelY, scale / 4, 0, 2 * Math.PI);
  ctx.fill();
}

function animateDrawing(pixels, connectLines) {
  return new Promise((resolve) => {
    let index = 0;
    const total = pixels.length;
    const delay = 50;

    let prevPixel = null;

    function drawNext() {
      if (index < total) {
        const { x, y, color } = pixels[index];
        drawPoint(x, y, parseInt(scaleInput.value), color);

        if (connectLines && prevPixel) {
          ctx.strokeStyle = color;
          ctx.lineWidth = parseInt(scaleInput.value) / 4;
          ctx.beginPath();
          ctx.moveTo(
            canvas.width / 2 + prevPixel.x * parseInt(scaleInput.value),
            canvas.height / 2 - prevPixel.y * parseInt(scaleInput.value)
          );
          ctx.lineTo(
            canvas.width / 2 + x * parseInt(scaleInput.value),
            canvas.height / 2 - y * parseInt(scaleInput.value)
          );
          ctx.stroke();
        }

        prevPixel = { x, y };
        index++;
        setTimeout(drawNext, delay);
      } else {
        console.log("Анимация завершена");
        resolve();
      }
    }

    drawNext();
  });
}
function generateStepLineEquation(x0, y0, x1, y1, scale) {
  console.log("Генерация StepLine с использованием y = ax + b");

  const dx = x1 - x0;
  const dy = y1 - y0;

  if (dx === 0) {
    let stepCount = Math.abs(dy) + 1;
    let calculationSteps = `Пошаговый алгоритм (вертикальная линия):\n`;
    calculationSteps += `dx = ${dx}\n`;
    calculationSteps += `dy = ${dy}\n`;
    calculationSteps += `Линия вертикальная (dx = 0).\n`;
    calculationSteps += `Итерации:\n`;

    let pixels = [];
    const stepDirection = dy > 0 ? 1 : -1;
    for (let y = y0; y !== y1 + stepDirection; y += stepDirection) {
      pixels.push({ x: x0, y: y, color: "#ff1493" });
      calculationSteps += `Шаг ${pixels.length - 1}: x = ${x0}, y = ${y}\n`;
    }

    return { steps: pixels.length - 1, calculationSteps, pixels };
  }

  const a = dy / dx;
  const b = y0 - a * x0;

  console.log(`Вычисленные коэффициенты: a = ${a}, b = ${b}`);

  const stepDirection = dx > 0 ? 1 : -1;
  const steps = Math.abs(dx) + 1;

  let calculationSteps = `Пошаговый алгоритм (используя y = ax + b):\n`;
  calculationSteps += `dx = ${dx}\n`;
  calculationSteps += `dy = ${dy}\n`;
  calculationSteps += `a = dy / dx = ${a}\n`;
  calculationSteps += `b = y0 - a * x0 = ${b}\n`;
  calculationSteps += `steps = |dx| + 1 = ${steps}\n\n`;
  calculationSteps += `Итерации:\n`;

  let pixels = [];
  let stepCount = 0;

  for (let i = 0; i < steps; i++) {
    const currentX = x0 + i * stepDirection;
    const currentY = a * currentX + b;
    const roundedY = Math.round(currentY);

    pixels.push({ x: currentX, y: roundedY, color: "#ff1493" });
    calculationSteps += `Шаг ${stepCount}: x = ${currentX}, y = a * x + b = ${a} * ${currentX} + ${b} = ${currentY} → округлено до y = ${roundedY}\n`;
    stepCount++;
  }

  return { steps: stepCount, calculationSteps, pixels };
}

function generateStepLine(x0, y0, x1, y1) {
  return generateStepLineEquation(x0, y0, x1, y1);
}

function generateDDALine(x0, y0, x1, y1) {
  const dx = x1 - x0;
  const dy = y1 - y0;

  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  const xInc = dx / steps;
  const yInc = dy / steps;

  let x = x0;
  let y = y0;
  let stepCount = 0;
  let calculationSteps = `Алгоритм ЦДА:\n`;
  calculationSteps += `dx = ${dx}\n`;
  calculationSteps += `dy = ${dy}\n`;
  calculationSteps += `steps = max(|${dx}|, |${dy}|) = ${steps}\n`;
  calculationSteps += `x_inc = ${dx} / ${steps} = ${xInc}\n`;
  calculationSteps += `y_inc = ${dy} / ${steps} = ${yInc}\n\n`;
  calculationSteps += `Итерации:\n`;

  let pixels = [];

  for (let i = 0; i <= steps; i++) {
    const currentX = Math.round(x);
    const currentY = Math.round(y);
    pixels.push({ x: currentX, y: currentY, color: "#007bff" });
    calculationSteps += `Шаг ${i}: x = ${currentX}, y = ${currentY}\n`;
    x += xInc;
    y += yInc;
    stepCount++;
  }

  return { steps: stepCount, calculationSteps, pixels };
}

function generateBresenhamLine(x0, y0, x1, y1) {
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let stepCount = 0;
  let calculationSteps = `Алгоритм Брезенхема (линия):\n`;
  calculationSteps += `dx = |${x1} - ${x0}| = ${dx}\n`;
  calculationSteps += `dy = |${y1} - ${y0}| = ${dy}\n`;
  calculationSteps += `sx = ${sx}, sy = ${sy}\n`;
  calculationSteps += `err = ${dx} - ${dy} = ${err}\n\n`;
  calculationSteps += `Итерации:\n`;

  let pixels = [];

  while (true) {
    pixels.push({ x: x0, y: y0, color: "#28a745" });
    calculationSteps += `Шаг ${stepCount}: x = ${x0}, y = ${y0}\n`;
    stepCount++;

    if (x0 === x1 && y0 === y1) break;
    let e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }

  return { steps: stepCount, calculationSteps, pixels };
}

function generateBresenhamCircle(x0, y0, radius) {
  let x = 0;
  let y = radius;
  let d = 3 - 2 * radius;
  let stepCount = 0;
  let calculationSteps = `Алгоритм Брезенхема (окружность):\n`;
  calculationSteps += `Начальное значение: x = ${x}, y = ${y}\n`;
  calculationSteps += `d = 3 - 2 * radius = ${d}\n\n`;
  calculationSteps += `Итерации:\n`;

  let pixels = [];

  while (x <= y) {
    const circlePoints = [
      { x: x0 + x, y: y0 + y, color: "#ffc107" },
      { x: x0 - x, y: y0 + y, color: "#ffc107" },
      { x: x0 + x, y: y0 - y, color: "#ffc107" },
      { x: x0 - x, y: y0 - y, color: "#ffc107" },
      { x: x0 + y, y: y0 + x, color: "#ffc107" },
      { x: x0 - y, y: y0 + x, color: "#ffc107" },
      { x: x0 + y, y: y0 - x, color: "#ffc107" },
      { x: x0 - y, y: y0 - x, color: "#ffc107" },
    ];

    pixels.push(...circlePoints);
    calculationSteps += `Шаг ${stepCount}: x = ${x}, y = ${y}\n`;
    stepCount += 8;

    if (d < 0) {
      d += 4 * x + 6;
    } else {
      d += 4 * (x - y) + 10;
      y -= 1;
    }
    x += 1;
  }

  return { steps: stepCount, calculationSteps, pixels };
}
