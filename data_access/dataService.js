import sqlite3 from 'sqlite3';
import path from 'path';

class DataService {
    constructor() {
        console.log('>> DataService dabase init');

        this._db = new sqlite3.Database(path.join(__dirname, '..', 'data_base', 'mng-profit-db.sqlite3'), sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Connected to the database.');
            }
        });
    }

    close() {
        this._db.close();
    }
}

export default DataService;