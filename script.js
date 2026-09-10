const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const names = {
  dashboard: "Dashboard",
  calculator: "Calculator",
  scientific: "Scientific",
  finance: "Finance Tools",
  converter: "Converters",
  math: "Math Tools",
  date: "Date & Age",
  history: "History",
  settings: "Settings",
  about: "About"
};

function show(id) {
  $$(".page").forEach(x => x.classList.toggle("active", x.id === id));
  $$(".nav").forEach(x => x.classList.toggle("active", x.dataset.page === id));

  if ($("#title")) $("#title").textContent = names[id] || id;

  if ($("#sidebar")) $("#sidebar").classList.remove("open");

  if (id === "history") renderHistory();
}

$$(".nav").forEach(x => {
  x.onclick = () => show(x.dataset.page);
});

if ($("#menu")) {
  $("#menu").onclick = () => $("#sidebar").classList.toggle("open");
}

function save(key, value) {
  localStorage.setItem(key, value);
}

/* ================= THEME ================= */

if ($("#theme")) {
  $("#theme").onclick = () => {
    document.body.classList.toggle("light");

    const mode = document.body.classList.contains("light")
      ? "light"
      : "dark";

    save("theme", mode);

    if ($("#themeSelect")) {
      $("#themeSelect").value = mode;
    }
  };
}

if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light");
}

/* ================= DASHBOARD ================= */

const tools = [
  ["＋", "Basic Calculator", "Fast arithmetic, memory and keyboard support.", "calculator"],
  ["∑", "Scientific", "Trig, logs, powers, factorial and constants.", "scientific"],
  ["₹", "Finance", "EMI, SIP, GST, interest, discount and profit.", "finance"],
  ["⇄", "Converters", "Length, weight, temperature, data and more.", "converter"],
  ["√", "Math Tools", "HCF, LCM, fractions, primes and equations.", "math"],
  ["◷", "Date & Age", "Age and date difference utilities.", "date"]
];

if ($("#quickTools")) {
  $("#quickTools").innerHTML = tools.map(t => `
    <article class="tool-card" onclick="show('${t[3]}')">
      <div class="ico">${t[0]}</div>
      <h3>${t[1]}</h3>
      <p>${t[2]}</p>
      <b>Open tool →</b>
    </article>
  `).join("");
}

/* ================= BASIC CALCULATOR ================= */

let expr = "";
let memory = 0;

let history = JSON.parse(
  localStorage.getItem("history") || "[]"
);

let precision = Number(
  localStorage.getItem("precision") || 8
);

function fmt(n) {
  if (!Number.isFinite(n)) return "Error";

  return Number(
    n.toPrecision(precision)
  ).toString();
}

/*
  Safe basic arithmetic evaluator.
  Supports:
  + - * / % ( )
*/
function evaluate(s) {

  if (!s || typeof s !== "string") {
    throw new Error("Empty expression");
  }

  // Only allow calculator characters
  if (!/^[0-9+\-*/().%\s]+$/.test(s)) {
    throw new Error("Invalid characters");
  }

  // Convert percentage
  s = s.replace(
    /(\d+(?:\.\d+)?)%/g,
    "($1/100)"
  );

  return Function(
    '"use strict"; return (' + s + ')'
  )();
}

function addHist(e, r) {

  history.unshift({
    e: e,
    r: r,
    t: new Date().toLocaleString()
  });

  history = history.slice(0, 100);

  localStorage.setItem(
    "history",
    JSON.stringify(history)
  );

  renderMini();
}

function calc() {

  if (!expr) return;

  try {

    const result = fmt(
      evaluate(expr)
    );

    if ($("#calcExpr")) {
      $("#calcExpr").textContent = expr;
    }

    if ($("#calcOut")) {
      $("#calcOut").textContent = result;
    }

    addHist(expr, result);

  } catch (error) {

    if ($("#calcOut")) {
      $("#calcOut").textContent = "Error";
    }
  }
}

/* Calculator buttons */

$$(".keys button").forEach(button => {

  button.onclick = () => {

    const value = button.dataset.v;
    const action = button.dataset.a;

    if (action === "clear") {

      expr = "";

      if ($("#calcExpr"))
        $("#calcExpr").textContent = "";

      if ($("#calcOut"))
        $("#calcOut").textContent = "0";

      return;
    }

    if (action === "back") {

      expr = expr.slice(0, -1);

      if ($("#calcExpr"))
        $("#calcExpr").textContent = expr;

      if ($("#calcOut"))
        $("#calcOut").textContent = expr || "0";

      return;
    }

    if (action === "equal") {
      calc();
      return;
    }

    if (value) {

      expr += value;

      if ($("#calcExpr"))
        $("#calcExpr").textContent = expr;

    }
  };

});

/* Keyboard support */

document.addEventListener("keydown", e => {

  if (!$("#calculator")) return;

  if (!$("#calculator").classList.contains("active")) {
    return;
  }

  if (/^[0-9+\-*/().%]$/.test(e.key)) {

    expr += e.key;

    if ($("#calcExpr"))
      $("#calcExpr").textContent = expr;
  }

  if (e.key === "Enter") {
    e.preventDefault();
    calc();
  }

  if (e.key === "Backspace") {

    expr = expr.slice(0, -1);

    if ($("#calcExpr"))
      $("#calcExpr").textContent = expr;
  }

  if (e.key === "Escape") {

    expr = "";

    if ($("#calcExpr"))
      $("#calcExpr").textContent = "";

    if ($("#calcOut"))
      $("#calcOut").textContent = "0";
  }

});

/* ================= MEMORY ================= */

$$("[data-m]").forEach(button => {

  button.onclick = () => {

    const action = button.dataset.m;

    if (action === "MC") {
      memory = 0;
    }

    if (action === "MR") {

      expr += String(memory);

      if ($("#calcExpr"))
        $("#calcExpr").textContent = expr;
    }

    if (action === "M+") {

      const value =
        Number($("#calcOut")?.textContent) || 0;

      memory += value;
    }

    if (action === "M-") {

      const value =
        Number($("#calcOut")?.textContent) || 0;

      memory -= value;
    }

    toast("Memory " + action);
  };

});

/* ================= HISTORY ================= */

function renderMini() {

  if (!$("#miniHistory")) return;

  $("#miniHistory").innerHTML =
    history
      .slice(0, 8)
      .map(x => `
        <div class="recent-row">
          <small>${x.t} · ${x.e}</small>
          <b>= ${x.r}</b>
        </div>
      `)
      .join("") ||
    "<p class='hint'>No calculations yet.</p>";
}

function renderHistory() {

  if (!$("#historyList")) return;

  $("#historyList").innerHTML =
    history
      .map(x => `
        <div class="history-row">
          <div>
            <small>${x.t}</small>
            <div>${x.e}</div>
          </div>
          <b>${x.r}</b>
        </div>
      `)
      .join("") ||
    "<p class='hint'>No history.</p>";
}

function clearHistory() {

  history = [];

  localStorage.removeItem("history");

  renderMini();
  renderHistory();

  toast("History cleared");
}

/* ================= SCIENTIFIC ================= */

const sci = [
  ["sin", "sin"],
  ["cos", "cos"],
  ["tan", "tan"],
  ["√", "sqrt"],
  ["log", "log"],
  ["ln", "ln"],
  ["x²", "square"],
  ["x³", "cube"],
  ["π", "pi"],
  ["e", "e"],
  ["abs", "abs"],
  ["n!", "fact"]
];

if ($("#sciButtons")) {

  $("#sciButtons").innerHTML =
    sci.map(x => `
      <button data-s="${x[1]}">
        ${x[0]}
      </button>
    `).join("");
}

let sciMode = "sqrt";

$$("[data-s]").forEach(button => {

  button.onclick = () => {

    sciMode = button.dataset.s;

    $$("[data-s]").forEach(x => {
      x.style.outline = "";
    });

    button.style.outline =
      "2px solid #8b5cf6";

    if (
      sciMode === "pi" ||
      sciMode === "e"
    ) {

      const result =
        sciMode === "pi"
          ? Math.PI
          : Math.E;

      if ($("#sciExpr"))
        $("#sciExpr").textContent = sciMode;

      if ($("#sciOut"))
        $("#sciOut").textContent = fmt(result);
    }
  };

});

if ($("#sciGo")) {

  $("#sciGo").onclick = () => {

    const x =
      Number($("#sciInput")?.value);

    let result;

    const angle =
      $("#angle")?.value || "Radians";

    const rad =
      angle === "Radians"
        ? x
        : x * Math.PI / 180;

    switch (sciMode) {

      case "sin":
        result = Math.sin(rad);
        break;

      case "cos":
        result = Math.cos(rad);
        break;

      case "tan":
        result = Math.tan(rad);
        break;

      case "sqrt":
        result = Math.sqrt(x);
        break;

      case "log":
        result = Math.log10(x);
        break;

      case "ln":
        result = Math.log(x);
        break;

      case "square":
        result = x * x;
        break;

      case "cube":
        result = x * x * x;
        break;

      case "abs":
        result = Math.abs(x);
        break;

      case "fact":

        if (
          x < 0 ||
          !Number.isInteger(x) ||
          x > 170
        ) {
          result = NaN;
        } else {

          result = 1;

          for (let i = 2; i <= x; i++) {
            result *= i;
          }
        }

        break;

      case "pi":
        result = Math.PI;
        break;

      case "e":
        result = Math.E;
        break;

      default:
        result = NaN;
    }

    const formatted = fmt(result);

    if ($("#sciExpr"))
      $("#sciExpr").textContent =
        `${sciMode}(${x})`;

    if ($("#sciOut"))
      $("#sciOut").textContent =
        formatted;

    addHist(
      `${sciMode}(${x})`,
      formatted
    );
  };
}

/* ================= COMMON HELPERS ================= */

function num(id) {

  const element = $(id);

  if (!element) return 0;

  const value = Number(element.value);

  return Number.isFinite(value)
    ? value
    : 0;
}

function out(id, text) {

  const element = $(id);

  if (element) {
    element.textContent = text;
  }
}

/* ================= FINANCE ================= */

function simpleInterest() {

  const p = num("#siP");
  const r = num("#siR");
  const t = num("#siT");

  const interest =
    p * r * t / 100;

  out(
    "#siO",
    `Interest: ₹${fmt(interest)} · Total: ₹${fmt(p + interest)}`
  );
}

function compoundInterest() {

  const p = num("#ciP");
  const r = num("#ciR") / 100;
  const t = num("#ciT");
  const n = num("#ciN") || 12;

  const amount =
    p * Math.pow(
      1 + r / n,
      n * t
    );

  out(
    "#ciO",
    `Amount: ₹${fmt(amount)} · Interest: ₹${fmt(amount - p)}`
  );
}

function emi() {

  const p = num("#emiP");
  const r = num("#emiR") / 1200;
  const years = num("#emiT");

  const months = years * 12;

  if (months <= 0) {
    out("#emiO", "Enter valid time");
    return;
  }

  let monthly;

  if (r === 0) {

    monthly = p / months;

  } else {

    monthly =
      p *
      r *
      Math.pow(1 + r, months) /
      (Math.pow(1 + r, months) - 1);
  }

  out(
    "#emiO",
    `Monthly EMI: ₹${fmt(monthly)} · Total: ₹${fmt(monthly * months)}`
  );
}

function gst() {

  const price = num("#gstP");
  const rate = num("#gstR");

  const tax =
    price * rate / 100;

  out(
    "#gstO",
    `GST: ₹${fmt(tax)} · Total: ₹${fmt(price + tax)}`
  );
}

function discount() {

  const price = num("#disP");
  const rate = num("#disR");

  const discountAmount =
    price * rate / 100;

  out(
    "#disO",
    `Discount: ₹${fmt(discountAmount)} · Final: ₹${fmt(price - discountAmount)}`
  );
}

function profit() {

  const cost = num("#plC");
  const selling = num("#plS");

  if (cost === 0) {
    out("#plO", "Cost price cannot be 0");
    return;
  }

  const difference =
    selling - cost;

  const percentage =
    Math.abs(difference) /
    cost * 100;

  if (difference >= 0) {

    out(
      "#plO",
      `Profit: ₹${fmt(difference)} (${fmt(percentage)}%)`
    );

  } else {

    out(
      "#plO",
      `Loss: ₹${fmt(-difference)} (${fmt(percentage)}%)`
    );
  }
}

function sip() {

  const monthly = num("#sipP");
  const annualRate = num("#sipR");
  const years = num("#sipT");

  const rate =
    annualRate / 1200;

  const months =
    years * 12;

  let amount;

  if (rate === 0) {

    amount =
      monthly * months;

  } else {

    amount =
      monthly *
      (
        (Math.pow(1 + rate, months) - 1) /
        rate
      ) *
      (1 + rate);
  }

  out(
    "#sipO",
    `Estimated value: ₹${fmt(amount)} · Invested: ₹${fmt(monthly * months)}`
  );
}

function percentage() {

  const a = num("#pctA");
  const b = num("#pctB");

  out(
    "#pctO",
    fmt(a * b / 100)
  );
}

/* ================= MATH ================= */

function gcd(a, b) {

  a = Math.abs(Math.trunc(a));
  b = Math.abs(Math.trunc(b));

  while (b !== 0) {

    const temp = b;

    b = a % b;
    a = temp;
  }

  return a;
}

function hcfLcm() {

  const a = num("#hA");
  const b = num("#hB");

  const g = gcd(a, b);

  const l =
    a !== 0 && b !== 0
      ? Math.abs(a * b) / g
      : 0;

  out(
    "#hO",
    `HCF: ${g} · LCM: ${l}`
  );
}

function average() {

  const element = $("#avg");

  if (!element) return;

  const numbers =
    element.value
      .split(",")
      .map(Number)
      .filter(Number.isFinite);

  if (!numbers.length) {

    out(
      "#avgO",
      "Enter comma-separated numbers"
    );

    return;
  }

  const total =
    numbers.reduce(
      (sum, value) => sum + value,
      0
    );

  out(
    "#avgO",
    `Average: ${fmt(total / numbers.length)}`
  );
}

function quadratic() {

  const a = num("#qa");
  const b = num("#qb");
  const c = num("#qc");

  if (a === 0) {

    out(
      "#qO",
      "a cannot be 0"
    );

    return;
  }

  const discriminant =
    b * b - 4 * a * c;

  if (discriminant < 0) {

    out(
      "#qO",
      "No real roots"
    );

    return;
  }

  const sqrtD =
    Math.sqrt(discriminant);

  const x1 =
    (-b + sqrtD) / (2 * a);

  const x2 =
    (-b - sqrtD) / (2 * a);

  out(
    "#qO",
    `x₁ = ${fmt(x1)} · x₂ = ${fmt(x2)}`
  );
}

function isPrime() {

  const n =
    Math.floor(num("#prime"));

  if (n < 2) {

    out(
      "#primeO",
      `${n} is not prime`
    );

    return;
  }

  let prime = true;

  for (
    let i = 2;
    i * i <= n;
    i++
  ) {

    if (n % i === 0) {

      prime = false;
      break;
    }
  }

  out(
    "#primeO",
    prime
      ? `${n} is prime`
      : `${n} is not prime`
  );
}

/* ================= FRACTION ================= */

function parseFrac(value) {

  const parts =
    String(value)
      .trim()
      .split("/");

  if (parts.length !== 2) {
    throw new Error("Invalid fraction");
  }

  const numerator =
    Number(parts[0]);

  const denominator =
    Number(parts[1]);

  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    denominator === 0
  ) {
    throw new Error("Invalid fraction");
  }

  return [
    numerator,
    denominator
  ];
}

function fraction() {

  try {

    const [a, b] =
      parseFrac($("#f1").value);

    const [c, d] =
      parseFrac($("#f2").value);

    const operation =
      $("#fop").value;

    let numerator;
    let denominator;

    switch (operation) {

      case "+":

        numerator =
          a * d + c * b;

        denominator =
          b * d;

        break;

      case "−":
      case "-":

        numerator =
          a * d - c * b;

        denominator =
          b * d;

        break;

      case "×":
      case "*":

        numerator =
          a * c;

        denominator =
          b * d;

        break;

      case "÷":
      case "/":

        if (c === 0) {
          throw new Error("Division by zero");
        }

        numerator =
          a * d;

        denominator =
          b * c;

        break;

      default:

        throw new Error("Invalid operation");
    }

    if (denominator < 0) {

      numerator *= -1;
      denominator *= -1;
    }

    const g =
      gcd(numerator, denominator);

    out(
      "#fO",
      `${numerator / g}/${denominator / g}`
    );

  } catch (error) {

    out(
      "#fO",
      "Use format a/b"
    );
  }
}

/* ================= CONVERTER ================= */

const data = {

  Length: {
    m: 1,
    cm: 0.01,
    km: 1000,
    mi: 1609.344,
    ft: 0.3048,
    in: 0.0254
  },

  Weight: {
    g: 1,
    kg: 1000,
    lb: 453.59237,
    oz: 28.3495
  },

  Area: {
    "m²": 1,
    "km²": 1000000,
    "ft²": 0.092903,
    acre: 4046.856
  },

  Speed: {
    "m/s": 1,
    "km/h": 1 / 3.6,
    mph: 0.44704
  },

  Volume: {
    L: 1,
    mL: 0.001,
    "m³": 1000,
    gal: 3.78541
  },

  Time: {
    sec: 1,
    min: 60,
    hour: 3600,
    day: 86400
  },

  Data: {
    B: 1,
    KB: 1024,
    MB: 1048576,
    GB: 1073741824,
    TB: 1099511627776
  },

  Pressure: {
    Pa: 1,
    kPa: 1000,
    bar: 100000,
    atm: 101325
  },

  Temperature: null
};

if ($("#convCat")) {

  $("#convCat").innerHTML =
    Object.keys(data)
      .map(x => `<option>${x}</option>`)
      .join("");
}

function setupConv() {

  if (!$("#convCat")) return;

  const category =
    $("#convCat").value;

  const units =
    category === "Temperature"
      ? [
          "Celsius",
          "Fahrenheit",
          "Kelvin"
        ]
      : Object.keys(data[category]);

  $("#convFrom").innerHTML =
    units
      .map(x => `<option>${x}</option>`)
      .join("");

  $("#convTo").innerHTML =
    units
      .map(x => `<option>${x}</option>`)
      .join("");

  if (units.length > 1) {
    $("#convTo").selectedIndex = 1;
  }

  convert();
}

function convert() {

  if (
    !$("#convCat") ||
    !$("#convFrom") ||
    !$("#convTo")
  ) {
    return;
  }

  const category =
    $("#convCat").value;

  const value =
    num("#convVal");

  const from =
    $("#convFrom").value;

  const to =
    $("#convTo").value;

  let result;

  if (category === "Temperature") {

    let kelvin;

    if (from === "Celsius") {

      kelvin =
        value + 273.15;

    } else if (from === "Fahrenheit") {

      kelvin =
        (value - 32) * 5 / 9 +
        273.15;

    } else {

      kelvin = value;
    }

    if (to === "Celsius") {

      result =
        kelvin - 273.15;

    } else if (to === "Fahrenheit") {

      result =
        (kelvin - 273.15) * 9 / 5 +
        32;

    } else {

      result = kelvin;
    }

  } else {

    result =
      value *
      data[category][from] /
      data[category][to];
  }

  result =
    Number(
      result.toPrecision(precision)
    );

  if ($("#convResult"))
    $("#convResult").value = result;

  if ($("#convText")) {

    $("#convText").textContent =
      `${value} ${from} = ${result} ${to}`;
  }
}

if ($("#convCat"))
  $("#convCat").onchange = setupConv;

if ($("#convVal"))
  $("#convVal").oninput = convert;

if ($("#convFrom"))
  $("#convFrom").onchange = convert;

if ($("#convTo"))
  $("#convTo").onchange = convert;

setupConv();

/* ================= DATE & AGE ================= */

function ageCalc() {

  const dob =
    new Date($("#dob").value);

  const asof =
    new Date($("#asof").value);

  if (
    isNaN(dob.getTime()) ||
    isNaN(asof.getTime())
  ) {

    out(
      "#ageO",
      "Select both dates"
    );

    return;
  }

  if (asof < dob) {

    out(
      "#ageO",
      "End date must be after birth date"
    );

    return;
  }

  let years =
    asof.getFullYear() -
    dob.getFullYear();

  let months =
    asof.getMonth() -
    dob.getMonth();

  let days =
    asof.getDate() -
    dob.getDate();

  if (days < 0) {

    months--;

    days +=
      new Date(
        asof.getFullYear(),
        asof.getMonth(),
        0
      ).getDate();
  }

  if (months < 0) {

    years--;

    months += 12;
  }

  out(
    "#ageO",
    `${years} years, ${months} months, ${days} days`
  );
}

function dateDiff() {

  const first =
    new Date($("#d1").value);

  const second =
    new Date($("#d2").value);

  if (
    isNaN(first.getTime()) ||
    isNaN(second.getTime())
  ) {

    out(
      "#dateO",
      "Select both dates"
    );

    return;
  }

  const days =
    Math.abs(
      Math.round(
        (second - first) /
        86400000
      )
    );

  out(
    "#dateO",
    `${days} days · ${fmt(days / 7)} weeks`
  );
}
/* ================= SETTINGS ================= */

if ($("#themeSelect")) {

  $("#themeSelect").value =
    document.body.classList.contains("light")
      ? "light"
      : "dark";

  $("#themeSelect").onchange = e => {

    const light =
      e.target.value === "light";

    document.body.classList.toggle(
      "light",
      light
    );

    save(
      "theme",
      light ? "light" : "dark"
    );
  };
}


if ($("#precision")) {

  $("#precision").value =
    precision;

  $("#precision").onchange = e => {

    precision =
      Number(e.target.value);

    save(
      "precision",
      precision
    );
  };
}


if ($("#sound")) {

  $("#sound").value =
    localStorage.getItem("sound") || "off";

  $("#sound").onchange = e => {

    save(
      "sound",
      e.target.value
    );
  };
}


/* ================= RESET ================= */

function resetAll() {

  localStorage.clear();

  location.reload();
}


/* ================= TOAST ================= */

function toast(message) {

  const element =
    $("#toast");

  if (!element) return;

  element.textContent =
    message;

  element.classList.add("show");

  setTimeout(() => {

    element.classList.remove("show");

  }, 1400);
}


/* ================= START ================= */

if ($("#year")) {

  $("#year").textContent =
    new Date().getFullYear();
}


renderMini();
