import KrakenReader from './readers/kraken';

//Interval here should be increased if api calls increase (interval per API?)
//For example Kraken allows 1 request per 3 seconds - that why if you have 4 api calls
//you need to increase this to 12000ms to avoid block.
const DEFAULT_INTERVAL_MS = 60000;

class ReaderServer {
    constructor(dataService) {
        this._readers =[
            new KrakenReader(dataService)
        ];
    }

    start(interval) {
        //start the server, for example with interval
        this._readersInterval = setInterval(() => {
            this._readers.forEach(reader => reader.read());
        }, interval || DEFAULT_INTERVAL_MS);
    }

    exit() {
        clearInterval(this._readersInterval);
    }
}

export default ReaderServer;
