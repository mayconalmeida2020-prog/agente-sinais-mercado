const axios = require("axios");
const { gravarSinal } = require("./sheets");


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



  const ultimos = candles.slice(-(periodo + 1));

 for (let i = 1; i < ultimos.length; i++) {


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
// =====================================
// ANÁLISE DOS PADRÕES DE CANDLE
// =====================================


function analisarCandles(candles){


  if(candles.length < 52){

    return null;

  }



  const atual =
  candles[candles.length - 1];


  const anterior =
  candles[candles.length - 2];


  const antesAnterior =
  candles[candles.length - 3];



  const openAtual =
  parseFloat(atual.open);


  const closeAtual =
  parseFloat(atual.close);


  const openAnterior =
  parseFloat(anterior.open);


  const closeAnterior =
  parseFloat(anterior.close);


  const openAntes =
  parseFloat(antesAnterior.open);


  const closeAntes =
  parseFloat(antesAnterior.close);



  const rsi =
  calcularRSI(candles);



  const sma10 =
  calcularSMA(10,candles);



  const sma50 =
  calcularSMA(50,candles);



  const suporte =
  calcularSuporte(candles);



  const resistencia =
  calcularResistencia(candles);



  const tendenciaAlta =
  sma10 > sma50;



  const tendenciaBaixa =
  sma10 < sma50;



  const margem =
  closeAtual * 0.002;



  const pertoSuporte =
  Math.abs(closeAtual - suporte)
  <= margem;



  const pertoResistencia =
  Math.abs(closeAtual - resistencia)
  <= margem;



  let sinal = null;

  let padrao = "";





// =====================================
// ENGOLFO DE ALTA
// =====================================


if(

tendenciaAlta &&

closeAnterior < openAnterior &&

closeAtual > openAtual &&

closeAtual > openAnterior &&

openAtual <= closeAnterior

){


sinal="COMPRA";

padrao="Engolfo de Alta";


}




// =====================================
// ENGOLFO DE BAIXA
// =====================================


else if(

tendenciaBaixa &&

closeAnterior > openAnterior &&

closeAtual < openAtual &&

closeAtual < openAnterior &&

openAtual >= closeAnterior

){


sinal="VENDA";

padrao="Engolfo de Baixa";


}





// =====================================
// MARTelo
// =====================================


const corpo =
Math.abs(closeAtual-openAtual);



const sombraInferior =
Math.min(openAtual,closeAtual)
-
parseFloat(atual.low);



const sombraSuperior =
parseFloat(atual.high)
-
Math.max(openAtual,closeAtual);





if(

tendenciaAlta &&

corpo < sombraInferior &&

sombraSuperior < corpo * 0.3 &&

pertoSuporte &&

rsi < 40

){


sinal="COMPRA";

padrao="Martelo no Suporte";


}





// =====================================
// ENFORCADO
// =====================================


else if(

tendenciaBaixa &&

corpo < sombraSuperior &&

sombraInferior < corpo * 0.3 &&

pertoResistencia &&

rsi > 60

){


sinal="VENDA";

padrao="Enforcado na Resistência";


}





// =====================================
// ESTRELA DA MANHÃ
// =====================================


if(

tendenciaAlta &&

closeAntes < openAntes &&

Math.abs(openAnterior-closeAnterior)
<
corpo*0.3 &&

closeAtual > openAtual &&

closeAtual >
((openAntes+closeAntes)/2)

){


sinal="COMPRA";

padrao="Estrela da Manhã";


}





// =====================================
// ESTRELA DA NOITE
// =====================================


if(

tendenciaBaixa &&

closeAntes > openAntes &&

Math.abs(openAnterior-closeAnterior)
<
corpo*0.3 &&

closeAtual < openAtual &&

closeAtual <
((openAntes+closeAntes)/2)

){


sinal="VENDA";

padrao="Estrela da Noite";


}





if(sinal){


return {

par:PAR,

sinal:sinal,

preco:closeAtual,

padrao:padrao,

rsi:rsi.toFixed(2),

sma10:sma10.toFixed(5),

sma50:sma50.toFixed(5)

};


}



return null;



}
// =====================================
// EXECUÇÃO DO AGENTE
// =====================================


async function iniciar(){


  console.log(
    "🤖 AGENTE DE ANÁLISE INICIADO"
  );


  console.log(
    "Par analisado:",
    PAR
  );


  const candles =
  await buscarCandles();



  if(candles.length === 0){


    console.log(
      "Nenhum candle recebido"
    );


    return;


  }



  const sinal =
  analisarCandles(candles);




if(sinal){



    console.log(
      "================================="
    );


    console.log(
      "🚨 NOVO SINAL IDENTIFICADO"
    );


    console.log(
      "Par:",
      sinal.par
    );


    console.log(
      "Direção:",
      sinal.sinal
    );


    console.log(
      "Preço:",
      sinal.preco
    );


    console.log(
      "Padrão:",
      sinal.padrao
    );


    console.log(
      "RSI:",
      sinal.rsi
    );


    console.log(
      "SMA10:",
      sinal.sma10
    );


    console.log(
      "SMA50:",
      sinal.sma50
    );


    console.log(
      "================================="
    );


    // =====================================
    // GRAVAR NA PLANILHA GOOGLE SHEETS
    // =====================================

    await gravarSinal(sinal);



}else{



    console.log(
      "ℹ Nenhum sinal encontrado"
    );


}
}
// iniciar agente

iniciar();
