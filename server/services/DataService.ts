import {IPool} from "mysql";
const config = require('../../../config.json');
import * as mysql from "mysql";
import * as SQLBuilder from "squel";
import * as moment from "moment";

const DB_PREFIX = 'cmc';

const CMC_MASTER_LOCATION = DB_PREFIX + '_master_location';
const CMC_MASTER_REGION = DB_PREFIX + '_master_region';
const CMC_RAW_DATA = DB_PREFIX + '_raw_data';
const CMC_BLACK_LIST = DB_PREFIX + '_black_list';

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
                    .into(CMC_RAW_DATA)
                    .set('name', name)
                    .set('domain', domain)
                    .set('publicIP', publicIP)
                    .set('location', location)
                    .set('remoteHost', remoteHost)
                    .set('macAddress', macAddress)
                    .set('regionCode', regionCode)
                    .set('countryCode', countryCode)
                    .set('createdDate', moment(new Date()).format('YYYY-MM-DD HH:mm:ss'))
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
                    .from(CMC_MASTER_LOCATION)
                    .field(CMC_MASTER_LOCATION + '.country_code', 'countryCode')
                    .field(CMC_MASTER_LOCATION + '.country_name', 'countryName')
                    .field('region_code', 'regionCode')
                    .field(CMC_MASTER_LOCATION + '.region_name', 'regionName')
                    .field('city_name', 'cityName')
                    .where('ip_from <= ?', ipLong)
                    .where('ip_to >= ?', ipLong)
                    .left_join(CMC_MASTER_REGION, null, CMC_MASTER_LOCATION + '.region_name = '
                        + CMC_MASTER_REGION + '.region_name')
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
                    .from(CMC_BLACK_LIST)
                    .where('remote_host = ?', remote)
                    .toString();

                connection.query(query, (error, results) => {
                    connection.release();

                    if (error) {
                        return reject(error);
                    }

                    if (results.length > 0)
                        return resolve(true);

                    resolve(false);
                });
            });
        });
    }

    public getTopMalware() {
        return new Promise((resolve, reject) => {
            this.connectionPool.getConnection((error, connection) => {
                if (error) {
                    return reject(error);
                }

                let toDay = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                let lastDay = moment(new Date()).subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss');

                let query = SQLBuilder.select()
                    .from(CMC_RAW_DATA)
                    .field('name')
                    .field('COUNT(name)', 'count')
                    .group('name')
                    .where('createdDate >= ?', lastDay)
                    .where('createdDate <= ?', toDay)
                    .order('count', false)
                    .limit(10)
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

    public getTopRegion() {
        return new Promise((resolve, reject) => {
            this.connectionPool.getConnection((error, connection) => {
                if (error) {
                    return reject(error);
                }

                let toDay = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                let lastDay = moment(new Date()).subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss');

                let query = SQLBuilder.select()
                    .from(CMC_RAW_DATA)
                    .field('countryCode')
                    .field('regionCode')
                    .field('COUNT(*)', 'count')
                    .group('regionCode')
                    .group('countryCode')
                    .where('createdDate >= ?', lastDay)
                    .where('createdDate <= ?', toDay)
                    .order('count', false)
                    .limit(10)
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

    public getTopRemote() {
        return new Promise((resolve, reject) => {
            this.connectionPool.getConnection((error, connection) => {
                if (error) {
                    return reject(error);
                }

                let toDay = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                let lastDay = moment(new Date()).subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss');

                let query = SQLBuilder.select()
                    .from(CMC_RAW_DATA)
                    .field('remoteHost')
                    .field('COUNT(*)', 'count')
                    .group('remoteHost')
                    .where('createdDate >= ?', lastDay)
                    .where('createdDate <= ?', toDay)
                    .order('count', false)
                    .limit(10)
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
}