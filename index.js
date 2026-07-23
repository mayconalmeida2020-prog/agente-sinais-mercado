const axios = require("axios");


const API_KEY = process.env.TWELVEDATA_KEY;


const PAR = "EUR/USD";


async function buscarCandles() {

  const url =
  `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(PAR)}&interval=1min&apikey=${API_KEY}&outputsize=100&timezone=America/Cuiaba`;


  const resposta = await axios.get(url);


  if (!resposta.data.values) {

    console.log("Erro ao buscar candles");
    console.log(resposta.data);

    return [];

  }


  return resposta.data.values.reverse();

}



function analisar(candles){


  if(candles.length < 3){

    return null;

  }


  const atual = candles[candles.length-1];

  const anterior = candles[candles.length-2];


  const compra =
    parseFloat(atual.close) >
    parseFloat(atual.open)
    &&
    parseFloat(anterior.close) <
    parseFloat(anterior.open);



  const venda =
    parseFloat(atual.close) <
    parseFloat(atual.open)
    &&
    parseFloat(anterior.close) >
    parseFloat(anterior.open);



  if(compra){

    return {
      sinal:"COMPRA",
      preco:atual.close
    };

  }



  if(venda){

    return {
      sinal:"VENDA",
      preco:atual.close
    };

  }



  return null;


}




async function iniciar(){


console.log("🤖 Agente iniciado");


const candles =
await buscarCandles();



const resultado =
analisar(candles);



if(resultado){


console.log("🚨 NOVO SINAL");

console.log(resultado);


}else{


console.log(
"Sem sinal neste momento"
);


}



}


iniciar();
