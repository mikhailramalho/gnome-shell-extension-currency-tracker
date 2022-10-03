const { GLib, Gio } = imports.gi;
const ByteArray = imports.byteArray;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const fromxml = Me.imports.fromxml;

function fetchPage(from, to, vol) {
    const file = Gio.File.new_for_uri("https://www.x-rates.com/calculator/?from=" + from + "&to=" + to + "&amount=" + vol)
    const [, contents] = file.load_contents(null);
    const xmlText = ByteArray.toString(contents);

    if (xmlText instanceof Uint8Array)
        xmlText = ByteArray.toString(xmlText);

    return xmlText;
};

function fetchTestPage(currency, vol) {
    const file = Gio.File.new_for_path("./dummy.html")
    const [, contents] = file.load_contents(null);
    const xmlText = ByteArray.toString(contents);

    if (xmlText instanceof Uint8Array)
        xmlText = ByteArray.toString(xmlText);

    return xmlText;
};

function loadContentsCb(file, result) {
    try {
        const [, contents] = file.load_contents_finish(result);
        const xmlText = ByteArray.toString(contents);

        if (xmlText instanceof Uint8Array)
            xmlText = ByteArray.toString(xmlText);

        return xmlText;
    } catch (e) {
        logError(e, `Reading ${file.get_basename()}`);
    }

    return "";
}

function getPriceFromPage(xmlText) {
    let match = xmlText.match(/\<span class=\"ccOutputRslt\"\>(.*)/)[0];
    let xmlParsed = fromxml.parseXML(match);
    return parseFloat(xmlParsed.f[0].f[0]);
}


// (async function () {
//     try {
//         const page = await fetchTestPage("USD", 1);
//         // const prices = parsePage(page);
//         // console.log(prices)
//     } catch (error) {
//         log(error)
//     }
// })();

// const loop = new GLib.MainLoop(null, false);
// loop.run()