import RawData from "../models/RawData";

export default class DataService {
    static create(name: string,
                  domain: string,
                  publicIP: string,
                  location: string,
                  macAddress: string,
                  regionCode: string,
                  countryCode: string) {
        return RawData.create({
            name: name,
            domain: domain,
            publicIP: publicIP,
            location: location,
            macAddress: macAddress,
            regionCode: regionCode,
            countryCode: countryCode
        });
    }
}