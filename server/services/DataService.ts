import RawData from "../models/RawData";
import MasterLocation from "../models/MasterLocation";

export default class DataService {

    static insertRawData(name: string,
                         domain: string,
                         publicIP: string,
                         location: string,
                         remoteHost: string,
                         macAddress: string,
                         regionCode: string,
                         countryCode: string) {
        return RawData.create({
            name: name,
            domain: domain,
            publicIP: publicIP,
            location: location,
            remoteHost: remoteHost,
            macAddress: macAddress,
            regionCode: regionCode,
            countryCode: countryCode
        });
    }

    static ipToLong(ip: string): Number {
        if (ip) {
            let values = ip.split('.');
            if (values.length === 4) {
                return parseInt(values[3]) + parseInt(values[2]) * 256 + parseInt(values[1]) * 256 * 256 +
                    parseInt(values[0]) * 256 * 256 * 256;
            }
        }

        return 0;
    }

    static getIpLocation(ip: string): any {
        let ipLong = DataService.ipToLong(ip);

        return MasterLocation.findOne({
            attributes: [
                ['country_code', 'countryCode'],
                ['country_name', 'countryName'],
                ['region_name', 'regionName'],
                ['city_name', 'cityName'],
                ['zip_code', 'zipCode']
            ],
            where: {
                ip_to: {
                    $gte: ipLong
                },
                ip_from: {
                    $lte: ipLong
                }
            }
        });
    }
}