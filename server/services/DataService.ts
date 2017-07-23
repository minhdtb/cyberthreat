import * as mysql from "mysql";
import {IPool} from "mysql";
import * as SQLBuilder from "squel";
import * as moment from "moment";
import * as _ from "lodash";
import * as async from "async";

const config = require('../../../config.json');

const DB_PREFIX = 'cmc';

const CMC_MASTER_LOCATION = DB_PREFIX + '_master_location';
const CMC_MASTER_REGION = DB_PREFIX + '_master_region';
const CMC_MASTER_COUNTRY = DB_PREFIX + '_master_country';
const CMC_RAW_DATA = DB_PREFIX + '_raw_data';
const CMC_BLACK_LIST = DB_PREFIX + '_black_list';

const CMC_MALWARES = DB_PREFIX + '_malwares';

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

                let query = SQLBuilder.insert({replaceSingleQuotes: true})
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

    public generateMalwareList() {
        return new Promise((resolve, reject) => {
            this.connectionPool.getConnection((error, connection) => {
                if (error) {
                    return reject(error);
                }

                let toDay = moment(new Date()).add(1, 'days').format('YYYY-MM-DD');
                let lastDay = moment(new Date()).subtract(30, 'days').format('YYYY-MM-DD');

                let query = SQLBuilder.select()
                    .from(CMC_RAW_DATA)
                    .field('name')
                    .field('regionCode')
                    .field('countryCode')
                    .field('v2.region_name', 'regionName')
                    .field('v1.country_name', 'countryName')
                    .field('remoteHost')
                    .field('COUNT(name)', 'count')
                    .group('name')
                    .group('regionCode')
                    .group('countryCode')
                    .group('remoteHost')
                    .left_join(CMC_MASTER_COUNTRY, 'v1', 'UPPER(countryCode) = v1.country_alpha2_code')
                    .left_join(CMC_MASTER_REGION, 'v2', 'UPPER(countryCode) = v2.country_alpha2_code AND regionCode = v2.region_code')
                    .where('createdDate >= ?', lastDay)
                    .where('createdDate <= ?', toDay)
                    .toString();

                connection.query(query, (error, results) => {
                    connection.release();

                    if (error) {
                        return reject(error);
                    }

                    if (results.length > 0) {
                        this.truncateTable(CMC_MALWARES)
                            .then(() => {

                                let calls = [];
                                _.each(results, (item) => {
                                    calls.push((callback) => {
                                        this.insertMalware(item)
                                            .then(() => {
                                                callback(null);
                                            })
                                            .catch(error => {
                                                callback(error);
                                            });
                                    });
                                });

                                async.series(calls, (error) => {
                                    if (error) {
                                        return reject(error);
                                    }

                                    resolve();
                                });
                            })
                            .catch(error => {
                                return reject(error);
                            });
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    public insertMalware(record) {
        return new Promise((resolve, reject) => {
            this.connectionPool.getConnection((error, connection) => {
                if (error) {
                    return reject(error);
                }

                let query = SQLBuilder.insert({replaceSingleQuotes: true})
                    .into(CMC_MALWARES)
                    .set('name', record.name)
                    .set('regionCode', record.regionCode)
                    .set('countryCode', record.countryCode)
                    .set('regionName', record.regionName)
                    .set('countryName', record.countryName)
                    .set('remoteHost', record.remoteHost)
                    .set('count', record.count)
                    .toString();

                connection.query(query, (error, results) => {
                    connection.release();

                    if (error) {
                        return reject(error);
                    }

                    resolve(results);
                });
            });
        });
    }

    public truncateTable(table: string) {
        return new Promise((resolve, reject) => {
            this.connectionPool.getConnection((error, connection) => {
                if (error) {
                    return reject(error);
                }

                connection.query('TRUNCATE ' + table, (error, results) => {
                    connection.release();

                    if (error) {
                        return reject(error);
                    }

                    resolve(results);
                })
            });
        });
    }

    public getTopMalware(limit: number, countryCode?: string, regionCode?: string, remoteHost?: string) {
        return new Promise((resolve, reject) => {
            this.connectionPool.getConnection((error, connection) => {
                if (error) {
                    return reject(error);
                }

                let query = null;
                if (countryCode && regionCode) {
                    query = SQLBuilder.select()
                        .from(CMC_MALWARES)
                        .field('name')
                        .field('SUM(count)', 'count')
                        .group('name')
                        .where('countryCode = ?', countryCode)
                        .where('regionCode = ?', regionCode)
                        .order('count', false)
                }
                else if (remoteHost) {
                    query = SQLBuilder.select()
                        .from(CMC_MALWARES)
                        .field('name')
                        .field('SUM(count)', 'count')
                        .group('name')
                        .where('remoteHost = ?', remoteHost)
                        .order('count', false)
                }
                else {
                    query = SQLBuilder.select()
                        .from(CMC_MALWARES)
                        .field('name')
                        .field('SUM(count)', 'count')
                        .group('name')
                        .order('count', false)
                }

                if (limit > 0) {
                    query = query.limit(limit);
                }

                connection.query(query.toString(), (error, results) => {
                    connection.release();

                    if (error) {
                        return reject(error);
                    }

                    resolve(results);
                });
            });
        })
    }

    public getTopRegion(limit: number, name?: string) {
        return new Promise((resolve, reject) => {
            this.connectionPool.getConnection((error, connection) => {
                if (error) {
                    return reject(error);
                }

                let query = null;
                if (name) {
                    query = SQLBuilder.select()
                        .from(CMC_MALWARES)
                        .field('countryCode')
                        .field('regionCode')
                        .field('countryName')
                        .field('regionName')
                        .field('SUM(count)', 'count')
                        .group('regionCode')
                        .group('countryCode')
                        .where('name = ?', name)
                        .order('count', false)
                } else {
                    query = SQLBuilder.select()
                        .from(CMC_MALWARES)
                        .field('countryCode')
                        .field('regionCode')
                        .field('countryName')
                        .field('regionName')
                        .field('SUM(count)', 'count')
                        .group('regionCode')
                        .group('countryCode')
                        .order('count', false)
                }

                if (limit > 0) {
                    query = query.limit(limit);
                }

                connection.query(query.toString(), (error, results) => {
                    connection.release();

                    if (error) {
                        return reject(error);
                    }

                    resolve(results);
                });
            });
        })
    }

    public getTopRemote(limit: number) {
        return new Promise((resolve, reject) => {
            this.connectionPool.getConnection((error, connection) => {
                if (error) {
                    return reject(error);
                }

                let query = SQLBuilder.select()
                    .from(CMC_MALWARES)
                    .field('remoteHost')
                    .field('SUM(count)', 'count')
                    .group('remoteHost')
                    .order('count', false);

                if (limit > 0) {
                    query = query.limit(limit);
                }

                connection.query(query.toString(), (error, results) => {
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