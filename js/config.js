var config = {
	language:    "en",
	timeFormat:   24, //12
	units:       "metric", // imperial
	latitude:    "51.5085",
	longitude:   "-0.1257",
	location:    "London",
	locationID:  "2643743",
	timezone:    "Europe/London",
	decimal: ".",
	appid: '1041444a18cfb8448343254a45721b1d',
	customCss: "css/main.css",
	webServer: true,
	useHttps: true,
	httpsPrivateKey: "",
	httpsCertificate: "",

	modules: [
		{
			module: "alert",
			disabled: false,
		},
		{
			module: 'connection',
			position: 'top_center',
			disabled: false,
		},
		{
			module: "clock",
			position: "top_left",
			disabled: false,
		},
		{
			module: "swatch",
			position: "top_left",
			disabled: false,
		},
		{
			module: 'monthly',
			position: 'top_center',
			disabled: false,
		},
		{
			module: 'calendar',
			position: 'top_left',
			disabled: false,
		},
		{
			module: "weather",
			position: "top_right",
			disabled: false,
		},
		{
			module: "hourly",
			position: "top_right",
			disabled: false,
		},
		{
			module: "forecast",
			position: "top_right",
			disabled: false,
		},
        {
			module: "compliments",
			position: "middle_center",
			disabled: false,
		},
		{
			module: 'rssnews',
			position: 'lower_third',
			disabled: false,
		},
	]
};
/*************** DO NOT EDIT BELOW THIS LINE ***************/
if (typeof module !== "undefined") {module.exports = config;}
var defaults = {
	paths: {
		modules: "modules",
		vendor: "js",
	},
};
if (typeof module !== "undefined") {module.exports = defaults;}
var vendor = {
	"moment.js"              : "../js/moment-with-locales.min.js",
	"moment-timezone.js"     : "../js/moment-timezone-with-data.min.js",
	"weather-icons.css"      : "../css/fonts.css",
	"weather-icons-wind.css" : "../css/fonts.css",
	"font-awesome.css"       : "../css/fonts.css",
	"suncalc.js"             : "../js/suncalc.js",
};
if (typeof module !== "undefined"){module.exports = vendor;}
var translations = {};
if (typeof module !== "undefined") {module.exports = translations;}
(function () {
    var bodysize = 1080;
    $('body').css({'background':'black', 'min-width': (bodysize-10) + 'px'});
    function resizew(){
		if (window.innerWidth < bodysize){
			$('body').css({
				'transform':'scale(' + window.innerWidth / bodysize + ')',
				'-webkit-transform':'scale(' + window.innerWidth / bodysize + ')'
			});
		} else {
			$('body').css({
				'transform':'scale(1)',
				'-webkit-transform':'scale(1)'
			});
		}
	} setInterval(resizew,100);

	/*

    function changeStyle() {
		var now = new Date();
        if ((0 <= now.getHours() && now.getHours() < 7) && (0 <= now.getMinutes() && now.getMinutes() < 59) && (0 <= now.getSeconds() && now.getSeconds() < 59)) {
            $('body').css({'opacity':'0.5', '-webkit-filter':'grayscale(50%)'});
        }
        if ((7 <= now.getHours() && now.getHours() < 8) && (0 <= now.getMinutes() && now.getMinutes() < 59) && (0 <= now.getSeconds() && now.getSeconds() < 59)) {
            $('body').css({'opacity':'0.7', '-webkit-filter':'grayscale(30%)'});
        }
        if ((9 <= now.getHours() && now.getHours() < 23) && (0 <= now.getMinutes() && now.getMinutes() < 59) && (0 <= now.getSeconds() && now.getSeconds() < 59)) {
            $('body').css({'opacity':'1', '-webkit-filter':'grayscale(0%)'});
        }
        if ((23 <= now.getHours() && now.getHours() < 24) && (0<= now.getMinutes() && now.getMinutes() < 59) && (0 <= now.getSeconds() && now.getSeconds() < 59)) {
            $('body').css({'opacity':'0.7', '-webkit-filter':'grayscale(30%)'});
        }
    } setInterval(changeStyle,1000);

    */
    
	var initializing = false;
	var fnTest = /xyz/.test(function () { xyz; }) ? /\b_super\b/ : /.*/;
	this.Class = function () {};
	Class.extend = function (prop) {
		var _super = this.prototype;
		initializing = true;
		var prototype = new this();
		initializing = false;
		for (var name in prototype) {
			prototype[name] = cloneObject(prototype[name]);
		}
		for (var name in prop) {
			prototype[name] = typeof prop[name] === "function" &&
				typeof _super[name] === "function" && fnTest.test(prop[name]) ? (function (name, fn) {
					return function () {
						var tmp = this._super;
						this._super = _super[name];
						var ret = fn.apply(this, arguments);
						this._super = tmp;
						return ret;
					};
				})(name, prop[name]) : prop[name];
		}
		function Class() {
			if (!initializing && this.init) {
				this.init.apply(this, arguments);
			}
		}
		Class.prototype = prototype;
		Class.prototype.constructor = Class;
		Class.extend = arguments.callee;
		return Class;
	};
})();
function cloneObject(obj) {
	if (obj === null || typeof obj !== "object") {
		return obj;
	}
	var temp = obj.constructor();
	for (var key in obj) {
		temp[key] = cloneObject(obj[key]);
		if (key === "lockStrings") {
			Log.log(key);
		}
	}
	return temp;
}
if (typeof module !== "undefined") {
	  module.exports = Class;
}
var Translator = (function() {
	function loadJSON(file, callback) {
		var xhr = new XMLHttpRequest();
		xhr.overrideMimeType("application/json");
		xhr.open("GET", file, true);
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4 && xhr.status === 200) {
				callback(JSON.parse(stripComments(xhr.responseText)));
			}
		};
		xhr.send(null);
	}
	function stripComments(str, opts) {
		var singleComment = 1;
		var multiComment = 2;
		function stripWithoutWhitespace() {
			return "";
		}
		function stripWithWhitespace(str, start, end) {
			return str.slice(start, end).replace(/\S/g, " ");
		}
		opts = opts || {};
		var currentChar;
		var nextChar;
		var insideString = false;
		var insideComment = false;
		var offset = 0;
		var ret = "";
		var strip = opts.whitespace === false ? stripWithoutWhitespace : stripWithWhitespace;
		for (var i = 0; i < str.length; i++) {
			currentChar = str[i];
			nextChar = str[i + 1];
			if (!insideComment && currentChar === "\"") {
				var escaped = str[i - 1] === "\\" && str[i - 2] !== "\\";
				if (!escaped) {
					insideString = !insideString;
				}
			}
			if (insideString) {
				continue;
			}
			if (!insideComment && currentChar + nextChar === "//") {
				ret += str.slice(offset, i);
				offset = i;
				insideComment = singleComment;
				i++;
			} else if (insideComment === singleComment && currentChar + nextChar === "\r\n") {
				i++;
				insideComment = false;
				ret += strip(str, offset, i);
				offset = i;
				continue;
			} else if (insideComment === singleComment && currentChar === "\n") {
				insideComment = false;
				ret += strip(str, offset, i);
				offset = i;
			} else if (!insideComment && currentChar + nextChar === "/*") {
				ret += str.slice(offset, i);
				offset = i;
				insideComment = multiComment;
				i++;
				continue;
			} else if (insideComment === multiComment && currentChar + nextChar === "*/") {
				i++;
				insideComment = false;
				ret += strip(str, offset, i + 1);
				offset = i + 1;
				continue;
			}
		}
		return ret + (insideComment ? strip(str.substr(offset)) : str.substr(offset));
	}
	return {
		coreTranslations: {},
		coreTranslationsFallback: {},
		translations: {},
		translationsFallback: {},
		translate: function(module, key, variables) {
			variables = variables || {};
			function createStringFromTemplate(template, variables) {
				if(Object.prototype.toString.call(template) !== "[object String]") {
					return template;
				}
				if(variables.fallback && !template.match(new RegExp("\{.+\}"))) {
					template = variables.fallback;
				}
				return template.replace(new RegExp("\{([^\}]+)\}", "g"), function(_unused, varName){
					return variables[varName] || "{"+varName+"}";
				});
			}
			if(this.translations[module.name] && key in this.translations[module.name]) {
				return createStringFromTemplate(this.translations[module.name][key], variables);
			}
			if (key in this.coreTranslations) {
				return createStringFromTemplate(this.coreTranslations[key], variables);
			}
			if (this.translationsFallback[module.name] && key in this.translationsFallback[module.name]) {
				return createStringFromTemplate(this.translationsFallback[module.name][key], variables);
			}
			if (key in this.coreTranslationsFallback) {
				return createStringFromTemplate(this.coreTranslationsFallback[key], variables);
			}
			return key;
		},
		load: function(module, file, isFallback, callback) {
			if (!isFallback) {
//				Log.log(module.name + " - Load translation: " + file);
			} else {
//				Log.log(module.name + " - Load translation fallback: " + file);
			}
			var self = this;
			if(!this.translationsFallback[module.name]) {
				loadJSON(module.file(file), function(json) {
					if (!isFallback) {
						self.translations[module.name] = json;
					} else {
						self.translationsFallback[module.name] = json;
					}
					callback();
				});
			} else {
				callback();
			}
		},
		loadCoreTranslations: function(lang) {
			var self = this;
			if (lang in translations) {
//				Log.log("Loading core translation file: " + translations[lang]);
				loadJSON(translations[lang], function(translations) {
					self.coreTranslations = translations;
				});
			} else {
//				Log.log("Configured language not found in core translations.");
			}
			self.loadCoreTranslationsFallback();
		},
		loadCoreTranslationsFallback: function() {
			var self = this;
			for (var first in translations) {break;}
			if (first) {
//				Log.log("Loading core translation fallback file: " + translations[first]);
				loadJSON(translations[first], function(translations) {
					self.coreTranslationsFallback = translations;
				});
			}
		},
	};
})();
var Module = Class.extend({
	requiresVersion: "2.10.0",
	defaults: {},
	showHideTimer: null,
	lockStrings: [],
	init: function () {
//		Log.log(this.defaults);
	},
	start: function () {
		Log.info("Starting module: " + this.name);
	},
	getScripts: function () {
		return [];
	},
	getStyles: function () {
		return [];
	},
	getTranslations: function () {
		return false;
	},
	getDom: function () {
		var self = this;
		return new Promise(function(resolve) {
			var div = document.createElement("div");
		});
	},
	getHeader: function () {
		return this.data.header;
	},
	notificationReceived: function (notification, payload, sender) {
		if (sender) {
//			Log.log(this.name + " received a module notification: " + notification + " from " + sender.name);
		} else {
//			Log.log(this.name + " received a system notification: " + notification);
		}
	},

	suspend: function () {
		Log.log(this.name + " is suspended.");
	},
	resume: function () {
		Log.log(this.name + " is resumed.");
	},
	setData: function (data) {
		this.data = data;
		this.name = data.name;
		this.identifier = data.identifier;
		this.hidden = false;
		this.setConfig(data.config);
	},
	setConfig: function (config) {
		this.config = Object.assign({}, this.defaults, config);
	},
	file: function (file) {
		return (this.data.path + "/" + file).replace("//", "/");
	},
	loadStyles: function (callback) {
		this.loadDependencies("getStyles", callback);
	},
	loadScripts: function (callback) {
		this.loadDependencies("getScripts", callback);
	},
	loadDependencies: function (funcName, callback) {
		var self = this;
		var dependencies = this[funcName]();
		var loadNextDependency = function () {
			if (dependencies.length > 0) {
				var nextDependency = dependencies[0];
				Loader.loadFile(nextDependency, self, function () {
					dependencies = dependencies.slice(1);
					loadNextDependency();
				});
			} else {
				callback();
			}
		};
		loadNextDependency();
	},
	loadTranslations: function (callback) {
		var self = this;
		var translations = this.getTranslations();
		var lang = config.language.toLowerCase();
		for (var first in translations) { break; }
		if (translations) {
			var translationFile = translations[lang] || undefined;
			var translationsFallbackFile = translations[first];
			if (translationFile !== undefined && translationFile !== translationsFallbackFile) {
				Translator.load(self, translationFile, false, function () {
					Translator.load(self, translationsFallbackFile, true, callback);
				});
			} else {
				Translator.load(self, translationsFallbackFile, true, callback);
			}
		} else {
			callback();
		}
	},
	translate: function (key, defaultValueOrVariables, defaultValue) {
		if(typeof defaultValueOrVariables === "object") {
			return Translator.translate(this, key, defaultValueOrVariables) || defaultValue || "";
		}
		return Translator.translate(this, key) || defaultValueOrVariables || "";
	},
	updateDom: function (speed) {
		MM.updateDom(this, speed);
	},
	sendNotification: function (notification, payload) {
		MM.sendNotification(notification, payload, this);
	},
	hide: function (speed, callback, options) {
		if (typeof callback === "object") {
			options = callback;
			callback = function () { };
		}
		callback = callback || function () { };
		options = options || {};
		var self = this;
		MM.hideModule(self, speed, function () {
			self.suspend();
			callback();
		}, options);
	},
	show: function (speed, callback, options) {
		if (typeof callback === "object") {
			options = callback;
			callback = function () { };
		}
		callback = callback || function () { };
		options = options || {};
		this.resume();
		MM.showModule(this, speed, callback, options);
	}
});
Module.definitions = {};
Module.create = function (name) {
	if (!Module.definitions[name]) {
		return;
	}
	var moduleDefinition = Module.definitions[name];
	var clonedDefinition = cloneObject(moduleDefinition);
	var ModuleClass = Module.extend(clonedDefinition);
	return new ModuleClass();
};
function cmpVersions(a, b) {
	var i, diff;
	var regExStrip0 = /(\.0+)+$/;
	var segmentsA = a.replace(regExStrip0, "").split(".");
	var segmentsB = b.replace(regExStrip0, "").split(".");
	var l = Math.min(segmentsA.length, segmentsB.length);
	for (i = 0; i < l; i++) {
		diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
		if (diff) {
			return diff;
		}
	}
	return segmentsA.length - segmentsB.length;
}
Module.register = function (name, moduleDefinition) {
	if (moduleDefinition.requiresVersion) {
		Log.log("Check version for module " + name + " - Minimum version: " + moduleDefinition.requiresVersion + " - Current version: " + version);
		if (cmpVersions(version, moduleDefinition.requiresVersion) >= 0) {
			Log.log("Version is ok!");
		} else {
			Log.log("Version is incorrect. Skip module: '" + name + "'");
			return;
		}
	}
	Log.log("Load " + name + " module." );
	Module.definitions[name] = moduleDefinition;
};
var Loader = (function() {
	var loadedModuleFiles = [];
	var loadedFiles = [];
	var moduleObjects = [];
	var loadModules = function() {
		var moduleData = getModuleData();
		var loadNextModule = function() {
			if (moduleData.length > 0) {
				var nextModule = moduleData[0];
				loadModule(nextModule, function() {
					moduleData = moduleData.slice(1);
					loadNextModule();
				});
			} else {
				loadFile(config.customCss, function() {
					startModules();
				});
			}
		};
		loadNextModule();
	};
	var startModules = function() {
		for (var m in moduleObjects) {
			var module = moduleObjects[m];
			module.start();
		}
		MM.modulesStarted(moduleObjects);
	};
	var getAllModules = function() {
		return config.modules;
	};
	var getModuleData = function() {
		var modules = getAllModules();
		var moduleFiles = [];
		for (var m in modules) {
			var moduleData = modules[m];
			var module = moduleData.module;
			var elements = module.split("/");
			var moduleName = elements[elements.length - 1];
			var moduleFolder =  config.paths.modules + "/" + module;
			if (moduleData.disabled === true) {
				continue;
			}
			moduleFiles.push({
				index: m,
				identifier: "module_" + m + "_" + module,
				name: moduleName,
				path: moduleFolder + "/" ,
				file: moduleName + ".js",
				position: moduleData.position,
				header: moduleData.header,
				config: moduleData.config,
				classes: (typeof moduleData.classes !== "undefined") ? moduleData.classes + " " + module : module
			});
		}
		return moduleFiles;
	};
	var loadModule = function(module, callback) {
		var url = module.path + "/" + module.file;
		var afterLoad = function() {
			var moduleObject = Module.create(module.name);
			if (moduleObject) {
				bootstrapModule(module, moduleObject, function() {
					callback();
				});
			} else {
				callback();
			}
		};
		if (loadedModuleFiles.indexOf(url) !== -1) {
			afterLoad();
		} else {
			loadFile(url, function() {
				loadedModuleFiles.push(url);
				afterLoad();
			});
		}
	};
	var bootstrapModule = function(module, mObj, callback) {
//		Log.info("Prepare " + module.name + " module.");
		mObj.setData(module);
		mObj.loadScripts(function() {
//			Log.log("Prepare " + module.name + " scripts." );
			mObj.loadStyles(function() {
//				Log.log("Prepare " + module.name + " styles." );
				mObj.loadTranslations(function() {
//					Log.log("Prepare " + module.name + " translations." );
					moduleObjects.push(mObj);
					callback();
				});
			});
		});
	};
	var loadFile = function(fileName, callback) {
		var extension =  fileName.slice((Math.max(0, fileName.lastIndexOf(".")) || Infinity) + 1);
		switch (extension.toLowerCase()) {
		case "js":
			Log.log("Loading " + fileName + ".");
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = fileName;
			script.onload = function() {
				if (typeof callback === "function") {callback();}
			};
			script.onerror = function() {
				console.error("Error on loading script:", fileName);
				if (typeof callback === "function") {callback();}
			};
			document.getElementsByTagName("body")[0].appendChild(script);
			break;
		case "css":
			Log.log("Loading " + fileName + "." );
			var stylesheet = document.createElement("link");
			stylesheet.rel = "stylesheet";
			stylesheet.type = "text/css";
			stylesheet.href = fileName;
			stylesheet.onload = function() {
				if (typeof callback === "function") {callback();}
			};
			stylesheet.onerror = function() {
				console.error("Error on loading stylesheet:", fileName);
				if (typeof callback === "function") {callback();}
			};
			document.getElementsByTagName("head")[0].appendChild(stylesheet);
			break;
		}
	};
	return {
		loadModules: function() {
			loadModules();
		},
		loadFile: function(fileName, module, callback) {
			if (loadedFiles.indexOf(fileName.toLowerCase()) !== -1) {
//				Log.log("File already loaded: " + fileName);
				callback();
				return;
			}
			if (fileName.indexOf("http://") === 0 || fileName.indexOf("https://") === 0 || fileName.indexOf("/") !== -1) {
				loadedFiles.push(fileName.toLowerCase());
				loadFile(fileName, callback);
				return;
			}
			if (vendor[fileName] !== undefined) {
				loadedFiles.push(fileName.toLowerCase());
				loadFile(config.paths.vendor + "/" + vendor[fileName], callback);
				return;
			}
			loadedFiles.push(fileName.toLowerCase());
			loadFile(module.file(fileName), callback);
		}
	};
})();
var Log = (function() {
	return {
		info: Function.prototype.bind.call(console.info, console),
		log:  Function.prototype.bind.call(console.log, console),
		error: Function.prototype.bind.call(console.error, console),
	};
})();
var MM = (function() {
	var modules = [];
	var createDomObjects = function() {
		var domCreationPromises = [];
		modules.forEach(function(module) {
			if (typeof module.data.position !== "string") {
				return;
			}
			var wrapper = selectWrapper(module.data.position);
			var dom = document.createElement("div");
			dom.id = module.identifier;
			dom.className = module.name;
			if (typeof module.data.classes === "string") {
				dom.className = "module " + dom.className + " " + module.data.classes;
			}
			dom.opacity = 0;
			wrapper.appendChild(dom);
			if (typeof module.getHeader() !== "undefined" && module.getHeader() !== "") {
				var moduleHeader = document.createElement("header");
				moduleHeader.innerHTML = module.getHeader();
				moduleHeader.className = "module-header";
				dom.appendChild(moduleHeader);
			}
			var moduleContent = document.createElement("div");
			moduleContent.className = "module-content";
			dom.appendChild(moduleContent);
			var domCreationPromise = updateDom(module, 0);
			domCreationPromises.push(domCreationPromise);
			domCreationPromise.then(function() {
				sendNotification("Document Object Module created", null, null, module);
			}).catch(Log.error);
		});
		updateWrapperStates();
		Promise.all(domCreationPromises).then(function() {
			sendNotification("Document Object Model created");
		});
	};
	var selectWrapper = function(position) {
		var classes = position.replace("_"," ");
		var parentWrapper = document.getElementsByClassName(classes);
		if (parentWrapper.length > 0) {
			var wrapper = parentWrapper[0].getElementsByClassName("container");
			if (wrapper.length > 0) {
				return wrapper[0];
			}
		}
	};
	var sendNotification = function(notification, payload, sender, sendTo) {
		for (var m in modules) {
			var module = modules[m];
			if (module !== sender && (!sendTo || module === sendTo)) {
				module.notificationReceived(notification, payload, sender);
			}
		}
	};
	var updateDom = function(module, speed) {
		return new Promise(function(resolve) {
			var newContentPromise = module.getDom();
			var newHeader = module.getHeader();
			if (!(newContentPromise instanceof Promise)) {
				newContentPromise = Promise.resolve(newContentPromise);
			}
			newContentPromise.then(function(newContent) {
				var updatePromise = updateDomWithContent(module, speed, newHeader, newContent);
				updatePromise.then(resolve).catch(Log.error);
			}).catch(Log.error);
		});
	};
	var updateDomWithContent = function(module, speed, newHeader, newContent) {
		return new Promise(function(resolve) {
			if (module.hidden || !speed) {
				updateModuleContent(module, newHeader, newContent);
				resolve();
				return;
			}
			if (!moduleNeedsUpdate(module, newHeader, newContent)) {
				resolve();
				return;
			}
			if (!speed) {
				updateModuleContent(module, newHeader, newContent);
				resolve();
				return;
			}
			hideModule(module, speed / 2, function() {
				updateModuleContent(module, newHeader, newContent);
				if (!module.hidden) {
					showModule(module, speed / 2);
				}
				resolve();
			});
		});
	};
	var moduleNeedsUpdate = function(module, newHeader, newContent) {
		var moduleWrapper = document.getElementById(module.identifier);
		if (moduleWrapper === null) {
			return false;
		}
		var contentWrapper = moduleWrapper.getElementsByClassName("module-content");
		var headerWrapper = moduleWrapper.getElementsByClassName("module-header");
		var headerNeedsUpdate = false;
		var contentNeedsUpdate = false;
		if (headerWrapper.length > 0) {
			headerNeedsUpdate = newHeader !== headerWrapper[0].innerHTML;
		}
		var tempContentWrapper = document.createElement("div");
		tempContentWrapper.appendChild(newContent);
		contentNeedsUpdate = tempContentWrapper.innerHTML !== contentWrapper[0].innerHTML;
		return headerNeedsUpdate || contentNeedsUpdate;
	};
	var updateModuleContent = function(module, newHeader, newContent) {
		var moduleWrapper = document.getElementById(module.identifier);
        if (moduleWrapper === null) return;
		var headerWrapper = moduleWrapper.getElementsByClassName("module-header");
		var contentWrapper = moduleWrapper.getElementsByClassName("module-content");
		contentWrapper[0].innerHTML = "";
		contentWrapper[0].appendChild(newContent);
		if( headerWrapper.length > 0 && newHeader) {
			headerWrapper[0].innerHTML = newHeader;
		}
	};
	var hideModule = function(module, speed, callback, options) {
		options = options || {};
		if (options.lockString) {
			if (module.lockStrings.indexOf(options.lockString) === -1) {
				module.lockStrings.push(options.lockString);
			}
		}
		var moduleWrapper = document.getElementById(module.identifier);
		if (moduleWrapper !== null) {
			moduleWrapper.style.transition = "opacity " + speed / 1000 + "s";
			moduleWrapper.style.opacity = 0;
			clearTimeout(module.showHideTimer);
			module.showHideTimer = setTimeout(function() {
				moduleWrapper.style.position = "fixed";
				updateWrapperStates();
				if (typeof callback === "function") { callback(); }
			}, speed);
		} else {
			if (typeof callback === "function") { callback(); }
		}
	};
	var showModule = function(module, speed, callback, options) {
		options = options || {};
		if (options.lockString) {
			var index = module.lockStrings.indexOf(options.lockString);
			if ( index !== -1) {
				module.lockStrings.splice(index, 1);
			}
		}
		if (module.lockStrings.length !== 0 && options.force !== true) {
			Log.log("Will not show " + module.name + ". LockStrings active: " + module.lockStrings.join(","));
			return;
		}
		module.hidden = false;
		if (module.lockStrings.length !== 0 && options.force === true) {
			Log.log("Force show of module: " + module.name);
			module.lockStrings = [];
		}
		var moduleWrapper = document.getElementById(module.identifier);
		if (moduleWrapper !== null) {
			moduleWrapper.style.transition = "opacity " + speed / 1000 + "s";
			moduleWrapper.style.position = "static";
			updateWrapperStates();
			var dummy = moduleWrapper.parentElement.parentElement.offsetHeight;
			moduleWrapper.style.opacity = 1;
			clearTimeout(module.showHideTimer);
			module.showHideTimer = setTimeout(function() {
				if (typeof callback === "function") { callback(); }
			}, speed);
		}
	};
	var updateWrapperStates = function() {
		var positions = ["top_bar", "top_left", "top_center", "top_right", "upper_third", "middle_center", "lower_third", "bottom_left", "bottom_center", "bottom_right", "bottom_bar", "fullscreen_above", "fullscreen_below"];
		positions.forEach(function(position) {
			var wrapper = selectWrapper(position);
			var moduleWrappers = wrapper.getElementsByClassName("module");
			var showWrapper = false;
			Array.prototype.forEach.call(moduleWrappers, function(moduleWrapper) {
				if (moduleWrapper.style.position === "" || moduleWrapper.style.position === "static") {
					showWrapper = true;
				}
			});
			wrapper.style.display = showWrapper ? "block" : "none";
		});
	};
	var loadConfig = function() {
		if (typeof config === "undefined") {
			config = defaults;
			Log.error("Config file is missing! Please create a config file.");
			return;
		}
		config = Object.assign({}, defaults, config);
	};
	var setSelectionMethodsForModules = function(modules) {
		var withClass = function(className) {
			return modulesByClass(className, true);
		};
		var exceptWithClass  = function(className) {
			return modulesByClass(className, false);
		};
		var modulesByClass = function(className, include) {
			var searchClasses = className;
			if (typeof className === "string") {
				searchClasses = className.split(" ");
			}
			var newModules = modules.filter(function(module) {
				var classes = module.data.classes.toLowerCase().split(" ");
				for (var c in searchClasses) {
					var searchClass = searchClasses[c];
					if (classes.indexOf(searchClass.toLowerCase()) !== -1) {
						return include;
					}
				}
				return !include;
			});
			setSelectionMethodsForModules(newModules);
			return newModules;
		};
		var exceptModule = function(module) {
			var newModules = modules.filter(function(mod) {
				return mod.identifier !== module.identifier;
			});
			setSelectionMethodsForModules(newModules);
			return newModules;
		};
		var enumerate = function(callback) {
			modules.map(function(module) {
				callback(module);
			});
		};
		if (typeof modules.withClass === "undefined") { Object.defineProperty(modules, "withClass",  {value: withClass, enumerable: false}); }
		if (typeof modules.exceptWithClass === "undefined") { Object.defineProperty(modules, "exceptWithClass",  {value: exceptWithClass, enumerable: false}); }
		if (typeof modules.exceptModule === "undefined") { Object.defineProperty(modules, "exceptModule",  {value: exceptModule, enumerable: false}); }
		if (typeof modules.enumerate === "undefined") { Object.defineProperty(modules, "enumerate",  {value: enumerate, enumerable: false}); }
	};
	return {
		init: function() {
			Log.info("Start initializing...");
			loadConfig();
			Translator.loadCoreTranslations(config.language);
			Loader.loadModules();
		},
		modulesStarted: function(moduleObjects) {
			modules = [];
			for (var m in moduleObjects) {
				var module = moduleObjects[m];
				modules[module.data.index] = module;
			}
			Log.info("All modules started!");
			sendNotification("All modules started!");
			createDomObjects();
		},
		sendNotification: function(notification, payload, sender) {
			if (arguments.length < 3) {
				Log.error("Missing arguments.");
				return;
			}
			if (typeof notification !== "string") {
				Log.error("Notification should be a string.");
				return;
			}
			if (!(sender instanceof Module)) {
				Log.error("Sender should be a module.");
				return;
			}
			sendNotification(notification, payload, sender);
		},
		updateDom: function(module, speed) {
			if (!(module instanceof Module)) {
				Log.error("Sender should be a module.");
				return;
			}
			updateDom(module, speed);
		},
		getModules: function() {
			setSelectionMethodsForModules(modules);
			return modules;
		},
		hideModule: function(module, speed, callback, options) {
			module.hidden = true;
			hideModule(module, speed, callback, options);
		},
		showModule: function(module, speed, callback, options) {
			showModule(module, speed, callback, options);
		}
	};
})();
if (typeof Object.assign !== "function") {
	(function() {
		Object.assign = function(target) {
			"use strict";
			if (target === undefined || target === null) {
				throw new TypeError("Cannot convert undefined or null to object");
			}
			var output = Object(target);
			for (var index = 1; index < arguments.length; index++) {
				var source = arguments[index];
				if (source !== undefined && source !== null) {
					for (var nextKey in source) {
						if (source.hasOwnProperty(nextKey)) {
							output[nextKey] = source[nextKey];
						}
					}
				}
			}
			return output;
		};
	})();
}
MM.init();
