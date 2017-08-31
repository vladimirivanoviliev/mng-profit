import express from 'express';
import fs from 'fs';
import DataService from './data_access/dataService';
import ScrapperServer from './scrapper/scrapperServer';

const expressApp = express();
const CLIENT_PORT = '8081';
const dataService = new DataService();
const scrapper = new ScrapperServer(dataService);

scrapper.start();

expressApp.get('/', function(req, res){
    //Load data from the database
   dataService.getAll('currency')
        .then((currencyData) => {
            dataService.getAll('history')
                .then((historyData) => {
                    //Serve the loaded data to the client
                    fs.readFile('indexTemplate.html', 'utf8', (err,data) => {
                        if (err) {
                            return console.log('Error reading template file: ', err);
                        }

                        res.send(data
                            .replace('<!--replaceCurrencyData-->', JSON.stringify(currencyData))
                            .replace('<!--replaceHistoryData-->', JSON.stringify(historyData)));
                    });
                });
        });
});

expressApp.listen(CLIENT_PORT);

console.log(`Client served on port: ${CLIENT_PORT}`);

function exitHandler(options, err) {
    dataService.exit();
    scrapper.exit();

    if (options.cleanup) {
        console.log('clean');
    }

    if (err) {
        console.log(err.stack);
    }

    if (options.exit) {
        process.exit();
    }
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));
//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
