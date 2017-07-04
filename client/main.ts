import {SocketService} from "./SocketService";
import {Message} from "./Message";

$(document).ready(() => {
    const socket = new SocketService();

    socket.get().subscribe((message: Message) => {
        console.log(message.name);
    });

    let element = $('#vectorMapWorld');
    if (element.get(0)) {
        let vectorMapDashOptions = {
            map: 'world_en',
            backgroundColor: null,
            color: '#ffffff',
            hoverOpacity: 0.7,
            enableZoom: false,
            showTooltip: true,
            colors: {

            },
            normalizeFunction: 'polynomial',
            onLabelShow: function (event, label, code) {
                label[0].innerHTML = label[0].innerHTML + " - The state where I live!!";
            }
        };

        element.vectorMap(vectorMapDashOptions);
    }
});
