import {IPool} from "mysql";
const config = require('../../../config.json');
import * as mysql from "mysql";
import * as SQLBuilder from "squel";

const DB_PREFIX = 'cmc';

export default class DataService {

    private static instance: DataService;
    private connectionPool: IPool;

    static getInstance() {
        if (!this.instance) {
            this.instance = new DataService();
        }

        return this.instance;
    }

    constructor() {
        this.connectionPool = mysql.createPool({
            connectionLimit: 10,
            host: config.database.dbhost,
            user: config.database.dbuser,
            password: config.database.dbpassword,
            database: config.database.dbname
        })
    }

    public insertRawData(name: string,
                         domain: string,
                         publicIP: string,
                         location: string,
                         remoteHost: string,
                         macAddress: string,
                         regionCode: string,
                         countryCode: string) {
        return new Promise((resolve, reject) => {
            this.connectionPool.getConnection((error, connection) => {
                if (error) {
                    return reject(error);
                }

                let query = SQLBuilder.insert()
                    .into(DB_PREFIX + '_raw_data')
                    .set('name', name)
                    .set('domain', domain)
                    .set('publicIP', publicIP)
                    .set('location', location)
                    .set('remoteHost', remoteHost)
                    .set('macAddress', macAddress)
                    .set('regionCode', regionCode)
                    .set('countryCode', countryCode)
                    .toString();

                connection.query(query, (error, results) => {
                    connection.release();

                    if (error) {
                        return reject(error);
                    }

                    resolve(results);
                });
            });
        })
    }

    private static ipToLong(ip: string): Number {
        if (ip) {
            let values = ip.split('.');
            if (values.length === 4) {
                return parseInt(values[3]) + parseInt(values[2]) * 256 + parseInt(values[1]) * 256 * 256 +
                    parseInt(values[0]) * 256 * 256 * 256;
            }
        }

        return 0;
    }

    public getIpLocation(ip: string): any {
        return new Promise((resolve, reject) => {
            let ipLong = DataService.ipToLong(ip);
            this.connectionPool.getConnection((error, connection) => {
                if (error) {
                    return reject(error);
                }

                let query = SQLBuilder.select()
                    .from(DB_PREFIX + '_master_location')
                    .field(DB_PREFIX + '_master_location.country_code', 'countryCode')
                    .field(DB_PREFIX + '_master_location.country_name', 'countryName')
                    .field('region_code', 'regionCode')
                    .field(DB_PREFIX + '_master_location.region_name', 'regionName')
                    .field('city_name', 'cityName')
                    .where('ip_from <= ?', ipLong)
                    .where('ip_to >= ?', ipLong)
                    .left_join(DB_PREFIX + '_master_region', null, DB_PREFIX + '_master_location.region_name = ' + DB_PREFIX +
                        '_master_region.region_name')
                    .toString();

                connection.query(query, (error, results) => {
                    connection.release();

                    if (error) {
                        return reject(error);
                    }

                    if (results.length > 0)
                        return resolve(results[0]);

                    resolve(null);
                });
            });
        });
    }

    public checkBlackList(remote: string) {
        return new Promise((resolve, reject) => {
            this.connectionPool.getConnection((error, connection) => {
                if (error) {
                    return reject(error);
                }

                let query = SQLBuilder.select()
                    .from(DB_PREFIX + '_black_list')
                    .where('remote_host = ?', remote)
                    .toString();

                connection.query(query, (error, results) => {
                    connection.release();

                    if (error) {
                        return reject(error);
                    }

                    if (results.length > 0)
                        return true;

                    resolve(false);
                });
            });
        });
    }
}