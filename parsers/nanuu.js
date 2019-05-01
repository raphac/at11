var cheerio = require('cheerio');
require('./parserUtil');

module.exports.parse = function(html, date, callback) {
    var $ = cheerio.load(html);
    var dayMenu = [];

    var menus = $(`div.news-list-container div.news-list-item`);
    menus.each(function() {
        var elem = $(this)[0];
        var children = [];
        allDescendants(elem, children);

        var found;
        var text = "";
        for (var i = 0; i < children.length; i++) {
            var tableChild = children[i];
            var nodeValue = tableChild.nodeValue;
            if (nodeValue !== undefined && nodeValue !== null) {
                if (nodeValue.includes("CHF")) {
                    found = tableChild;
                    break;
                } else {
                    var t = nodeValue.trim();
                    if (t) {
                        text += normalize(t) + " ";
                    }
                }
            }
        }

        if (found !== undefined) {
            var price = parseFloat(found.nodeValue.replace("CHF", "").trim());
            dayMenu.push({ isSoup: false, text: text, price: price });
        }
    });

    callback(dayMenu);

    function normalize(str) {
        return str.normalizeWhitespace()
            .removeMetrics()
            .correctCommaSpacing()
            .removeItemNumbering();
    }

    function allDescendants(node, children) {
        if (node.childNodes !== null) {
            for (var i = 0; i < node.childNodes.length; i++) {
                var child = node.childNodes[i];
                children.push(child);
                allDescendants(child, children);
            }
        }
    }
};
