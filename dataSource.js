"use strict";
exports.__esModule = true;
var express = require("express");
var cors = require("cors");
var PORT = parseInt(process.argv[2]);
var dataSourceType = process.argv[3]; // category | timeseries
var functions = [
    function (x) { return Math.cos(x) + Math.sin(x); },
    function (x) { return Math.sin(x); },
    function (x) { return Math.cos(x); }
];
var labels = ["Temperature", "Velocity", "Cycles", "Space"];
var counter = 0;
// O formato de resposta deve ser o JSON.
var EStatus;
(function (EStatus) {
    EStatus["On"] = "On";
    EStatus["Off"] = "Off";
})(EStatus || (EStatus = {}));
;
;
;
/**
 * Exibe o estado da data Source.
 */
var getSensorStatus = function () {
    return {
        uptime: new Date(),
        sensorStatus: EStatus.On,
        requestPerHour: counter
    };
};
/**
 * Retorna os dados requisitados pelo cliente em relação a um instânte especí-
 * fico e, possívelmente, com uma restrição na quantidade de amostras.
 *
 * O parâmetro "lastRequestSent" é o momento da última consulta por parte do
 * cliente, portanto, os dados após esse instante é que devem ser enviados.
 *
 * O parâmetro "max", quando específicado, define o número máximo de dados es-
 * perado por parte do cliente. Deve-se retornar os max-dados mais atuais em
 * relação ao instante atual.
 */
var getData = function (lastRequestSent, max) {
    if (lastRequestSent === void 0) { lastRequestSent = new Date(); }
    var data = [];
    /* ---------------------------- Exemplo de fetch ---------------------------- */
    var sampleNumber = 1; // O número da amostra.
    var t = lastRequestSent.getTime(); // O tampo em ms da última requisição.
    if (dataSourceType === "category") {
        data.push({
            x: labels[counter % labels.length],
            y: (PORT % 3000) * 10 + counter % labels.length
        });
        counter++;
    }
    else if (dataSourceType === "timeseries") {
        while (t + sampleNumber * 1000 < Date.now()) {
            data.push({
                x: new Date(t + sampleNumber * 1000),
                y: functions[PORT % functions.length](counter++ / 10)
            });
            sampleNumber++;
        }
    }
    // Retorna a quantidade mais recente específicada por "max".
    if (max != undefined)
        data = data.slice(-max);
    /* -------------------------------------------------------------------------- */
    return data;
};
var app = express();
app.use(cors());
app.get("/", function (_, res) {
    res.sendStatus(200);
})
    .get("/status", function (_, res, next) {
    res.json(getSensorStatus());
    next();
})
    .get("/data/:lastReceived/:max", function (req, res, next) {
    var date = new Date(req.params.lastReceived);
    var max = parseInt(req.params.max);
    res.json(getData(date, max));
    next();
})
    .get("/data/:lastReceived", function (req, res, next) {
    var date = new Date(req.params.lastReceived);
    ;
    res.json(getData(date));
    next();
});
app.listen(PORT, function () {
    console.log("Data Source Running on port " + PORT + "...");
});
