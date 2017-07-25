#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var _ = require('lodash');

var countries = [
    'ar',
    'br',
    'cn',
    'de',
    'gb',
    'fr',
    'in',
    'il',
    'kr',
    'jp',
    'ro',
    'ru',
    'vn',
    'vn',
    'vn',
    'vn',
    'vn',
    'vn',
    'vn',
    'vn',
    'vn',
    'vn',
    'vn',
    'vn',
    'vn',
    'vn',
    'vn',
    'us'
];

var names = [
    'Virus.Win32.Sality.A',
    'Virus.Win32.Sality.G',
    'Virus.Win32.Virtob.1',
    'Virus.Win32.Sality.2',
    'Virus.Win32.MadAngel.A',
    'Virus.Win32.Fujack.A',
    'Trojan-Downloader.Win32.Mami.A',
    'Trojan.Win32.Unikey.A',
    'Trojan.Win32.FakeFolder.TH',
    'Trojan.Win32.Shortcut.A',
    'virus.win32.virut.q',
    'Virus.Win32.virut.q',
    'Virus.Win32.sality.og',
    'Virus.Win32.sality.ae',
    'Virus.Win32.gael.a',
    'Virus.Win32.cekar.a',
    'Virus.Win32.xorer.a',
    'Virus.Win32.polip.a',
    'Virus.Win32.polip.b',
    'Virus.Win32.madangle.a',
    'Trojan.Win32.vbdoc.neb',
    'Worm.Win32.viking.aj',
    'Virus.Win32.fujack.cq',
    'Heur.Win32.autorun.a',
    'Heur.Win32.autorun.b',
    'Heur.Win32.autorun.c',
    'Heur.Win32.autorun.d',
    'Heur.Win32.autorun.m',
    'Heur.Win32.fakefolder.7',
    'Virus.Win32.DSteal.Document',
    'Trojan.Win32.WordFake.1',
    'Trojan.Win32.FakeFolder.K2',
    'Trojan.Win32.UsbShortcut.A',
    'Trojan.Win32.UsbShortcut.B',
    'Heur.Win32.ShortCut32.B1',
    'Heur.Win32.ShortCutCMD.B2',
    'Trojan.Win32.PEDocMaker.K',
    'Heur.Win32.ShCAutoIt.B1',
    'Heur.Win32.ShCPeRun.B1',
    'Heur.Win32.TrasherShortcut.B',
    'Heur.Win32.WScriptShortcut.B',
    'Virus.Win32.Sality.K',
    'Virus.Win32.WordFake.K1',
    'Virus.Win32.FakeFolder.K2',
    'Virus.Win32.Usb.Hidedata.Shortcut.K1',
    'Virus.Win32.Usb.Hidedata.Shortcut.K2',
    'Trojan.Win32.WordFake.K1',
    'Virus.Win32.Delf.K1',
    'Trojan.Win32.Agent.Document.K1',
    'Virus.Win32.Agent.Document.K1',
    'Trojan.Win32.DSteal.Document',
    'Trojan.Win32.Dropper.Encrypt.K',
    'Backdoor.Win32.Drop.4102.K',
    'Loader.Win32.Drop.4102.K',
    'Virus.Win32.VTIJ.K',
    'Trojan.Win32.VTIJ.K',
    'Trojan.Win32.UniSpy.H',
    'Trojan-Ransom.Win32.DropA.K',
    'Trojan-Ransom.Win32.DropB.K',
    'Trojan-Ransom.Win32.Zapchast.Decrypt'
];

var times = [
    1, 1, 1, 2, 2, 3, 3, 5
];

var vietnam_regions = [
    13, 20, 84, 34, 78, 98, 99, 97, 96
];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

amqp.connect('amqp://minhdtb:123456@115.146.127.126', function (err, conn) {
    conn.createChannel(function (err, ch) {
        var ex = 'message';
        ch.assertExchange(ex, 'fanout', {durable: false});

        function publish() {
            var countryIndex = getRandomInt(0, countries.length - 1);
            var nameIndex = getRandomInt(0, names.length - 1);
            var sleepTime = getRandomInt(0, times.length - 1);
            var vietnamIndex = getRandomInt(0, vietnam_regions.length - 1);

            var msg = process.argv.slice(2).join(' ') || JSON.stringify({
                name: names[nameIndex],
                domain: 'local.localdomain',
                publicIP: '115.146.127.126',
                location: 'location',
                remoteHost: 'remote',
                macAddress: 'D8-CB-8A-96-1D-A0',
                regionCode: countries[countryIndex] === 'vn' ? vietnam_regions[vietnamIndex] : 1,
                countryCode: countries[countryIndex]
            });

            ch.publish(ex, '', new Buffer(msg));
            console.log(" [x] Sent %s", msg);

            setTimeout(publish, sleepTime * 1000);
        }

        publish();
    });
});