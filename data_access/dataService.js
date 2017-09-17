import sqlite3 from 'sqlite3';
import path from 'path';
import currenciesQuery from './currencies-query';

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

    _genericErrorHandler(err) {
        console.log('>>> Error iterating with the database: ', err);
    }

    update(tableName, idFieldName, idFieldValue, fieldName, fieldValue) {
        return new Promise((resolve, reject) => {
            this._db.run(`UPDATE ${tableName} SET ${fieldName} = '${fieldValue}' WHERE ${idFieldName} = '${idFieldValue}'`, function(err) {
                if (err) {
                    console.log('>>> Error iterating with the database: ', err);
                    reject({
                        error: err
                    });
                } else {
                    console.log(`Row(s) updated: ${this.changes}`);
                    resolve(this.changes);
                }
              });
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

        return new Promise((resolve, reject) => {
            this._db.run(`INSERT INTO ${tableName}(${fieldNames}) VALUES(${placeholders})`, fieldValues, function(err) {
                if (err) {
                    console.log('>>> Error iterating with the database: ', err);
                    reject({
                        error: err
                    });
                } else {
                    console.log(`A row has been inserted with rowid ${this.lastID}`);
                    resolve(this.lastID);
                }
            });
        });
    }

    getFirst(tableName, fieldName, fieldValue) {
        return new Promise((resolve, reject) => {
            this._db.serialize(() => {
                this._db.get(`SELECT * FROM ${tableName} WHERE ${fieldName} = '${fieldValue}'`, (err, row) => {
                    if (err) {
                        console.log('>>> Error iterating with the database: ', err);
                        reject({
                            error: err
                        });
                    } else {
                        resolve(row);
                    }
                });
            });
        });
    }

    getAll(tableName) {
        return new Promise((resolve, reject) => {
            this._db.serialize(() => {
                this._db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
                    if (err) {
                        console.log('>>> Error iterating with the database: ', err);
                        reject({
                            error: err
                        });
                    } else {
                        resolve(rows);
                    }
                });
            });
        });
    }

    currencies() {
        return new Promise((resolve, reject) => {
            this._db.serialize(() => {
                this._db.all(currenciesQuery(), (err, rows) => {
                    if (err) {
                        console.log('>>> Error loading currencies: ', err);
                        reject({
                            error: err
                        });
                    } else {
                        resolve(rows);
                    }
                });
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