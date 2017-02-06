/**
 * This file is part of Adguard Browser Extension (https://github.com/AdguardTeam/AdguardBrowserExtension).
 *
 * Adguard Browser Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Adguard Browser Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Adguard Browser Extension.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Dropbox sync settings provider
 *
 * @type {{load, save, isAuthenticated}}
 */
var DropboxSyncProvider = (function () { // jshint ignore:line

    //TODO: Change to real
    var CLIENT_ID = 'nu18d3bocnpkvg5';

    var accessToken;
    var dbx;

    var isAuthorized = function () {
        if (!accessToken) {
            adguard.console.warn("Unauthorized! Please set access token first.");
            return false;
        }

        return true;
    };

    // API
    var load = function (filePath, callback) {
        if (!isAuthorized()) {
            callback(false);
            return;
        }

        dbx.filesDownload({path: '/' + filePath})
            .then(function (response) {
                console.log(response);
                var fileReader = new FileReader();
                fileReader.onload = function () {
                    callback(JSON.parse(this.result));
                };
                fileReader.onerror = function () {
                    adguard.console.error('Error reading file');
                    callback(false);
                };

                fileReader.readAsText(response.fileBlob);
            })
            .catch(function (error) {
                adguard.console.error(error);
                if (error && error.status === 400) {
                    accessToken = null;
                }

                callback(false);
            });
    };

    var save = function (filePath, data, callback) {
        if (!isAuthorized()) {
            callback(false);
            return;
        }

        dbx.filesUpload({path: '/' + filePath, mode: "overwrite", contents: JSON.stringify(data)})
            .then(function () {
                callback(true);
            })
            .catch(function (error) {
                adguard.console.error(error);
                if (error && error.status === 400) {
                    accessToken = null;
                }

                callback(false);
            });
    };

    var getAuthenticationUrl = function (callbackUrl) {
        var dbx = new Dropbox({clientId: CLIENT_ID});
        return dbx.getAuthenticationUrl(callbackUrl);
    };

    var setAccessToken = function (token) {
        accessToken = token;
        dbx = new Dropbox({accessToken: accessToken});
    };

    // EXPOSE
    return {
        /**
         * Loads data from provider
         */
        load: load,
        /**
         * Saves data to provider
         */
        save: save,
        /**
         * Returns dropbox auth url
         */
        getAuthenticationUrl: getAuthenticationUrl,
        /**
         * Sets access token
         */
        setAccessToken: setAccessToken,
        isAuthorized: isAuthorized
    };
})();