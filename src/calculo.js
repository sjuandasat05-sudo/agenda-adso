const nombre = "Carolina";
const notas = [4.0, 4.5, 3.8];
const promedio = (notas[0] + notas[1] + notas[2]) / 3;
console.log(`Aprendiz: ${nombre}`);
console.log(`Promedio: ${promedio.toFixed(2)}`);
console.log(`Estado: ${promedio >= 3 ? "Aprobado" : "No Aprobado"}`);
