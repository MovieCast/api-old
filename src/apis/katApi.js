import request from 'request-promise';
import cheerio from 'cheerio';
import logger from '../logger';

/**
 * A server version of the kat api
 * @class KatApi
 */
export default class KatApi {
    constructor() {
        this.url = 'https://kat.cr/usearch/';
        this.logger = new logger();
        this.request = request.defaults({
            "headers": {
                "Accept-Encoding": "gzip, deflate"
            },
            "gzip": true
        });
    }

    /**
     * Formats the page into an object
     * @param {Number} page - The page number
     * @param {$} $ - The loaded instance of cheerio
     * @return {Object} The parsed page object
     */
    parsePage(page, $) {
        return new Promise(resolve => {
            // Lets pretend we are an api.  
            const matcher = /\s+[a-zA-Z]+\s\d+[-]\d+\s[a-zA-Z]+\s(\d+)/;
            const totalPages = $("div.pages.botmarg5px.floatright").children("a.turnoverButton.siteButton.bigButton").last().text();
            const totalResults = $("table#mainSearchTable.doublecelltable").find("h2").find("span").text().match(matcher)[1];
            
            const result = {
                page: parseInt(page),
                totalPages: parseInt(totalPages || 1),
                totalResults: parseInt(totalResults),
                results: []
            };
            
            // Get the torrents from the page and parse them.   
            $("table.data").find("tr[id]").each(function() {
                const torrent = {
                    title: $(this).find("a.cellMainLink").text(),
                    category: $(this).find("span.font11px.lightgrey.block").find("a[href]").last().text(),
                    link: $(this).find("a.cellMainLink[href]").attr("href"),
                    guid: $(this).find("a.cellMainLink[href]").attr("href"),
                    verified: $(this).find("i.ka.ka16.ka-verify.ka-green").length,
                    comments: parseInt($(this).find("a.icommentjs.kaButton.smallButton.rightButton").text()),
                    magnet: $(this).find("a.icon16[data-nop]").attr("href"),
                    torrentLink: $(this).find("a.icon16[data-download]").attr("href"),
                    size: parseInt($(this).find("td.center").eq(0).text()),
                    files: parseInt($(this).find("td.center").eq(1).text()),
                    pubDate: Number(new Date($(this).find("td.center").eq(2).attr("title"))),
                    seeds: parseInt($(this).find("td.center").eq(3).text()),
                    leechs: parseInt($(this).find("td.center").eq(4).text())
                };
                torrent.peers = torrent.seeds + torrent.leechs;
                result.results.push(torrent);
            });
            
            resolve(result);
        });
    }

    /**
     * Converts an query object into a string
     * @param {Object} qObject - The query
     * @return {String} The formatted query string.
     */
    createQuery(qObject) {
        let query = "";

        // Incase you want to add anything thats not in the list below...
        if (qObject.query) query += qObject.query;

        if (qObject.category) query += " category:" + qObject.category;
        if (qObject.uploader) query += " user:" + qObject.uploader;
        if (qObject.adult_filter) query += " is_safe:" + qObject.adult_filter;
        if (qObject.verified) query += " verified:" + qObject.verified;
        if (qObject.page) query += "/" + qObject.page;
        if (qObject.sort_by) query += "/?field=" + qObject.sort_by;
        if (qObject.order) query += "&order=" + qObject.order;

        return query;
    }

    /**
     * Does the search request on kat.cr and returns a parsed page object with all the torrents on that page.
     * @param {Object} qObject - The query object
     * @return {Object} The parsed page object
     */
    search(qObject) {
        return new Promise((resolve, reject) => {
            let options = {
                uri: this.url + this.createQuery(qObject),
                transform: function (body) {
                    return cheerio.load(body);
                }
            }

            this.request(options)
                .then($ => {
                    this.parsePage(qObject.page || 1, $)
                        .then(resolve)
                        .catch(reject);
                })
                .catch(reject);
        });
    }
}