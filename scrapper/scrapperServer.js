import Scrapper from './scrapper';

const DEFAULT_INTERVAL_MS = 7200000;

class ScrapperServer {
    constructor(dataService) {
        this._scrapper = new Scrapper(dataService);
    }

    start(interval) {
        //start the server, for example with interval
        this._scrapperInterval = setInterval(() => {
            this._scrapper.scrap();
        }, interval || DEFAULT_INTERVAL_MS);

        this._scrapper.scrap();
    }

    exit() {
        clearInterval(this._scrapperInterval);
    }
}

export default ScrapperServer;
