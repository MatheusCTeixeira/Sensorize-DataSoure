"use strict";
exports.__esModule = true;
var express = require("express");
var cors = require("cors");
var os = require("os-utils");
var PORT = parseInt(process.argv[2]);
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
 * Esta parte do código é responsável por lê os dados seriais.
 * A implementação pode variar de acordo com a biblioteca utilizada.
 */
// Lê os dados da porta serial "COM4" na taxa de 9600 bauds.
var dataBuffer = [];
setInterval(function () {
    os.cpuUsage(function (value) {
        console.log(value);
        dataBuffer.push({
            x: new Date(),
            y: value * 100
        });
    });
}, 200);
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
    /* ---------------------------- Exemplo de fetch ---------------------------- */
    var data = dataBuffer.filter(function (sample) { return (sample.x.getTime() > lastRequestSent.getTime()); });
    // Retorna a quantidade mais recente específicada por "max".
    //if (max != undefined) data = data.slice(-max);
    /* -------------------------------------------------------------------------- */
    return data;
};
var app = express();
app.use(cors());
app.get("/", function (_, res) {
    console.log("New request");
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
