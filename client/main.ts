import {SocketService} from "./SocketService";
import {Message} from "./Message";
import * as d3 from "d3";
import * as _ from "lodash";

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

    let terminalLog = $('#terminal');
    let terminal: Terminal;

    let red = new RGBColor(255, 0, 0);
    let white = new RGBColor(255, 255, 255);
    let colors = createColorRange(red, white);

    socket.get('message').subscribe((message: Message) => {
        let objectCountry = d3.select('#map-world')
            .select('#' + message.countryCode.toUpperCase());

        let objectVietNamRegion = null;
        if (message.countryCode === 'vn') {
            objectVietNamRegion = d3.select('#map-viet-nam')
                .select('#VN-' + message.regionCode);
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
        terminal.echo(PROMPT + '[[b;green;]Malware Detected] - Name: [[b;red;]' + message.name + ']');
    });

    socket.get('blacklist').subscribe((message: Message) => {
        terminal.echo(PROMPT + '[[b;blue;]Black Host Detected] - Remote Host: [[b;red;]' + message.remoteHost + ']');
    });

    $('#console').draggable();

    if (terminalLog.length) {
        terminal = terminalLog.terminal(function () {
        }, {
            greetings: false,
            height: 100,
            prompt: PROMPT
        });
    }

    d3.selectAll('path')
        .on('mouseover', function () {
            d3.select(this).style('fill', '#ccc');
        });

    d3.selectAll('path')
        .on('mouseleave', function () {
            d3.select(this).style('fill', 'white');
        });

    let popup = $('#popup');
    let content = $('#content');
    content.html('');

    let badgeMalware = $('.badge.malware');
    badgeMalware.on('mouseenter', event => {
        event.preventDefault();
        popup.css('left', $(event.target).offset().left + 50);
        popup.css('top', $(event.target).offset().top);
        let name = $(event.target).data('name');
        content.html('');
        $.get('/api/get-region?name=' + name, (data) => {
            _.each(data, function (item, i) {
                let tr = $('<tr>');
                let td = $('<td>').attr('class', 'col-index').text(i + 1);
                tr.append(td);

                td = $('<td>').attr('class', 'col-flag').append($('<span>').attr('class', 'flag-icon flag-icon-' + item.countryCode));
                tr.append(td);

                td = $('<td>').text(item.regionName ? item.regionName : '-');
                tr.append(td);

                td = $('<td>').attr('class', 'col-badge').append($('<span>').attr('class', 'badge label-danger').text(item.count));
                tr.append(td);

                content.append(tr);
            });

            popup.show();
        });
    });

    badgeMalware.on('mouseleave', event => {
        event.preventDefault();
        popup.hide();
    });

    let badgeRemote = $('.badge.remote');
    badgeRemote.on('mouseenter', event => {
        event.preventDefault();
        popup.css('left', $(event.target).offset().left + 50);
        popup.css('top', $(event.target).offset().top);
        let remoteHost = $(event.target).data('host');
        content.html('');
        $.get('/api/get-malware-remote?remoteHost=' + remoteHost, (data) => {
            _.each(data, function (item, i) {
                let tr = $('<tr>');
                let td = $('<td>').attr('class', 'col-index').text(i + 1);
                tr.append(td);

                td = $('<td>').text(item.name);
                tr.append(td);

                td = $('<td>').attr('class', 'col-badge').append($('<span>').attr('class', 'badge label-danger').text(item.count));
                tr.append(td);

                content.append(tr);
            });

            popup.show();
        });
    });

    badgeRemote.on('mouseleave', event => {
        event.preventDefault();
        popup.hide();
    });

    let badgeRegion = $('.badge.region');
    badgeRegion.on('mouseenter', event => {
        event.preventDefault();
        let countryCode = $(event.target).data('country-code');
        let regionCode = $(event.target).data('region-code');
        content.html('');
        $.get('/api/get-malware-region?countryCode=' + countryCode + '&regionCode=' + regionCode, (data) => {
            _.each(data, function (item, i) {
                let tr = $('<tr>');
                let td = $('<td>').attr('class', 'col-index').text(i + 1);
                tr.append(td);

                td = $('<td>').text(item.name);
                tr.append(td);

                td = $('<td>').attr('class', 'col-badge').append($('<span>').attr('class', 'badge label-danger').text(item.count));
                tr.append(td);

                content.append(tr);
            });

            popup.css('left', $(event.target).offset().left - popup.width());
            popup.css('top', $(event.target).offset().top);
            popup.show();
        });
    });

    badgeRegion.on('mouseleave', event => {
        event.preventDefault();
        popup.hide();
    });

    $('#table-malware').dataTable({
        bAutoWidth: false,
        aoColumns: [
            {sWidth: '5%'},
            {sWidth: '85%'},
            {sWidth: '10%'},
        ]
    });
    $('#table-region').dataTable({
        bAutoWidth: false,
        aoColumns: [
            {sWidth: '5%'},
            {sWidth: '45%'},
            {sWidth: '40%'},
            {sWidth: '10%'},
        ]
    });

    $('#table-remote').dataTable({
        bAutoWidth: false,
        aoColumns: [
            {sWidth: '5%'},
            {sWidth: '85%'},
            {sWidth: '10%'},
        ]
    });
});
