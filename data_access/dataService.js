import sqlite3 from 'sqlite3';
import path from 'path';

class DataService {
    //Help: http://www.sqlitetutorial.net/sqlite-nodejs/
    // 1) serialize method makes the operations sync
    // 2) parallelize is the oposite

    constructor() {
        this._db = new sqlite3.Database(path.join(__dirname, '..', 'data_base', 'mng-profit-db.sqlite3'), sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Connected to the database.');
            }
        });
    }

    insert(tableName, props) {
        if (!tableName || !props) {
            return;
        }

        const propNames = Object.getOwnPropertyNames(props);
        const fieldNames = propNames.join(',');
        const fieldValues = [];

        propNames.forEach((prop) => {
            fieldValues.push(props[prop]);
        });

        const placeholders = fieldValues.map((value) => '?').join(',');

        this._db.run(`INSERT INTO ${tableName}(${fieldNames}) VALUES(${placeholders})`, fieldValues, function(err) {
            if (err) {
                return console.log(err.message);
            }
            // get the last insert id
            console.log(`A row has been inserted with rowid ${this.lastID}`);
        });
    }

    getFirstByFieldValue(tableName, fieldName, fieldValue) {
        if (!tableName || !fieldName || !fieldValue) {
            return;
        }

        this._db.serialize(() => {
            this._db.get(`SELECT * FROM ${tableName} WHERE ${fieldName} = '${fieldValue}'`, (err, row) => {
                console.log('>>' + JSON.stringify(row));
            });
        });
    }

    getAll(tableName) {
        if (!tableName) {
            return;
        }

        this._db.serialize(() => {
            this._db.all(`SELECT * FROM ${tableName}`, (err, rows) => {

              if (err) {
                console.error(err.message);
              }

              console.log('>>' + JSON.stringify(rows));
            });
          });
    }

    exit() {
        console.log('Closing database connection...');

        this._db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Close the database connection.');
        });
    }
}

export default DataService;