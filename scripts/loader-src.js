/**
 * loader-src.js
 *
 * The given script is intended for loading and caching js and css files in local storage.
 *
 * The cache is controlled based on the version of the flies and the variants of the caching.
 * There are three options for caching files:
 *      0: no cache
 *      1: cache, but if the file is not in the cache or the version of the file does not match,
 *          then the file is downloaded twice, once with a regular browser method and the second time
 *          through Ajax in the cache;
 *      2: cache, but use only through the cache. First, the file is loaded into the cache, and then
 *          injected into the DOM. Thus, the file is loaded only once.
 * Variants 0 and 1 are used for the convenience of debugging development tools in browsers,
 * option 2 for production.
 *
 * The load () method, which directly starts the boot process, takes two parameters, two configurations
 * whose structure is identical, but if both parameters are passed, then the configs first merging, and
 * in the resulting config the parameters in the first config have a higher weight, i.e. if the equals
 * keys in first and second config, the values are taken from the first configuration, if the keys are
 * different then the resulting configuration will have the data of both the first and second configurations.
 * This feature is implemented to ensure the scalability of the project, of which the script is a part.
 *
 * Loading is carried out in two stages. At the first stage, a file with versions of scripts and styles is
 * loaded, in the second stage files with versions of which do not correspond to the versions of files in the
 * cache are downloaded.
 *
 * The order of file downloads can be changed by specifying files in the properties after which files can
 * start the download.
 *
 * At the end of the download, the callback () specified in the configuration file is executed.
 *
 * The source code is written in accordance with the requirements of es6. This implementation was written
 * to use obfuscation of code closure compiler from google, with ADVANCED_OPTIMIZATIONS, es6 -> es5.
 * --------------------------------------------------------------------------------------------------------
 *
 * [rus]
 * Данный скрипт предназначен для загрузки и кеширования js и css файлов в локал сторадже.
 *
 * Контроль кеша осуществляется на основании версии файлов и варианта кеширования.
 * Есть три варианта кеширования файлов:
 * 		0: не кешировать;
 * 		1: кешировать, но если файла нет в кеше либо не соответствует версия файла, то файл прогружается дважды,
 * 			один раз штатно браузером и второй раз через аякс в кеш;
 * 		2: Кешировать, но использование только через кеш. Сначала файл загружается в кеш, а потом инжектися в DOM.
 *          Таким образом файл загружается всего один раз.
 * Варианты 0 и 1 используются для удобства отладки средствами разработки у браузеров, вариант 2 для продакшена.
 *
 * Метод load(), который непосредственно запускает процесс загрузки, принимает два параметра - две конфигурации,
 * структура которых идентична, но если переданы оба параметра то конфиги предварительно сливаются, причем, в
 * результирующем конфиге параметры в первом файле имеют больший вес, т.е. при совпадающих ключах первого и второго
 * конфига значения берутся из первой конфигурации, если ключи разные то результирующая конфигурация будет иметь
 * данные и первой и второй конфигурации. Данная фича реализована для обеспечения масштабируемости проекта, частью
 * которого является данный скрипт.
 *
 * Загрузка производится в два этапа. На первом этапе загружается файл с версиями скриптов и стилей, во втором этапе
 * загружаются файлы версии которых не сооответствуют версиям файлов в кеше.
 *
 * Порядок загрузки файлов можно менять указав в свойствах после каких скриптов можно начинать загрузку.
 *
 * По окончанию загрузки выполняется callback() указанный в конфигурационном файле.
 *
 * Исходный текст написан в соответствии требований es6. данная реализация написана для использования обфускации
 * кода closurecompiler от google, ADVANCED_OPTIMIZATIONS, es6 -> es5.
 * -------------------------------------------------------------------------------------------------------------
 * */

'use strict';

/* exported CacheScriptLoad */

/**
 * if true then enable output to console
 * @define {boolean} */
const info = true;

/**
 * Part of the software package "Ws2Pg" for working with PostgreSQL over WebSocket.
 *
 * Simple localStorage based caching of JavaScript and css files.
 * Cache variants see [cacheUseVariant]{@link CacheScriptLoad#cacheUseVariant}.
 * Support script load order after loaded other scripts if need see [cfg]{@link CacheScriptLoad#cfg}.
 * After loading scripts may be run callback function see [cfg]{@link CacheScriptLoad#cfg}.
 *
 * thanks to the author ideas:
 * https://github.com/webpgr/cached-webpgr.js http://webpgr.com by Falko Krause <falko@webpgr.com>
 *
 * @author Dmitry Teikovcev <daimon243@gmail.com>
 * @version 1.2.1-snapshot.23
 * */
class CacheScriptLoad {

    /**
     * Loader constructor.
     * Performed tasks: only declare members
     * */
    constructor() {
        // members used in load
        /**
         * Config contaned need load scripts.
         * This is the result of merging the two configs of the user and the default config
         * structure object example:
         * <xmp>
         *  {
         *      modules: {
         *          module1: {
         *              load: {
         *                  url: '<path to module1.js>',
         *                  version: '<version module1 for cache>',
         *                  cache: <cahe type see cacheUseVariant>
         *                  after:[ <load script after loaded this scripts > ],
         *              }
         *          },
         *          module2: {
         *              load: {
         *                  url: '<path to module2.js>',
         *                  version: '<version module2 for cache>',
         *                  cache: <cahe type see cacheUseVariant>
         *              }
         *          },
         *          ...
         *      }
         *      onLoad: () => {
         *          [<Actions after loading scripts>]
         *      }
         *  }
         * </xmp>
         * @summary load config
         * @type {Object}
         * */
        this.cfg = null;

        /**
         * Array scripts for load. Contains loadin stage.
         * @type {Object}
         * */
        this.scripts = null;

        /**
         * loading stages
         * @enum {number}
         * */
        this.stages = {

            /** in this time load not started */
            needed: 0,

            /** load already started */
            started: 1,

            /** already loaded */
            fin: 2
        };

        /**
         * variants scripts cache
         * @enum {number}
         * */
        this.cacheUseVariant = {

            /** no cache load as script.src with each page refresh */
            noCache: 0,

            /** duble load as script.src if not in cache and load to cahe for next usage */
            cacheSimple: 1,

            /** first loaded into the cache and only then use as script.appendChild(scriptContent); */
            cacheOnly: 2
        };
    }

    /**
     * Begin loading scripts after merge userConfig and defaultConfig
     * @param {Object} userConfig child config
     * @param {Object} defaultConfig default config, merging with child config
     * */
    load(userConfig, defaultConfig) {
        if (defaultConfig) {
            this.cfg = this.jsonMergeRecursive(userConfig, defaultConfig);
        } else {
            this.cfg = userConfig;
        }
        this.scripts = {};
        for (let scriptname in this.cfg.modules) {
            if (!Object.prototype.hasOwnProperty.call(this.cfg.modules, scriptname)) {
                continue;
            }
            this.scripts[scriptname] = this.cfg.modules[scriptname].load;
            this.scripts[scriptname].isLoaded = this.stages.needed;
        }
        this.tryLoad();
    }

    /**
     * get config for debug in console or for later use
     * @returns {Object} merged loader config
     * */
    getcfg() {
        return this.cfg;
    }

    /**
     * check loading stage
     * See [CacheScriptLoad stages members]{@link CacheScriptLoad#stages}.
     * @param {string} scriptname name loading script
     * @returns {boolean} true if all stage passed
     * */
    checkIsLoaded(scriptname) {
        return this.scripts[scriptname].isLoaded === this.stages.fin;
    }

    /**
     * check loading stage
     * See [CacheScriptLoad stages members]{@link CacheScriptLoad#stages}.
     * @param {string} scriptname name loading script
     * @returns {boolean} true if need load script
     * */
    isNeeded(scriptname) {
        return this.scripts[scriptname].isLoaded === this.stages.needed;
    }

    /**
     * try load script. If you need to download another script before
     * loading the script, wait until another script loads.
     * This function is called recursively at the end of loading each script
     * until all the scripts are loaded. When all the scripts are loaded, we call the
     * callback if it was specified
     * */
    tryLoad() {
        let isAllLoaded = true;
        for (let scriptname in this.scripts) {
            if (this.isNeeded(scriptname)) {
                isAllLoaded = false;
                let afterScripts = this.scripts[scriptname].after;
                let loadAccess = true;
                if (afterScripts) {
                    for (let ii = 0, ilen = afterScripts.length; ii < ilen; ii++) {
                        if (!this.checkIsLoaded(afterScripts[ii])) {
                            loadAccess = false;
                            if (info) {
                                console.log('load script:"%s" need load after:"%s"', scriptname, afterScripts[ii]);
                            }
                            break;
                        }
                    }
                }
                if (loadAccess && this.scripts[scriptname].isLoaded !== this.stages.started) {
                    this.scripts[scriptname].isLoaded = this.stages.started;
                    if (info) {
                        console.log('load script started %s', scriptname);
                    }
                    this.requireScript(scriptname);
                    // isAllLoaded = false;
                }
            }
            if(!this.checkIsLoaded(scriptname)) {
                isAllLoaded = false;
            }
        }
        if(isAllLoaded) {
            if (info) {
                console.log('all script loaded');
            }
            if (this.cfg.onLoad) {
                this.cfg.onLoad();
            }
        }
    }

    /**
     * finalize load file. Set stage to fin and check if need load other files.
     * @param {string} name script name
     * */
    loadFin(name) {
        this.scripts[name].isLoaded = this.stages.fin;
        if (info) {
            console.log('cacheScript script ready %s', name);
        }
        this.tryLoad();
    }

    /**
     * get script via XMLHttpRequest and cache to local storage after load.
     * @param {string} name localStorage identifier; shoud be the same as on the server-side
     * @param {string} version shoud be on the same server
     * @param {string} url path/to/script.[js,css]
     * @param {number} cache cashe type
     * */
    cacheScript(name, version, url, cache) {
        if (cache !== this.cacheUseVariant.noCache) {
            let xmlhttp = new XMLHttpRequest();
            this.addEvent(xmlhttp, 'readystatechange', () => {
                let successful = 200, done = 4;
                if (xmlhttp.readyState === done) {
                    if (xmlhttp.status === successful) {
                        localStorage.setItem(name, JSON.stringify({
                            content: xmlhttp.responseText,
                            version: version
                        }));
                        if(cache === this.cacheUseVariant.cacheOnly) {
                            this.appendScriptNode(xmlhttp.responseText, url);
                        }
                        this.loadFin(name);
                    } else if (info) {
                        console.warn('error loading %s', url);
                    }
                }
            });
            xmlhttp.open('GET', url, true);
            xmlhttp.send();
        } else {
            this.loadFin(name);
        }
    }

    /**
     * Regular browser method for load script from url. Add event handler onLoad.
     * if cache variant not cacheOnly then add node to document header.
     * @param {string} url path/to/script.[js,css]
     * @param {string} scriptname (see `requireScript`)
     * @param {number} cache (see `requireScript`)
     * @param {string} version (see `requireScript`)
     * */
    loadScript(url, scriptname, cache, version) {
        let extLength = 3;
        let script = null, scriptType = url.substring(url.length - extLength);
        if (scriptType === '.js') {
            script = document.createElement('script');
        } else if (scriptType === 'css') {
            script = document.createElement('link');
        }

        if (script.readyState) { // IE
            this.addEvent(script, 'readystatechange', () => {
                // event.target
                if (script.readyState === 'loaded' || script.readyState === 'complete') {
                    script.onreadystatechange = null;
                    this.cacheScript(scriptname, version, url, cache);
                }
            });
        } else { // Others
            this.addEvent(script, 'load', () => {
                this.cacheScript(scriptname, version, url, cache);
            });
        }

        if (cache !== this.cacheUseVariant.cacheOnly) {
            if (scriptType === '.js') {
                script.setAttribute('src', url);
            } else if (scriptType === 'css') {
                script.setAttribute('href', url);
                script.setAttribute('rel', 'stylesheet');
                script.setAttribute('type', 'text/css');
                script.setAttribute('media', 'screen, projection');
            }
            document.getElementsByTagName('head')[0].appendChild(script);
        } else {
            this.cacheScript(scriptname, version, url, cache);
        }
    }

    /**
     * Injects a script loaded from localStorage into the DOM.
     * If the script version is differnt than the requested one, the localStorage key is
     * cleared and a new version will be loaded next time.
     * @param {string} jsonContent wrapped serialized code
     * @param {string} url path/to/script.[js,css]
     * @param {string} scriptname (see `requireScript`)
     * @param {string} version (see `requireScript`)
     * @param {number} cache cache type
     */
    injectScript(jsonContent, url, scriptname, version, cache) {
        let content = JSON.parse(jsonContent);
        // cached version is not the request version, clear the cache, this will trigger a reload next time
        if (content.version !== version) {
            localStorage.removeItem(scriptname);
            this.loadScript(url, scriptname, cache, version);
            return;
        }
        this.appendScriptNode(content.content, url);
        this.scripts[scriptname].isLoaded = this.stages.fin;
        if (info) {
            console.log('injectScript script ready %s', scriptname);
        }
        this.tryLoad();
    }

    /**
     * Add node for loaded script or style in document header
     * @param {string} content script body
     * @param {string} url script or style url
     * */
    appendScriptNode(content, url) {
        let extLength = 3;
        let scriptType = url.substring(url.length - extLength);

        if (scriptType === '.js') {
            // if loaded script
            let script = document.createElement('script');
            script.type = 'text/javascript';
            script.text = content;
            document.getElementsByTagName('head')[0].appendChild(script);
        } else if (scriptType === 'css') {
            // if loaded style
            let style = document.createElement('style');
            style.type = 'text/css';
            style.rel = 'stylesheet';
            style.media = 'screen, projection';
            if (style.styleSheet) {   // for IE
                style.styleSheet.cssText = content;
            } else {                // others
                let textnode = document.createTextNode(content);
                style.appendChild(textnode);
            }
            document.getElementsByTagName('head')[0].appendChild(style);
        }
    }

    /**
     * Start load or inject content. If the requested script is not available in the localStorage
     * it will be loaded from the provided url. If the script is present in the localStorage
     * it will be injected into the DOM.
     * @param {string} scriptname identifier of the script in the local cache
     * */
    requireScript(scriptname) {
        //
        /** version string that is used to check if the script needs to be updated
         * @type {string} */
        let version = this.scripts[scriptname].version;

        /** `path/to/script.js` that should be caced; can be local (or cross domain with CORS header allowing cross domain access)
         * @type {string} */
        let url = this.scripts[scriptname].url;

        /** If for requested script cache is not required
         * @type {number} */
        let cache = this.scripts[scriptname].cache;

        /** content from local Storage
         * @type {string|null} */
        let content = localStorage.getItem(scriptname);

        if (content && cache !== this.cacheUseVariant.noCache) {
            // if content persist in localStorage and cache caching is possible
            this.injectScript(content, url, scriptname, version, cache);
        } else {
            // else load and cache script if need
            this.loadScript(url, scriptname, cache, version);
        }
    }

    /**
     * Add event to element for handle after script loaded
     * @param {*} element pointer to element
     * @param {string} eventType events for add
     * @param {Function} eventHandle pointer to handle
     * */
    addEvent(element, eventType, eventHandle) {
        let on = 'on';
        if (element.addEventListener) {
            element.addEventListener(eventType, eventHandle, false);
        } else if (element.attachEvent) {
            element.attachEvent(on + eventType, eventHandle);
        } else {
            element[on + eventType] = eventHandle;
        }
    }

    /**
     * Recursively merge two objects. In the resulting object the parameters from the first object
     * have a higher weight, i.e. if the equals keys in first and second object, the values are taken
     * from the first object, if the keys are different then the resulting object will have the data from both.
     * Thanks Олег Савватеев, г.Тамбов  O.Savvateev@gmail.com
     * @param {Object} json1 first json object
     * @param {Object} json2 second json object
     * @returns {Object} merged json object
     * */
    jsonMergeRecursive(json1, json2) {
        let out = {};
        for (let k1 in json1) {
            if (json1.hasOwnProperty(k1)) {
                out[k1] = json1[k1];
            }
        }
        for (let k2 in json2) {
            if (json2.hasOwnProperty(k2)) {
                if (!out.hasOwnProperty(k2)) {
                    out[k2] = json2[k2];
                } else if (
                    typeof out[k2] === 'object' &&
                    out[k2].constructor === Object &&
                    typeof json2[k2] === 'object' &&
                    json2[k2].constructor === Object) {
                    out[k2] = this.jsonMergeRecursive(out[k2], json2[k2]);
                }
            }
        }
        return out;
    }
}

if ('loader' in window) {
    document.write('error create loader');
} else {
    window.loader = new CacheScriptLoad();
    // Need, when using ADVANCED_OPTIMIZATIONS in closure compilers for out calling this method
    window.loader.getcfg();
}
