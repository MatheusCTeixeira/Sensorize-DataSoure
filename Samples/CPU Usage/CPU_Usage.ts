import * as express from "express";
import * as cors from "cors";
import * as os from "os-utils";


const PORT : number = parseInt(process.argv[2]);


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
 * Esta parte do código é responsável por lê os dados seriais.
 * A implementação pode variar de acordo com a biblioteca utilizada.
 */

// Lê os dados da porta serial "COM4" na taxa de 9600 bauds.
let dataBuffer: IData[] = [];

setInterval(()=> {
    os.cpuUsage(function(value){
        console.log(value);
        dataBuffer.push({
            x: new Date(),
            y: value * 100,
        } as IData);
    });
}, 200);

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
/* ---------------------------- Exemplo de fetch ---------------------------- */
     let data = 
        dataBuffer.filter(
            sample => (
                (sample.x as Date).getTime() > lastRequestSent.getTime())
        );

    // Retorna a quantidade mais recente específicada por "max".
    //if (max != undefined) data = data.slice(-max);

/* -------------------------------------------------------------------------- */

    return data;
}

const app = express();

app.use(cors());

app.get("/", (_, res) => {
    console.log("New request");
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

