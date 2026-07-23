const { google } = require("googleapis");


const SPREADSHEET_ID =
"10LBJPnZsmYsGvUPfVZuOVpUc36vurQoFLzU-SAsrEkk";


const ABA =
"sinal indicador novo";



async function gravarSinal(dados){


const auth =
new google.auth.GoogleAuth({

credentials:
JSON.parse(process.env.GOOGLE_CREDENTIALS),


scopes:[
"https://www.googleapis.com/auth/spreadsheets"
]

});



const sheets =
google.sheets({

version:"v4",

auth

});



await sheets.spreadsheets.values.append({

spreadsheetId:SPREADSHEET_ID,


range:`${ABA}!A:G`,


valueInputOption:"USER_ENTERED",


resource:{

values:[[

new Date(),

dados.par,

dados.sinal,

dados.preco,

"AGUARDANDO RESULTADO",

"",

dados.padrao

]]

}


});


console.log(
"✅ Sinal salvo na planilha"
);


}



module.exports = {
gravarSinal
};
