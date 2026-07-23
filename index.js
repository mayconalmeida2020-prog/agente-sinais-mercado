const axios = require("axios");


// =====================================
// CONFIGURAÇÕES DO AGENTE
// =====================================

const API_KEY = process.env.TWELVEDATA_KEY;

const PAR = "EUR/USD";

const INTERVALO = "1min";

const TIMEZONE = "America/Cuiaba";



// =====================================
// BUSCAR CANDLES
// =====================================

async function buscarCandles() {


  const url =
  `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(PAR)}&interval=${INTERVALO}&apikey=${API_KEY}&outputsize=100&timezone=${TIMEZONE}`;


  try {


    const resposta = await axios.get(url);


    if (!resposta.data.values) {

      console.log("Erro API:");
      console.log(resposta.data);

      return [];

    }


    return resposta.data.values.reverse();


  } catch (erro) {


    console.log(
      "Erro ao buscar candles:",
      erro.message
    );


    return [];

  }


}




// =====================================
// CALCULAR RSI
// =====================================

function calcularRSI(candles) {


  const periodo = 14;


  if (candles.length < periodo + 1) {

    return 50;

  }


  let ganhos = 0;

  let perdas = 0;



  for (let i = 1; i < candles.length; i++) {


    const atual =
    parseFloat(candles[i].close);



    const anterior =
    parseFloat(candles[i - 1].close);



    const diferenca =
    atual - anterior;



    if (diferenca > 0) {


      ganhos += diferenca;


    } else {


      perdas += Math.abs(diferenca);


    }


  }



  const mediaGanhos =
  ganhos / periodo;



  const mediaPerdas =
  perdas / periodo;



  if (mediaPerdas === 0) {


    return 100;


  }



  const rs =
  mediaGanhos / mediaPerdas;



  return 100 - (100 / (1 + rs));


}





// =====================================
// CALCULAR SMA
// =====================================

function calcularSMA(periodo, candles) {


  const lista =
  candles.slice(-periodo);



  const soma =
  lista.reduce(
    (total, candle) =>
    total + parseFloat(candle.close),
    0
  );


  return soma / periodo;


}





// =====================================
// SUPORTE E RESISTÊNCIA
// =====================================

function calcularSuporte(candles){


  const ultimos =
  candles.slice(-50);


  return Math.min(
    ...ultimos.map(
      c => parseFloat(c.low)
    )
  );


}



function calcularResistencia(candles){


  const ultimos =
  candles.slice(-50);


  return Math.max(
    ...ultimos.map(
      c => parseFloat(c.high)
    )
  );


}
