import {SocketService} from "./SocketService";
import {Message} from "./Message";
import * as d3 from "d3";

const PROMPT = 'InfoSec> ';

class RGBColor {
    constructor(public R: Number, public G: Number, public B: number) {
        if (typeof R === 'undefined')
            R = 0;
        if (typeof G === 'undefined')
            G = 0;
        if (typeof B === 'undefined')
            B = 0;
    }
}

function createColorRange(c1, c2) {
    let colorList = [], tmpColor;
    for (let i = 0; i < 255; i++) {
        tmpColor = new RGBColor(c1.R + ((i * (c2.R - c1.R)) / 255),
            c1.G + ((i * (c2.G - c1.G)) / 255),
            c1.B + ((i * (c2.B - c1.B)) / 255));
        colorList.push(tmpColor);
    }

    return colorList;
}

$(document).ready(() => {
    const socket = new SocketService();

    let terminalLog = $('#terminal-1');
    let terminalBlackList = $('#terminal-2');
    let objectTerminalDetect: Terminal;
    let objectTerminalBlackList: Terminal;

    let red = new RGBColor(255, 0, 0);
    let white = new RGBColor(255, 255, 255);
    let colors = createColorRange(red, white);

    socket.get('message').subscribe((message: Message) => {
        let objectCountry = d3.select('#map-world')
            .select('#' + message.countryCode.toUpperCase());

        let objectVietNamRegion = null;
        if (message.countryCode === 'vn') {
            objectVietNamRegion = d3.select('#map-viet-nam')
                .select('#VN-' + message.regionCode.toUpperCase());
        }

        let index = 0;

        function rotateColors() {
            let currentColor = colors[index];
            let color = "rgb(" + currentColor.R + "," + currentColor.G + "," + currentColor.B + ")";

            objectCountry.style('fill', color);
            if (objectVietNamRegion) {
                objectVietNamRegion.style('fill', color);
            }

            index++;
            if (index < colors.length)
                setTimeout(rotateColors, 10);
        }

        rotateColors();
    });

    socket.get('message').subscribe((message: Message) => {
        objectTerminalDetect.echo(PROMPT + '[[b;green;]Malware Detected] - Name: [[b;red;]' + message.name + ']');
    });

    socket.get('blacklist').subscribe((message: Message) => {
        objectTerminalBlackList.echo(PROMPT + '[[b;blue;]Black Host Detected] - Remote Host: [[b;red;]' + message.remoteHost + ']');
    });

    objectTerminalDetect = terminalLog.terminal(function () {
    }, {
        greetings: false,
        height: 100,
        prompt: PROMPT
    });

    objectTerminalBlackList = terminalBlackList.terminal(function () {
    }, {
        greetings: false,
        height: 100,
        prompt: PROMPT
    });

    d3.selectAll('path')
        .on('mouseover', function () {
            d3.select(this).style('fill', '#8492a3');
        });
    d3.selectAll('path')
        .on('mouseleave', function () {
            d3.select(this).style('fill', 'white');
        });
});
