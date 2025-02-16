document.getElementById("tarjetaCreditoButton").addEventListener("click", () => {
  showTarjetaCreditoCalculator();
});

document.getElementById("resetButton").addEventListener("click", () => {
  resetToHome();
});

function resetToHome() {
  document.getElementById("creditCalculator").innerHTML = "";
  document.getElementById("creditChart").getContext("2d").clearRect(0, 0, 600, 400);
  document.getElementById("resetButton").style.display = "none";
  document.getElementById("inicio").style.display = "block";
}

function showTarjetaCreditoCalculator() {
  const calculatorDiv = document.getElementById("creditCalculator");
  calculatorDiv.innerHTML = `
    <h2>Tarjeta de Crédito</h2>
    <label>Saldo inicial:</label>
    <input type="number" id="saldoInicial" step="0.01" required><br>
    <label>Tasa efectiva anual (%):</label>
    <input type="number" id="tasaAnual" step="0.01" required><br>
    <label>Número de abonos:</label>
    <input type="number" id="numAbonos" required><br>
    <button onclick="calcularTarjetaCredito()">Calcular y Graficar</button>
  `;

  document.getElementById("resetButton").style.display = "block";
  document.getElementById("inicio").style.display = "none";
}

function calcularTarjetaCredito() {
  const saldoInicial = parseFloat(document.getElementById("saldoInicial").value);
  const tasaAnual = parseFloat(document.getElementById("tasaAnual").value) / 100;
  const numAbonos = parseInt(document.getElementById("numAbonos").value);

  const diasMes = 30;
  const tasaMensual = Math.pow(1 + tasaAnual, 1 / 12) - 1;

  let diasAbono = [];
  let saldosPromedios = [];
  let interesesMensuales = [];
  let abonos = [];

  for (let i = 0; i < numAbonos; i++) {
    let diaAbono = parseInt(prompt(`Ingrese el día del mes para el abono ${i + 1} (1-30):`));
    let abono = parseFloat(prompt(`Ingrese el monto del abono ${i + 1}:`));

    diasAbono.push(diaAbono);
    abonos.push(abono);

    const saldoPromedio = calcularSaldoPromedioDiario(saldoInicial, abono, diaAbono, diasMes);
    const interesMensual = saldoPromedio * tasaMensual;

    saldosPromedios.push(saldoPromedio);
    interesesMensuales.push(interesMensual);
  }

  graficarTarjetaCredito(saldoInicial, diasAbono, saldosPromedios, interesesMensuales, abonos);
}

function calcularSaldoPromedioDiario(saldoInicial, abono, diaAbono, diasMes = 30) {
  const saldoAntesAbono = saldoInicial * diaAbono;
  const saldoDespuesAbono = (saldoInicial - abono) * (diasMes - diaAbono);
  return (saldoAntesAbono + saldoDespuesAbono) / diasMes;
}

function graficarTarjetaCredito(saldoInicial, diasAbono, saldosPromedios, interesesMensuales, abonos) {
  const ctx = document.getElementById("creditChart").getContext("2d");

  // Agregar el saldo inicial al principio del gráfico
  diasAbono.unshift("Saldo Inicial");
  saldosPromedios.unshift(saldoInicial);
  interesesMensuales.unshift(0); // Sin intereses para el saldo inicial
  abonos.unshift(0); // No hay abono para el saldo inicial

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: diasAbono.map((dia) => (dia === "Saldo Inicial" ? dia : `Día ${dia}`)),
      datasets: [
        {
          label: "Saldo Promedio Diario (COP)",
          data: saldosPromedios,
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1
        },
        {
          label: "Interés Mensual (COP)",
          data: interesesMensuales,
          backgroundColor: "rgba(255, 99, 132, 0.7)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            font: {
              size: 14
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              if (tooltipItem.datasetIndex === 0 && tooltipItem.dataIndex !== 0) {
                return `Saldo Promedio Diario: ${tooltipItem.raw.toFixed(2)} COP\nAbono: ${abonos[tooltipItem.dataIndex]} COP`;
              }
              return `${tooltipItem.dataset.label}: ${tooltipItem.raw.toFixed(2)} COP`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Día del Abono",
            font: {
              size: 16
            }
          }
        },
        y: {
          title: {
            display: true,
            text: "Monto (COP)",
            font: {
              size: 16
            }
          }
        }
      }
    }
  });
}
