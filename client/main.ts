import {SocketService} from "./SocketService";
import {Message} from "./Message";

$(document).ready(() => {
    const socket = new SocketService();
    let element = $('#vectorMapWorld');

    let GColor = function (r, g, b) {
        r = (typeof r === 'undefined') ? 0 : r;
        g = (typeof g === 'undefined') ? 0 : g;
        b = (typeof b === 'undefined') ? 0 : b;
        return {r: r, g: g, b: b};
    };

    let createColorRange = function (c1, c2) {
        let colorList = [], tmpColor;
        for (let i = 0; i < 255; i++) {
            tmpColor = GColor(c1.r + ((i * (c2.r - c1.r)) / 255),
                c1.g + ((i * (c2.g - c1.g)) / 255),
                c1.b + ((i * (c2.b - c1.b)) / 255));
            colorList.push(tmpColor);
        }

        return colorList;
    };

    let red = GColor(255, 0, 0);
    let white = GColor(255, 255, 255);
    let colors = createColorRange(red, white);

    socket.get().subscribe((message: Message) => {
        let object = {};

        let pointer = 0;

        function rotateColors() {
            let currentColor = colors[pointer];
            object[message.location] = "rgb(" + currentColor.r + "," + currentColor.g + "," + currentColor.b + ")";
            element.vectorMap('set', 'colors', object);
            pointer++;
            if (pointer < colors.length)
                setTimeout(rotateColors, 1);
        }

        rotateColors();
    });

    let vectorMapDashOptions = {
        map: 'world_en',
        backgroundColor: null,
        color: '#ffffff',
        hoverOpacity: 0.7,
        enableZoom: false,
        showTooltip: true,
        colors: {},
        normalizeFunction: 'polynomial',
        onLabelShow: function (event, label, code) {
            label[0].innerHTML = label[0].innerHTML + " - The state where I live!!";
        }
    };

    element.vectorMap(vectorMapDashOptions);
});
