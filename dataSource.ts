import * as express from "express";
import * as cors from "cors";

const PORT : number = parseInt(process.argv[2]);

const dataSourceType = process.argv[3]; // category | timeseries

const functions = [
    x => Math.abs(Math.log(x)),
    x => Math.abs(Math.sin(x)),
    x => Math.abs(Math.sqrt(x))
];
const labels = ["Temperature", "Velocity", "Cycles", "Space"];
let counter = 0;

// O formato de resposta deve ser o JSON.

enum EStatus { On = "On", Off = "Off"};

interface IStatus {
    uptime: Date;
    sensorStatus: EStatus; // On, Off
    requestPerHour: number,
};

interface IData {
    x: Date | string,
    y: number
};

/**
 * Exibe o estado da data Source.
 */
const getSensorStatus: () => IStatus = () => {
    return {
        uptime: new Date(),
        sensorStatus: EStatus.On,
        requestPerHour: counter,
    } as IStatus;
}

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
const getData = (lastRequestSent: Date = new Date(), max?: number) => {
    let data = [];

/* ---------------------------- Exemplo de fetch ---------------------------- */
    let sampleNumber = 1;              // O número da amostra.
    let t = lastRequestSent.getTime(); // O tampo em ms da última requisição.

    if (dataSourceType === "category") {

        data.push({
            x: labels[counter % labels.length],
            y: (PORT % 3000) * 10 + counter % labels.length,
        });

        counter++;

    } else if (dataSourceType === "timeseries") {

        while (t + sampleNumber * 1000 < Date.now()) {
            data.push({
                x: new Date(t + sampleNumber * 1000),
                y: functions[PORT % functions.length](counter++/10),
            });

            sampleNumber++;
        }
    }

    // Retorna a quantidade mais recente específicada por "max".
    if (max != undefined) data = data.slice(-max);

/* -------------------------------------------------------------------------- */

    return data;
}

const app = express();

app.use(cors());

app.get("/", (_, res) => {
    res.sendStatus(200);
})
.get("/status", (_, res, next) => {
    res.json(getSensorStatus())

    next();
})
.get("/data/:lastReceived/:max", (req, res, next) => {
    const date = new Date(req.params.lastReceived);
    const max = parseInt(req.params.max);
    res.json(getData(date, max));

    next();
})
.get("/data/:lastReceived", (req, res, next) => {
    const date = new Date(req.params.lastReceived);
;    res.json(getData(date));

    next();
})

app.listen(PORT, ()=> {
    console.log(`Data Source Running on port ${PORT}...`);
});

