/* global Module */

/* Magic Mirror
 * Module: WeatherForecast
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("hourly",{

	// Default module config.
	defaults: {
		location: config.location,
		locationID: config.locationID,
		appid: config.appid,
		units: config.units,
		maxNumberOfDays: 4,
		showRainAmount: true,
		showSnowAmount: true, // only for winter months
		updateInterval: 10 * 60 * 1000, // every 10 minutes
		animationSpeed: 1000,
		timeFormat: config.timeFormat,
		lang: config.language,
		decimalSymbol: config.decimal,
		fade: false,
		fadePoint: 0.25, // Start on 1/4th of the list.
		colored: true,
		scale: true,

		initialLoadDelay: 2500, // 2.5 seconds delay. This delay is used to keep the OpenWeather API happy.
		retryDelay: 2500,

		apiVersion: "2.5",
		apiBase: "https://api.openweathermap.org/data/",
		forecastEndpoint: "forecast",

		appendLocationNameToHeader: false,
		calendarClass: "calendar",
		tableClass: "xsmall",

		roundTemp: false,

		iconTable: {
			"01d": "wi-day-sunny",
			"02d": "wi-day-cloudy",
			"03d": "wi-cloudy",
			"04d": "wi-cloudy-windy",
			"09d": "wi-showers",
			"10d": "wi-rain",
			"11d": "wi-thunderstorm",
			"13d": "wi-snow",
			"50d": "wi-fog",
			"01n": "wi-night-clear",
			"02n": "wi-night-cloudy",
			"03n": "wi-night-cloudy",
			"04n": "wi-night-cloudy",
			"09n": "wi-night-showers",
			"10n": "wi-night-rain",
			"11n": "wi-night-thunderstorm",
			"13n": "wi-night-snow",
			"50n": "wi-night-alt-cloudy-windy"
		},
	},

	// create a variable for the first upcoming calendaar event. Used if no location is specified.
	firstEvent: false,

	// create a variable to hold the location name based on the API result.
	fetchedLocationName: "",

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define required scripts.
	getStyles: function() {
		return ["weather-icons.css", "hourly.css"];
	},

	// Define required translations.
	getTranslations: function() {
		return false;
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

		this.forecast = [];
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);
		this.updateTimer = null;
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		if (this.config.appid === "") {
			wrapper.innerHTML = "Please set the correct openweather <i>appid</i> in the config for module: " + this.name + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		var table = document.createElement("table");
		table.className = this.config.tableClass;

		for (var f in this.forecast) {
			var forecast = this.forecast[f];

			var row = document.createElement("tr");
			if (this.config.colored) {
				row.className = "colored";
			}
			table.appendChild(row);

			var dayCell = document.createElement("td");
			dayCell.className = "day";
			dayCell.innerHTML = forecast.day;
			row.appendChild(dayCell);

			var iconCell = document.createElement("td");
			iconCell.className = "weather-icon";
			row.appendChild(iconCell);

			var icon = document.createElement("span");
			icon.className = "wi weathericon " + forecast.icon;
			iconCell.appendChild(icon);

			var degreeLabel = "";
			if (this.config.units === "metric" || this.config.units === "imperial") {
				degreeLabel += "°";
			}
			if(this.config.scale) {
				switch(this.config.units) {
				case "metric":
					degreeLabel += "C";
					break;
				case "imperial":
					degreeLabel += "F";
					break;
				case "default":
					degreeLabel = "K";
					break;
				}
			}

			if (this.config.decimalSymbol === "" || this.config.decimalSymbol === " ") {
				this.config.decimalSymbol = ".";
			}

			var maxTempCell = document.createElement("td");
			maxTempCell.innerHTML = forecast.maxTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
			maxTempCell.className = "align-right max-temp";
			row.appendChild(maxTempCell);

			var minTempCell = document.createElement("td");
			minTempCell.innerHTML = forecast.minTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
			minTempCell.className = "align-right min-temp";
			row.appendChild(minTempCell);

			if (this.config.showRainAmount) {
				var rainCell = document.createElement("td");
				if (isNaN(forecast.rain)) {
					rainCell.innerHTML = "<span>no rain</span>";
				} else {
					if(config.units !== "imperial") {
						rainCell.innerHTML = parseFloat(forecast.rain).toFixed(1).replace(".", this.config.decimalSymbol) + " l/m&sup3;";
					} else {
						rainCell.innerHTML = (parseFloat(forecast.rain) / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in";
					}
				}
				rainCell.className = "align-right xsmall rain";
				row.appendChild(rainCell);
			}

			var nw = new Date();
        	if ((nw.getMonth() >= 0 && nw.getMonth() <= 2) || (nw.getMonth() >= 10 && nw.getMonth() <= 11)) {
				if (this.config.showSnowAmount) {
					var snowCell = document.createElement("td");
					if (isNaN(forecast.snow)) {
						snowCell.innerHTML = "<span>no snow</span>";
					} else {
						if(config.units !== "imperial") {
							snowCell.innerHTML = parseFloat(forecast.snow).toFixed(1).replace(".", this.config.decimalSymbol) + " mm";
						} else {
							snowCell.innerHTML = (parseFloat(forecast.snow) / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in";
						}
					}
					snowCell.className = "align-right xsmall snow";
					row.appendChild(snowCell);
				}
			}

			if (this.config.fade && this.config.fadePoint < 1) {
				if (this.config.fadePoint < 0) {
					this.config.fadePoint = 0;
				}
				var startingPoint = this.forecast.length * this.config.fadePoint;
				var steps = this.forecast.length - startingPoint;
				if (f >= startingPoint) {
					var currentStep = f - startingPoint;
					row.style.opacity = 1 - (1 / steps * currentStep);
				}
			}
		}

		return table;
	},

	// Override getHeader method.
	getHeader: function() {
		if (this.config.appendLocationNameToHeader) {
			return this.data.header + " " + this.fetchedLocationName;
		}

		return this.data.header;
	},

	// Override notification handler.
	notificationReceived: function(notification, payload, sender) {
		if (notification === "DOM_OBJECTS_CREATED") {
			if (this.config.appendLocationNameToHeader) {
				this.hide(0, {lockString: this.identifier});
			}
		}
		if (notification === "CALENDAR_EVENTS") {
			var senderClasses = sender.data.classes.toLowerCase().split(" ");
			if (senderClasses.indexOf(this.config.calendarClass.toLowerCase()) !== -1) {
				this.firstEvent = false;

				for (var e in payload) {
					var event = payload[e];
					if (event.location || event.geo) {
						this.firstEvent = event;
						//Log.log("First upcoming event with location: ", event);
						break;
					}
				}
			}
		}
	},

	updateWeather: function() {
		if (this.config.appid === "") {
			Log.error("WeatherForecast: APPID not set!");
			return;
		}

		var url = this.config.apiBase + this.config.apiVersion + "/" + this.config.forecastEndpoint + this.getParams();
		var self = this;
		var retry = true;

		var weatherRequest = new XMLHttpRequest();
		weatherRequest.open("GET", url, true);
		weatherRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processWeather(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);

					if (self.config.forecastEndpoint === "forecast/daily") {
						self.config.forecastEndpoint = "forecast";
						Log.warn(self.name + ": Your AppID does not support long term forecasts. Switching to fallback endpoint.");
					}

					retry = true;
				} else {
					Log.error(self.name + ": Could not load weather.");
				}

				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		weatherRequest.send();
	},

	getParams: function() {
		var params = "?";
		if(this.config.locationID) {
			params += "id=" + this.config.locationID;
		} else if(this.config.location) {
			params += "q=" + this.config.location;
		} else if (this.firstEvent && this.firstEvent.geo) {
			params += "lat=" + this.firstEvent.geo.lat + "&lon=" + this.firstEvent.geo.lon;
		} else if (this.firstEvent && this.firstEvent.location) {
			params += "q=" + this.firstEvent.location;
		} else {
			this.hide(this.config.animationSpeed, {lockString:this.identifier});
			return;
		}

		params += "&units=" + this.config.units;
		params += "&lang=" + this.config.lang;
//		params += "&cnt=" + (((this.config.maxNumberOfDays < 1) || (this.config.maxNumberOfDays > 121)) ? 40 : this.config.maxNumberOfDays);
		params += "&APPID=" + this.config.appid;

		return params;
	},

	parserDataWeather: function(data) {
		if (data.hasOwnProperty("main")) {
			data["temp"] = {"min": data.main.temp_min, "max": data.main.temp_max};
		}
		return data;
	},

	processWeather: function(data) {
		this.fetchedLocationName = data.city.name + ", " + data.city.country;

		this.forecast = [];
		var lastDay = null;
		var forecastData = {};

		for (var i = 0, count = data.list.length; i < count; i++) {

			var forecast = data.list[i];
			this.parserDataWeather(forecast); // hack issue #1017

			var day;
			var hour;
			if(!!forecast.dt_txt) {
				day = moment(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss").format("HH:mm");
				hour = moment(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss").format("HH:mm");
			} else {
				day = moment(forecast.dt, "X").format("ddd");
				hour = moment(forecast.dt, "X").format("H");
			}

			if (day !== lastDay) {
				var forecastData = {
					day: day,
					icon: this.config.iconTable[forecast.weather[0].icon],
					maxTemp: this.roundValue(forecast.temp.max),
					minTemp: this.roundValue(forecast.temp.min),
					rain: this.processRain(forecast, data.list),
					snow: this.processSnow(forecast, data.list)
				};

				this.forecast.push(forecastData);
				lastDay = day;

				// Stop processing when maxNumberOfDays is reached
				if (this.forecast.length === this.config.maxNumberOfDays) {
					break;
				}
			} else {
				//Log.log("Compare max: ", forecast.temp.max, parseFloat(forecastData.maxTemp));
				forecastData.maxTemp = forecast.temp.max > parseFloat(forecastData.maxTemp) ? this.roundValue(forecast.temp.max) : forecastData.maxTemp;
				//Log.log("Compare min: ", forecast.temp.min, parseFloat(forecastData.minTemp));
				forecastData.minTemp = forecast.temp.min < parseFloat(forecastData.minTemp) ? this.roundValue(forecast.temp.min) : forecastData.minTemp;

				// Since we don't want an icon from the start of the day (in the middle of the night)
				// we update the icon as long as it's somewhere during the day.
				if (hour >= 6 && hour <= 18) {
					forecastData.icon = this.config.iconTable[forecast.weather[0].icon];
				}
			}
		}

		//Log.log(this.forecast);
		this.show(this.config.animationSpeed, {lockString:this.identifier});
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		clearTimeout(this.updateTimer);
		this.updateTimer = setTimeout(function() {
			self.updateWeather();
		}, nextLoad);
	},

	ms2Beaufort: function(ms) {
		var kmh = ms * 60 * 60 / 1000;
		var speeds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 1000];
		for (var beaufort in speeds) {
			var speed = speeds[beaufort];
			if (speed > kmh) {
				return beaufort;
			}
		}
		return 12;
	},

	roundValue: function(temperature) {
		var decimals = this.config.roundTemp ? 0 : 1;
		return parseFloat(temperature).toFixed(decimals);
	},

	processRain: function(forecast, allForecasts) {
		//If the amount of rain actually is a number, return it
		if (!isNaN(forecast.rain)) {
			return forecast.rain;
		}

		//Find all forecasts that is for the same day
		var checkDateTime = (!!forecast.dt_txt) ? moment(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss") : moment(forecast.dt, "X");
		var daysForecasts = allForecasts.filter(function(item) {
			var itemDateTime = (!!item.dt_txt) ? moment(item.dt_txt, "YYYY-MM-DD hh:mm:ss") : moment(item.dt, "X");
			return itemDateTime.isSame(checkDateTime, "day") && item.rain instanceof Object;
		});

		//If no rain this day return undefined so it wont be displayed for this day
		if (daysForecasts.length == 0) {
			return undefined;
		}

		//Summarize all the rain from the matching days
		return daysForecasts.map(function(item) {
			return Object.values(item.rain)[0];
		}).reduce(function(a, b) {
			return a + b;
		}, 0);
	},

	processSnow: function(forecast, allForecasts) {
		//If the amount of snow actually is a number, return it
		if (!isNaN(forecast.snow)) {
			return forecast.snow;
		}

		//Find all forecasts that is for the same day
		var checkDateTime = (!!forecast.dt_txt) ? moment(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss") : moment(forecast.dt, "X");
		var daysForecasts = allForecasts.filter(function(item) {
			var itemDateTime = (!!item.dt_txt) ? moment(item.dt_txt, "YYYY-MM-DD hh:mm:ss") : moment(item.dt, "X");
			return itemDateTime.isSame(checkDateTime, "day") && item.snow instanceof Object;
		});

		//If no snow this day return undefined so it wont be displayed for this day
		if (daysForecasts.length == 0) {
			return undefined;
		}

		//Summarize all the snow from the matching days
		return daysForecasts.map(function(item) {
			return Object.values(item.snow)[0];
		}).reduce(function(a, b) {
			return a + b;
		}, 0);
	}
});