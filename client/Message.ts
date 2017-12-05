export class Message {
    constructor(public id: Number,
                public location: string,
                public remoteHost: string,
                public remoteCountryCode: string,
                public regionCode: string,
                public countryCode: string,
                public name: string) {
    }
}