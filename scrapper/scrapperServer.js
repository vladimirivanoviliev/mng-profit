import Scrapper from './scrapper';

const DEFAULT_INTERVAL_MS = 1800000;

class ScrapperServer {
    constructor(dataAccess) {
        this._scrapper = new Scrapper(dataAccess);
    }

    start(interval) {
        //start the server, for example with interval
        setInterval(() => {
            this._scrapper.scrap();
        }, interval || DEFAULT_INTERVAL_MS);
    }
}

export default ScrapperServer;