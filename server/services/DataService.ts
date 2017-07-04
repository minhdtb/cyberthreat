import Data from "../models/Data";

export default class DataService {
    static create(name: string,
                  domain: string,
                  publicIP: string,
                  location: string,
                  macAddress: string) {
        return Data.create({
            name: name,
            domain: domain,
            publicIP: publicIP,
            location: location,
            macAddress: macAddress
        });
    }
}