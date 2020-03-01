 Module.register("monthly", {
	defaults: {
		initialLoadDelay:	0,		// How many seconds to wait on a fresh start up.
							        // This is to prevent collision with all other modules also
							        // loading all at the same time. This only happens once,
							        // when the mirror first starts up.
		fadeSpeed:		    2,		// How fast (in seconds) to fade out and in during a midnight refresh
		showHeader:		    false,	// Show the month and year at the top of the calendar
		cssStyle:		    "",	    // which CSS style to use, 'block', 'slate', or 'custom'
		updateDelay:		5,		// How many seconds after midnight before a refresh
							        // This is to prevent collision with other modules refreshing
							        // at the same time.
	},

	getStyles: function() {
		return ["monthly.css"];
	},

	getScripts: function() {
		return ["moment.js"];
	},

	start: function() {
		Log.log("Starting module: " + this.name);
		moment.locale(config.language);
				var now = moment();
		this.midnight = moment([now.year(), now.month(), now.date() + 0]).add(this.config.updateDelay, "seconds");
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay * 1000);
	},

	getDom: function() {
		if ((moment() > this.midnight) || (!this.loaded)) {
			var month = moment().month();
			var year = moment().year();
			var monthName = moment().format("MMMM");
			var monthLength = moment().daysInMonth();
			var startingDay = moment().date(1).weekday();
			var wrapper = document.createElement("table");
			wrapper.className = 'xsmall';
			wrapper.id = 'calendar-table';
//			var header = document.createElement("tHead");
//			var headerTR = document.createElement("tr");
//			if (this.config.showHeader) {
//				var headerTH = document.createElement("th");
//				headerTH.colSpan = "7";
//				headerTH.scope = "col";
//				headerTH.id = "calendar-th";
//				var headerMonthSpan = document.createElement("span");
//				headerMonthSpan.id = "monthName";
//				headerMonthSpan.innerHTML = monthName;
//				var headerYearSpan = document.createElement("span");
//				headerYearSpan.id = "yearDigits";
//				headerYearSpan.innerHTML = year;
//				var headerSpace = document.createTextNode(" ");
//				headerTH.appendChild(headerMonthSpan);
//				headerTH.appendChild(headerSpace);
//				headerTH.appendChild(headerYearSpan);
//				headerTR.appendChild(headerTH);
//			}
//			header.appendChild(headerTR);
//			wrapper.appendChild(header);

//			var footer = document.createElement('tFoot');
//			var footerTR = document.createElement("tr");
//			footerTR.id = "calendar-tf";
//			var footerTD = document.createElement("td");
//			footerTD.colSpan ="7";
//			footerTD.className = "footer";
//			footerTR.appendChild(footerTD);
//			footer.appendChild(footerTR);
//			wrapper.appendChild(footer);
			var bodyContent = document.createElement("tBody");
			var bodyTR = document.createElement("tr");
			bodyTR.id = "calendar-header";
			for (var i = 0; i <= 6; i++ ){
				var bodyTD = document.createElement("td");
				bodyTD.className = "calendar-header-day";
				bodyTD.innerHTML = moment().weekday(i).format("ddd");
				bodyTR.appendChild(bodyTD);
			}
			bodyContent.appendChild(bodyTR);
			wrapper.appendChild(bodyContent);
			var bodyContent = document.createElement("tBody");
			var bodyTR = document.createElement("tr");
			bodyTR.className = "weekRow";

			var day = 1;
			var nextMonth = 1;
			for (var i = 0; i < 9; i++) {
				for (var j = 0; j <= 6; j++) {
					var bodyTD = document.createElement("td");
					bodyTD.className = "calendar-day";
//					var squareDiv = document.createElement("div");
//					squareDiv.className = "square-box";
//					var squareContent = document.createElement("div");
//					squareContent.className = "square-content";
//					var squareContentInner = document.createElement("div");
					var innerSpan = document.createElement("span");

					if (j < startingDay && i == 0) {
						innerSpan.className = "monthPrev";
						innerSpan.innerHTML = moment().subtract(1, 'months').endOf('month').subtract((startingDay - 1) - j, 'days').date();
					} else if (day <= monthLength && (i > 0 || j >= startingDay)) {
						if (day == moment().date()) {
							innerSpan.id = "day" + day;
							innerSpan.className = "today";
						} else {
							innerSpan.id = "day" + day;
							innerSpan.className = "daily";
						}
						innerSpan.innerHTML = day;
						day++;
					} else if (day > monthLength && i > 0) {
						innerSpan.className = "monthNext";
						innerSpan.innerHTML = moment([year, month, monthLength]).add(nextMonth, 'days').date();
						nextMonth++;
					}
//					squareContentInner.appendChild(innerSpan);
//					squareContent.appendChild(squareContentInner);
//					squareDiv.appendChild(squareContent);
//					bodyTD.appendChild(squareDiv);	
					bodyTD.appendChild(innerSpan);	
					bodyTR.appendChild(bodyTD);
				}
				if (day > monthLength) {
					break;
				} else {
					bodyTR.appendChild(bodyTD);
					bodyContent.appendChild(bodyTR);
					var bodyTR = document.createElement("tr");
					bodyTR.className = "weekRow";
				}
			}	
			bodyContent.appendChild(bodyTR);
			wrapper.appendChild(bodyContent);
			this.loaded = true;
			return wrapper;
		}

	},

	scheduleUpdate: function(delay) {
		if (typeof delay !== "undefined" && delay >= 0) {
			nextReload = delay;
		}
		if (delay > 0) {
			nextReload = moment.duration(nextReload.diff(moment(), "milliseconds"));
		}
		var self = this;
		setTimeout(function() {
			self.reloadDom();
		}, nextReload);
	},

	reloadDom: function() {
		if (this.config.debugging) {
			Log.log("Calling reloadDom()!");
		}
		var now = moment();
		if (now > this.midnight) {
			this.updateDom(this.config.fadeSpeed * 1000);
			this.midnight = moment([now.year(), now.month(), now.date() + 0]).add(this.config.updateDelay, "seconds");
		}
		var nextRefresh = moment([now.year(), now.month(), now.date(), now.hour() + 0]);
		this.scheduleUpdate(nextRefresh);
	}
});