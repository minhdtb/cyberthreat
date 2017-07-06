import {SocketService} from "./SocketService";
import {Message} from "./Message";

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
    let element = $('#map-world');

    let red = new RGBColor(255, 0, 0);
    let white = new RGBColor(255, 255, 255);
    let colors = createColorRange(red, white);

    socket.get().subscribe((message: Message) => {
        let object = {};
        let index = 0;

        function rotateColors() {
            let currentColor = colors[index];
            object[message.countryCode] = "rgb(" + currentColor.R + "," + currentColor.G + "," + currentColor.B + ")";
            element.vectorMap('set', 'colors', object);
            index++;

            if (index < colors.length)
                setTimeout(rotateColors, 1);
        }

        rotateColors();
    });

    let options = {
        map: 'world_en',
        backgroundColor: null,
        color: '#ffffff',
        hoverOpacity: 0.7,
        enableZoom: false,
        showTooltip: true,
        normalizeFunction: 'polynomial',
        onLabelShow: function (event, label, code) {

        }
    };

    element.vectorMap(options);
});
