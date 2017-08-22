import express from 'express';
import fs from 'fs';
import request from 'request';
import cheerio from 'cheerio';
import DataAccess from './data_service/dataAccess';
import ScrapperServer from './scrapper/scrapperServer';

const expressApp = express();
const CLIENT_PORT = '8081';

expressApp.get('/scrape', function(req, res){
    //Load data from the database
    //const data = ['EXAMPLE DATA FROM DB'];

    //Serve the loaded data to the client
    //fs.readFile('indexTemplate.html', 'utf8', (err,data) => {
    //    if (err) {
    //        return console.log('Error reading template file: ', err);
    //    }
    //    res.send(data.replace('<!--replace-->', JSON.stringify(currencies)));
    //});
});

 //TEST CODE:


const c = new DataAccess();
//const scrapper = new ScrapperServer(new DataAccess());

expressApp.listen(CLIENT_PORT)

console.log(`Client served on port: ${CLIENT_PORT}`);
