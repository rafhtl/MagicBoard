var config = {
    lang: 'en',
    calendar: {
        maximumEntries: 52 - 40,
		displaySymbol: true,
		defaultSymbol: 'calendar',
        urls: [
    		{
			  symbol: 'calendar-check-o', 
              url: 'https://www.calendarlabs.com/ical-calendar/ics/75/UK_Holidays.ics',
    		},
//  		    {
//  			  symbol: 'calendar-check',
//  			  url: 'https://www.calendarlabs.com/ical-calendar/ics/226/UN_Holidays.ics',
//  		    },
  		    {
  			  symbol: 'calendar',
  			  url: 'https://www.calendarlabs.com/ical-calendar/ics/225/WHO_Health_Days.ics',
  		    },
		],
    },
};
/*************** DO NOT EDIT BELOW THIS LINE ***************/
$.fn.updateWithText = function(text, speed, force)
{
	var dummy = $('<span/>').html(text);
	if (force || ($(this).html() != dummy.html()))
	{
		$(this).fadeOut(speed/2, function(){
			$(this).html(text);
			$(this).fadeIn(speed/2, function(){
			});
		});
	}
};
jQuery(document).ready(function($){
	var eventList = [];
    moment.locale(config.lang);
	calendar.init();
});
var calendar = {
	eventList: [],
	calendarLocation: '.calendar',
	updateInterval: 1000,
	updateDataInterval: 60000,
	fadeInterval: 1000,
	intervalId: null,
	dataIntervalId: null,
	maximumEntries: config.calendar.maximumEntries || 52,
	calendarUrl: (typeof config.calendar.urls == 'undefined') ? config.calendar.url : config.calendar.urls[0].url,
	calendarPos: 0,
	defaultSymbol: config.calendar.defaultSymbol || 'none',
	calendarSymbol: (typeof config.calendar.urls == 'undefined') ? config.calendar.defaultSymbol || 'none' : config.calendar.urls[0].symbol,
	displaySymbol: (typeof config.calendar.displaySymbol == 'undefined') ? false : config.calendar.displaySymbol,
	shortRunningText: 'still',
	longRunningText: 'until',
};
calendar.processEvents = function (url, events){
	tmpEventList = [];
	var eventListLength = this.eventList.length;
	for (var i = 0; i < eventListLength; i++){
		if (this.eventList[i]['url'] != url){
			tmpEventList.push(this.eventList[i]);
		}
	}
	this.eventList = tmpEventList;
	for (var i in events){
		var e = events[i];
		for (var key in e){
			var value = e[key];
			var seperator = key.search(';');
			if (seperator >= 0){
				var mainKey = key.substring(0,seperator);
				var subKey = key.substring(seperator+1);
				var dt;
				if (subKey == 'VALUE=DATE'){
					dt = new Date(value.substring(0,4), value.substring(4,6) - 1, value.substring(6,8));
				} else {
					dt = new Date(value.substring(0,4), value.substring(4,6) - 1, value.substring(6,8), value.substring(9,11), value.substring(11,13), value.substring(13,15));
				}
				if (mainKey == 'DTSTART') e.startDate = dt;
				if (mainKey == 'DTEND') e.endDate = dt;
			}
		}
		if (e.startDate == undefined){
			var days = moment(e.DTSTART).diff(moment(), 'days');
			var seconds = moment(e.DTSTART).diff(moment(), 'seconds');
			var startDate = moment(e.DTSTART);
			var endDays = moment(e.DTEND).diff(moment(), 'days');
			var endSeconds = moment(e.DTEND).diff(moment(), 'seconds');
			var endDate = moment(e.DTEND);
		} else {
			var days = moment(e.startDate).diff(moment(), 'days');
			var seconds = moment(e.startDate).diff(moment(), 'seconds');
			var startDate = moment(e.startDate);
			var endDays = moment(e.endDate).diff(moment(), 'days');
			var endSeconds = moment(e.endDate).diff(moment(), 'seconds');
			var endDate = moment(e.endDate);
		}
		if (seconds >= 0){
			if (seconds <= 60*60*5 || seconds >= 60*60*24*2){
				var time_string = moment(startDate).from(moment().format("YYYY-MM-DD"));
			} else {
				var time_string = moment(startDate).from(moment().format("YYYY-MM-DD"));
			}
			if (!e.RRULE){
				this.eventList.push({'description':e.SUMMARY,'seconds':seconds,'days':time_string,'url': url, symbol: this.calendarSymbol});
			}
			e.seconds = seconds;
		} else if  (endSeconds > 0) {
			if (endSeconds <= 60*60*5 || endSeconds >= 60*60*24*2){
				var time_string = this.shortRunningText + ' ' + moment(endDate).from(moment().format("YYYY-MM-DD"));
			} else {
				var time_string = this.longRunningText + ' ' + moment(endDate).from(moment().format("YYYY-MM-DD"));
			}
			if (!e.RRULE){
				this.eventList.push({'description':e.SUMMARY,'seconds':seconds,'days':time_string,'url': url, symbol: this.calendarSymbol});
			}
			e.seconds = endSeconds;
		}
		if (e.RRULE){
			var options = new RRule.parseString(e.RRULE);
			options.dtstart = e.startDate;
			var rule = new RRule(options);
			var oneYear = new Date();
			oneYear.setFullYear(oneYear.getFullYear() + 1);
			var dates = rule.between(new Date(), oneYear, true, function (date, i){return i < 10;});
			for (date in dates) {
				var dt = new Date(dates[date]);
				var days = moment(dt).diff(moment(), 'days');
				var seconds = moment(dt).diff(moment(), 'seconds');
				var startDate = moment(dt);
				if (seconds >= 0) {
					if (seconds <= 60*60*5 || seconds >= 60*60*24*2){
						var time_string = moment(dt).from(moment().format("YYYY-MM-DD"));
					} else {
						var time_string = moment(dt).from(moment().format("YYYY-MM-DD"));
					}
					this.eventList.push({'description':e.SUMMARY,'seconds':seconds,'days':time_string,'url': url, symbol: this.calendarSymbol});
				}
			}
		}
	}
	this.eventList = this.eventList.sort(function(a,b){return a.seconds-b.seconds;});
	this.eventList = this.eventList.slice(0, calendar.maximumEntries);
};
calendar.updateData = function (callback){
    var Log = (function() {
    	return {
    		info: Function.prototype.bind.call(console.info, console),
    	};
    })();
	new ical_parser("calendar.php" + "?url="+encodeURIComponent(this.calendarUrl), function(cal){
		this.processEvents(this.calendarUrl, cal.getEvents());
		this.calendarPos++;
		if ((typeof config.calendar.urls == 'undefined') || (this.calendarPos >= config.calendar.urls.length)){
			this.calendarPos = 0;
			if (callback !== undefined && Object.prototype.toString.call(callback) === '[object Function]'){
				callback(this.eventList);
			}
		} else {
			setTimeout(function (){
			    Log.info("Calendar updated.");
				this.updateData(this.updateCalendar.bind(this));
			}.bind(this), 10);
		}
		if (typeof config.calendar.urls != 'undefined'){
			this.calendarUrl = config.calendar.urls[this.calendarPos].url;
			this.calendarSymbol = config.calendar.urls[this.calendarPos].symbol || this.defaultSymbol;
		}
	}.bind(this));
};
calendar.updateCalendar = function (eventList){
	var _is_new = true;
	if ($('.calendar-table').length){
		_is_new = false;
	}
	table = $('<table/>').addClass('calendar-table');
	opacity = 1;
	for (var i in eventList){
		var e = eventList[i];
		var row = $('<tr/>').attr('id', 'event'+i).css('opacity',opacity).addClass('event');
		if (this.displaySymbol){
			row.append($('<td/>').addClass('fa').addClass('fa-'+e.symbol).addClass('calendar-icon'));
		}
		row.append($('<td/>').html(e.description).addClass('description'));
		row.append($('<td/>').html(e.days).addClass('days'));
		if (! _is_new && $('#event'+i).length){
			$('#event'+i).updateWithText(row.children(), this.fadeInterval);
		} else {
			_is_new = true;
		}
		table.append(row);
		opacity -= 0.95 / eventList.length;
	}
	if (_is_new) {
		$(this.calendarLocation).updateWithText(table, this.fadeInterval);
	}
};
calendar.init = function (){
	this.updateData(this.updateCalendar.bind(this));
	this.dataIntervalId = setInterval(function (){
	this.updateData(this.updateCalendar.bind(this));
	}.bind(this), this.updateDataInterval);
};
function ical_parser(feed_url, callback){
	this.raw_data = null;
	this.events = [];
	this.loadFile = function(url, callback){
		try {xmlhttp = window.XMLHttpRequest?new XMLHttpRequest(): new ActiveXObject("Microsoft.XMLHTTP");}  catch (e) { }
		xmlhttp.onreadystatechange = function(){
			if ((xmlhttp.readyState == 4) && (xmlhttp.status == 200)){
				callback(xmlhttp.responseText);
			}
		};
		xmlhttp.open("GET", url, true);
		xmlhttp.send(null);
	};
	this.makeDate = function(ical_date){
        var dtutc = {
			year: ical_date.substr(0,4), month: ical_date.substr(4,6), day: ical_date.substr(6,8), hour: ical_date.substr(9,11), minute: ical_date.substr(11,13), second: ical_date.substr(13,15)
		};
            var utcdatems = Date.UTC(dtutc.year, (dtutc.month-1), dtutc.day, dtutc.hour, dtutc.minute, dtutc.second);
            var dt = {};
            dt.date = new Date(utcdatems);
            dt.year = dt.date.getFullYear();
            dt.month = ('0' + (dt.date.getMonth()+1)).slice(-2);
            dt.day = ('0' + dt.date.getDate()).slice(-2);
            dt.hour = ('0' + dt.date.getUTCHours()).slice(-2);
            dt.minute = ('0' + dt.date.getUTCMinutes()).slice(-2);
            dt.second = ('0' + dt.date.getUTCSeconds()).slice(-2);
	        dt.dayname =["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dt.date.getDay()];
            dt.monthname = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ][dt.date.getMonth()] ;
		return dt;
	};
	this.parseICAL = function(data){
		this.events = [];
		cal_array = data.replace(new RegExp( "\\r", "g" ), "").replace(/\n /g,"").split("\n");
		var in_event = false;
		var cur_event = null;
		for(var i=0;i<cal_array.length;i++){
			ln = cal_array[i];
			if(!in_event && ln == 'BEGIN:VEVENT'){
				in_event = true;
				cur_event = {};
			}
            if(in_event && ln == 'END:VEVENT'){
				in_event = false;
				this.events.push(cur_event);
				cur_event = null;
			}
            else if(in_event){
				idx = ln.indexOf(':');
				type = ln.substr(0,idx).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
				val = ln.substr(idx+1).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
				if(typeof cur_event[type]  !== 'undefined'){
					continue;
				}
				if(type =='DTSTART'){
					dt = this.makeDate(val);
					val = dt.date;
					cur_event.start_time = dt.hour+':'+dt.minute+':'+dt.second;
					cur_event.start_date = dt.day+'/'+dt.month+'/'+dt.year;
					cur_event.day = dt.dayname;
                    cur_event.start_date_long = dt.day+'. '+dt.monthname+' '+dt.year ;
				}
                else if(type =='DTEND'){
					dt = this.makeDate(val);
					val = dt.date;
					cur_event.end_time = dt.hour+':'+dt.minute+':'+dt.second;
					cur_event.end_date = dt.day+'/'+dt.month+'/'+dt.year;
					cur_event.day = dt.dayname;
				}
                else if(type =='DTSTAMP'){ 
                    val = this.makeDate(val).date;
                }
                else {
                    val = val
                    .replace(/\\r\\n/g,'<br />')
                    .replace(/\\n/g,'<br />')
                    .replace(/\\,/g,',');
                }
				cur_event[type] = val;
			}
		}
		this.complete();
	};
	this.complete = function(){
		this.events.sort(function(a,b){
			return a.DTSTART-b.DTSTART;
		});
		if(typeof callback == 'function') callback(this);
	};
	this.getEvents = function(){
		return this.events;
	};
	this.getFutureEvents = function(){
		var future_events = [], current_date = new Date();
		this.events.forEach(function(itm){
			if(itm.DTEND > current_date) future_events.push(itm);
		});
		return future_events;
	};
	this.getPastEvents = function(){
		var past_events = [], current_date = new Date();
		this.events.forEach(function(itm){
			if(itm.DTEND <= current_date) past_events.push(itm);
		});
		return past_events.reverse();
	};
	this.load = function(ical_file){
		var tmp_this = this;
		this.raw_data = null;
		this.loadFile(ical_file, function(data){
			tmp_this.raw_data = data;
			tmp_this.parseICAL(data);
		});
	};
	var tmp_this = this;
	this.feed_url = feed_url;
	this.load(this.feed_url);
};
(function(root) {
	var serverSide = typeof module !== 'undefined' && module.exports;
	var getnlp = function(){
    if (!getnlp._nlp){
        if (serverSide){
            getnlp._nlp = require('./nlp');
        } else if (!(getnlp._nlp = root._RRuleNLP)){
            throw new Error(
                'You need to include rrule/nlp.js for fromText/toText to work.'
            );
        }
    }
    return getnlp._nlp;
	};
    var dateutil = {
        MONTH_DAYS: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        ONE_DAY: 1000 * 60 * 60 * 24,
        MAXYEAR: 9999,
        ORDINAL_BASE: new Date(1970, 0, 1),
        PY_WEEKDAYS: [6, 0, 1, 2, 3, 4, 5],
        getYearDay: function(date){
            var dateNoTime = new Date(
                date.getFullYear(), date.getMonth(), date.getDate());
            return Math.ceil(
                (dateNoTime - new Date(date.getFullYear(), 0, 1)) / dateutil.ONE_DAY) + 1;
        },
        isLeapYear: function(year) {
            if (year instanceof Date){
                year = year.getFullYear();
            }
            return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
        },
        tzOffset: function(date){
             return date.getTimezoneOffset() * 60 * 1000;
        },
        daysBetween: function(date1, date2){
            var date1_ms = date1.getTime() - dateutil.tzOffset(date1);
            var date2_ms = date2.getTime() - dateutil.tzOffset(date2);
            var difference_ms = Math.abs(date1_ms - date2_ms);
            return Math.round(difference_ms / dateutil.ONE_DAY);
        },
        toOrdinal: function(date){
            return dateutil.daysBetween(date, dateutil.ORDINAL_BASE);
        },
        fromOrdinal: function(ordinal){
            var millisecsFromBase = ordinal * dateutil.ONE_DAY;
            return new Date(dateutil.ORDINAL_BASE.getTime() - dateutil.tzOffset(dateutil.ORDINAL_BASE) + millisecsFromBase + dateutil.tzOffset(new Date(millisecsFromBase)));
        },
        monthRange: function(year, month){
            var date = new Date(year, month, 1);
            return [dateutil.getWeekday(date), dateutil.getMonthDays(date)];
        },
        getMonthDays: function(date){
            var month = date.getMonth();
            return month == 1 && dateutil.isLeapYear(date) ? 29 : dateutil.MONTH_DAYS[month];
        },
        getWeekday: function(date){
            return dateutil.PY_WEEKDAYS[date.getDay()];
        },
        combine: function(date, time){
            time = time || date;
            return new Date(
                date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()
            );
        },
        clone: function(date){
            var dolly = new Date(date.getTime());
            dolly.setMilliseconds(0);
            return dolly;
        },
        cloneDates: function(dates){
            var clones = [];
            for (var i = -1; i < dates.length; i++) {
                clones.push(dateutil.clone(dates[i]));
            }
            return clones;
        },
        sort: function(dates){
            dates.sort(function(a, b){
                return a.getTime() - b.getTime();
            });
        },
        timeToUntilString: function(time){
            var date = new Date(time);
            var comp, comps = [
                date.getUTCFullYear(),
                date.getUTCMonth() + 1,
                date.getUTCDate(),
                'T',
                date.getUTCHours(),
                date.getUTCMinutes(),
                date.getUTCSeconds(),
                'Z'
            ];
            for (var i = 0; i < comps.length; i++){
                comp = comps[i];
                if (!/[TZ]/.test(comp) && comp < 10) {
                    comps[i] = '0' + String(comp);
                }
            }
            return comps.join('');
        },
        untilStringToDate: function(until){
            var re = /^(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2})Z)?$/;
            var bits = re.exec(until);
            if (!bits) {
                throw new Error('Invalid UNTIL value: ' + until);
            }
            return new Date(
                Date.UTC(bits[1],
                bits[2] - 1,
                bits[3],
                bits[5] || 0,
                bits[6] || 0,
                bits[7] || 0
            ));
        }
    };
    dateutil.Time = function(hour, minute, second){
        this.hour = hour;
        this.minute = minute;
        this.second = second;
    };
    dateutil.Time.prototype = {
        getHours: function() {
            return this.hour;
        },
        getMinutes: function(){
            return this.minute;
        },
        getSeconds: function(){
            return this.second;
        },
        getTime: function(){
            return ((this.hour * 60 * 60) + (this.minute * 60) + this.second) * 1000;
        }
    };
    var range = function(start, end){
        if (arguments.length === 1) {
            end = start;
            start = 0;
        }
        var rang = [];
        for (var i = start; i < end; i++){
            rang.push(i);
        }
        return rang;
    };
    var repeat = function(value, times){
        var i = 0, array = [];
        if (value instanceof Array){
            for (; i < times; i++){
                array[i] = [].concat(value);
            }
        } else {
            for (; i < times; i++){
                array[i] = value;
            }
        }
        return array;
    };
    var pymod = function(a, b){
      var r = a % b;
      return (r * b < 0) ? r + b : r;
    };
    var divmod = function(a, b){
        return {div: Math.floor(a / b), mod: pymod(a, b)};
    };
    var plb = function(obj) {
        return (obj instanceof Array && obj.length == 0) ? false : Boolean(obj);
    };
    var contains = function(arr, val){
        return arr.indexOf(val) != -1;
    };
    var M365MASK = [].concat(
        repeat(1, 31),  repeat(2, 28),  repeat(3, 31),
        repeat(4, 30),  repeat(5, 31),  repeat(6, 30),
        repeat(7, 31),  repeat(8, 31),  repeat(9, 30),
        repeat(10, 31), repeat(11, 30), repeat(12, 31),
        repeat(1, 7)
    );
    var M366MASK = [].concat(
        repeat(1, 31),  repeat(2, 29),  repeat(3, 31),
        repeat(4, 30),  repeat(5, 31),  repeat(6, 30),
        repeat(7, 31),  repeat(8, 31),  repeat(9, 30),
        repeat(10, 31), repeat(11, 30), repeat(12, 31),
        repeat(1, 7)
    );
    var
        M28 = range(1, 29),
        M29 = range(1, 30),
        M30 = range(1, 31),
        M31 = range(1, 32);
    var MDAY366MASK = [].concat(
        M31, M29, M31,
        M30, M31, M30,
        M31, M31, M30,
        M31, M30, M31,
        M31.slice(0, 7)
    );
    var MDAY365MASK = [].concat(
        M31, M28, M31,
        M30, M31, M30,
        M31, M31, M30,
        M31, M30, M31,
        M31.slice(0, 7)
    );
        M28 = range(-28, 0);
        M29 = range(-29, 0);
        M30 = range(-30, 0);
        M31 = range(-31, 0);
    var NMDAY366MASK = [].concat(
        M31, M29, M31,
        M30, M31, M30,
        M31, M31, M30,
        M31, M30, M31,
        M31.slice(0, 7)
    );
    var NMDAY365MASK = [].concat(
        M31, M28, M31,
        M30, M31, M30,
        M31, M31, M30,
        M31, M30, M31,
        M31.slice(0, 7)
    );
    var M366RANGE = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366];
    var M365RANGE = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
    var WDAYMASK = (function(){
        for (var wdaymask = [], i = 0; i < 55; i++){
            wdaymask = wdaymask.concat(range(7));
        }
        return wdaymask;
    }());
    var Weekday = function(weekday, n){
        if (n === 0) {
            throw new Error("Can't create weekday with n == 0");
        }
        this.weekday = weekday;
        this.n = n;
    };
    Weekday.prototype = {
        nth: function(n){
            return this.n == n ? this : new Weekday(this.weekday, n);
        },
        equals: function(other){
            return this.weekday == other.weekday && this.n == other.n;
        },
        toString: function(){
            var s = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'][this.weekday];
            if (this.n) {
                s = (this.n > 0 ? '+' : '') + String(this.n) + s;
            }
            return s;
        },
        getJsWeekday: function(){
            return this.weekday == 6 ? 0 : this.weekday + 1;
        }
    };
    var RRule = function(options, noCache){
        this._string = null;
        options = options || {};
        this._cache = noCache ? null : {
            all: false,
            before: [],
            after: [],
            between: []
        };
        this.origOptions = {};
        var invalid = [],
            keys = Object.keys(options),
            defaultKeys = Object.keys(RRule.DEFAULT_OPTIONS);
        keys.forEach(function(key){
            this.origOptions[key] = options[key];
            if (!contains(defaultKeys, key)) invalid.push(key);
        }, this);
        if (invalid.length){
            throw new Error('Invalid options: ' + invalid.join(', '));
        }
        if (!RRule.FREQUENCIES[options.freq] && options.byeaster === null) {
            throw new Error('Invalid frequency: ' + String(options.freq));
        }
        defaultKeys.forEach(function(key){
            if (!contains(keys, key)) options[key] = RRule.DEFAULT_OPTIONS[key];
        });
        var opts = this.options = options;
        if (opts.byeaster !== null){
            opts.freq = RRule.YEARLY;
        }
        if (!opts.dtstart){
            opts.dtstart = new Date();
            opts.dtstart.setMilliseconds(0);
        }
        if (opts.wkst === null){
            opts.wkst = RRule.MO.weekday;
        } else if (typeof opts.wkst == 'number') {
        } else {
            opts.wkst = opts.wkst.weekday;
        }
        if (opts.bysetpos !== null){
            if (typeof opts.bysetpos == 'number') {
                opts.bysetpos = [opts.bysetpos];
            }
            for (var i = 0; i < opts.bysetpos.length; i++){
                var v = opts.bysetpos[i];
                if (v == 0 || !(-366 <= v && v <= 366)) {
                    throw new Error(
                        'bysetpos must be between 1 and 366,' +
                            ' or between -366 and -1'
                    );
                }
            }
        }
        if (!(plb(opts.byweekno) || plb(opts.byyearday) || plb(opts.bymonthday) || opts.byweekday !== null || opts.byeaster !== null))
        {
            switch (opts.freq){
                case RRule.YEARLY:
                    if (!opts.bymonth){
                        opts.bymonth = opts.dtstart.getMonth() + 1;
                    }
                    opts.bymonthday = opts.dtstart.getDate();
                    break;
                case RRule.MONTHLY:opts.bymonthday = opts.dtstart.getDate();
                    break;
                case RRule.WEEKLY:opts.byweekday = dateutil.getWeekday(opts.dtstart);
                    break;
            }
        }
        if (opts.bymonth !== null && !(opts.bymonth instanceof Array)){
            opts.bymonth = [opts.bymonth];
        }
        if (opts.byyearday !== null && !(opts.byyearday instanceof Array)){
            opts.byyearday = [opts.byyearday];
        }
        if (opts.bymonthday === null){
            opts.bymonthday = [];
            opts.bynmonthday = [];
        } else if (opts.bymonthday instanceof Array){
            var bymonthday = [], bynmonthday = [];
            for (i = 0; i < opts.bymonthday.length; i++){
                var v = opts.bymonthday[i];
                if (v > 0) {
                    bymonthday.push(v);
                } else if (v < 0) {
                    bynmonthday.push(v);
                }
            }
            opts.bymonthday = bymonthday;
            opts.bynmonthday = bynmonthday;
        } else {
            if (opts.bymonthday < 0){
                opts.bynmonthday = [opts.bymonthday];
                opts.bymonthday = [];
            } else {
                opts.bynmonthday = [];
                opts.bymonthday = [opts.bymonthday];
            }
        }
        if (opts.byweekno !== null && !(opts.byweekno instanceof Array)){
            opts.byweekno = [opts.byweekno];
        }
        if (opts.byweekday === null){
            opts.bynweekday = null;
        } else if (typeof opts.byweekday == 'number'){
            opts.byweekday = [opts.byweekday];
            opts.bynweekday = null;
        } else if (opts.byweekday instanceof Weekday){
            if (!opts.byweekday.n || opts.freq > RRule.MONTHLY){
                opts.byweekday = [opts.byweekday.weekday];
                opts.bynweekday = null;
            } else {
                opts.bynweekday = [
                    [opts.byweekday.weekday,
                     opts.byweekday.n]
                ];
                opts.byweekday = null;
            }
        } else {
            var byweekday = [], bynweekday = [];
    
            for (i = 0; i < opts.byweekday.length; i++){
                var wday = opts.byweekday[i];
    
                if (typeof wday == 'number'){
                    byweekday.push(wday);
                } else if (!wday.n || opts.freq > RRule.MONTHLY){
                    byweekday.push(wday.weekday);
                } else {
                    bynweekday.push([wday.weekday, wday.n]);
                }
            }
            opts.byweekday = plb(byweekday) ? byweekday : null;
            opts.bynweekday = plb(bynweekday) ? bynweekday : null;
        }
        if (opts.byhour === null){
            opts.byhour = (opts.freq < RRule.HOURLY) ? [opts.dtstart.getHours()]
                : null;
        } else if (typeof opts.byhour == 'number'){
            opts.byhour = [opts.byhour];
        }
        if (opts.byminute === null){
            opts.byminute = (opts.freq < RRule.MINUTELY) ? [opts.dtstart.getMinutes()]
                : null;
        } else if (typeof opts.byminute == 'number'){
            opts.byminute = [opts.byminute];
        }
        if (opts.bysecond === null){
            opts.bysecond = (opts.freq < RRule.SECONDLY) ? [opts.dtstart.getSeconds()]
                : null;
        } else if (typeof opts.bysecond == 'number'){
            opts.bysecond = [opts.bysecond];
        }
        if (opts.freq >= RRule.HOURLY){
            this.timeset = null;
        } else {
            this.timeset = [];
            for (i = 0; i < opts.byhour.length; i++){
                var hour = opts.byhour[i];
                for (var j = 0; j < opts.byminute.length; j++){
                    var minute = opts.byminute[j];
                    for (var k = 0; k < opts.bysecond.length; k++){
                        var second = opts.bysecond[k];
                        this.timeset.push(new dateutil.Time(hour, minute, second));
                    }
                }
            }
            dateutil.sort(this.timeset);
        }
    };
    RRule.FREQUENCIES = [
        'YEARLY', 'MONTHLY', 'WEEKLY', 'DAILY',
        'HOURLY', 'MINUTELY', 'SECONDLY'
    ];
    RRule.YEARLY   = 0;
    RRule.MONTHLY  = 1;
    RRule.WEEKLY   = 2;
    RRule.DAILY    = 3;
    RRule.HOURLY   = 4;
    RRule.MINUTELY = 5;
    RRule.SECONDLY = 6;
    RRule.MO = new Weekday(0);
    RRule.TU = new Weekday(1);
    RRule.WE = new Weekday(2);
    RRule.TH = new Weekday(3);
    RRule.FR = new Weekday(4);
    RRule.SA = new Weekday(5);
    RRule.SU = new Weekday(6);
    RRule.DEFAULT_OPTIONS = {
        freq:        null,
        dtstart:     null,
        interval:    1,
        wkst:        RRule.MO,
        count:       null,
        until:       null,
        bysetpos:    null,
        bymonth:     null,
        bymonthday:  null,
        byyearday:   null,
        byweekno:    null,
        byweekday:   null,
        byhour:      null,
        byminute:    null,
        bysecond:    null,
        byeaster:    null
    };
    RRule.parseText = function(text, language){
        return getnlp().parseText(text, language);
    };
    RRule.fromText = function(text, language){
        return getnlp().fromText(text, language);
    };
    RRule.optionsToString = function(options){
        var key, keys, defaultKeys, value, strValues, pairs = [];
        keys = Object.keys(options);
        defaultKeys = Object.keys(RRule.DEFAULT_OPTIONS);
        for (var i = 0; i < keys.length; i++){
            if (!contains(defaultKeys, keys[i])) continue;
            key = keys[i].toUpperCase();
            value = options[keys[i]];
            strValues = [];
            if (value === null || value instanceof Array && !value.length){
                continue;
            }
            switch (key) {
                case 'FREQ':value = RRule.FREQUENCIES[options.freq];
                    break;
                case 'WKST':value = value.toString();
                    break;
                case 'BYWEEKDAY':key = 'BYDAY';
                    if (!(value instanceof Array)){
                        value = [value];
                    }
                    for (var wday, j = 0; j < value.length; j++){
                        wday = value[j];
                        if (wday instanceof Weekday) {
                        } else if (wday instanceof Array) {
                            wday = new Weekday(wday[0], wday[1]);
                        } else {
                            wday = new Weekday(wday);
                        }
                        strValues[j] = wday.toString();
                    }
                    value = strValues;
                    break;
                case'DTSTART':
                case'UNTIL':value = dateutil.timeToUntilString(value);
                    break;
                default:
                    if (value instanceof Array) {
                        for (var j = 0; j < value.length; j++) {
                            strValues[j] = String(value[j]);
                        }
                        value = strValues;
                    } else {
                        value = String(value);
                    }
            }
            pairs.push([key, value]);
        }
        var strings = [];
        for (var i = 0; i < pairs.length; i++) {
            var attr = pairs[i];
            strings.push(attr[0] + '=' + attr[1].toString());
        }
        return strings.join(';');
    };
    RRule.prototype = {
        all: function(iterator) {
            if (iterator) {
                return this._iter(new CallbackIterResult('all', {}, iterator));
            } else {
                var result = this._cacheGet('all');
                if (result === false) {
                    result = this._iter(new IterResult('all', {}));
                    this._cacheAdd('all', result);
                }
                return result;
            }
        },
        between: function(after, before, inc, iterator) {
            var args = {
                    before: before,
                    after: after,
                    inc: inc
                };
            if (iterator) {
                return this._iter(
                    new CallbackIterResult('between', args, iterator));
            } else {
                var result = this._cacheGet('between', args);
                if (result === false) {
                    result = this._iter(new IterResult('between', args));
                    this._cacheAdd('between', result, args);
                }
                return result;
            }
        },
        before: function(dt, inc) {
            var args = {
                    dt: dt,
                    inc: inc
                },
                result = this._cacheGet('before', args);
            if (result === false) {
                result = this._iter(new IterResult('before', args));
                this._cacheAdd('before', result, args);
            }
            return result;
        },
        after: function(dt, inc) {
            var args = {
                    dt: dt,
                    inc: inc
                },
                result = this._cacheGet('after', args);
            if (result === false) {
                result = this._iter(new IterResult('after', args));
                this._cacheAdd('after', result, args);
            }
            return result;
        },
        count: function() {
            return this.all().length;
        },
        toString: function() {
            return RRule.optionsToString(this.origOptions);
        },
        toText: function(gettext, language) {
            return getnlp().toText(this, gettext, language);
        },
        isFullyConvertibleToText: function() {
            return getnlp().isFullyConvertible(this);
        },
        _cacheAdd: function(what, value, args) {
            if (!this._cache) return;
            if (value) {
                value = (value instanceof Date) ? dateutil.clone(value) : dateutil.cloneDates(value);
            }
            if (what == 'all') {
                    this._cache.all = value;
            } else {
                args._value = value;
                this._cache[what].push(args);
            }
        },
        _cacheGet: function(what, args) {
            if (!this._cache) {
                return false;
            }
            var cached = false;
            if (what == 'all') {
                cached = this._cache.all;
            } else {
                loopItems:
                for (var item, i = 0; i < this._cache[what].length; i++) {
                    item = this._cache[what][i];
                    for (var k in args) {
                        if (args.hasOwnProperty(k) && String(args[k]) != String(item[k])) {
                            continue loopItems;
                        }
                    }
                    cached = item._value;
                    break;
                }
            }
            if (!cached && this._cache.all) {
                var iterResult = new IterResult(what, args);
                for (var i = 0; i < this._cache.all.length; i++) {
                    if (!iterResult.accept(this._cache.all[i])) {
                        break;
                    }
                }
                cached = iterResult.getValue();
                this._cacheAdd(what, cached, args);
            }
            return cached instanceof Array ? dateutil.cloneDates(cached) : (cached instanceof Date ? dateutil.clone(cached) : cached);
        },
        clone: function() {
            return new RRule(this.origOptions);
        },
        _iter: function(iterResult) {
            var dtstart = this.options.dtstart;
            var
                year = dtstart.getFullYear(),
                month = dtstart.getMonth() + 1,
                day = dtstart.getDate(),
                hour = dtstart.getHours(),
                minute = dtstart.getMinutes(),
                second = dtstart.getSeconds(),
                weekday = dateutil.getWeekday(dtstart),
                yearday = dateutil.getYearDay(dtstart);
            var
                freq = this.options.freq,
                interval = this.options.interval,
                wkst = this.options.wkst,
                until = this.options.until,
                bymonth = this.options.bymonth,
                byweekno = this.options.byweekno,
                byyearday = this.options.byyearday,
                byweekday = this.options.byweekday,
                byeaster = this.options.byeaster,
                bymonthday = this.options.bymonthday,
                bynmonthday = this.options.bynmonthday,
                bysetpos = this.options.bysetpos,
                byhour = this.options.byhour,
                byminute = this.options.byminute,
                bysecond = this.options.bysecond;
            var ii = new Iterinfo(this);
            ii.rebuild(year, month);
            var getdayset = {};
                getdayset[RRule.YEARLY]   = ii.ydayset;
                getdayset[RRule.MONTHLY]  = ii.mdayset;
                getdayset[RRule.WEEKLY]   = ii.wdayset;
                getdayset[RRule.DAILY]    = ii.ddayset;
                getdayset[RRule.HOURLY]   = ii.ddayset;
                getdayset[RRule.MINUTELY] = ii.ddayset;
                getdayset[RRule.SECONDLY] = ii.ddayset;
                getdayset = getdayset[freq];
            var timeset;
            if (freq < RRule.HOURLY) {
                timeset = this.timeset;
            } else {
                var gettimeset = {};
                gettimeset[RRule.HOURLY]   = ii.htimeset;
                gettimeset[RRule.MINUTELY] = ii.mtimeset;
                gettimeset[RRule.SECONDLY] = ii.stimeset;
                gettimeset = gettimeset[freq];
                if ((freq >= RRule.HOURLY   && plb(byhour)   && !contains(byhour, hour)) || (freq >= RRule.MINUTELY && plb(byminute) && !contains(byminute, minute)) || (freq >= RRule.SECONDLY && plb(bysecond) && !contains(bysecond, minute)))
                {
                    timeset = [];
                } else {
                    timeset = gettimeset.call(ii, hour, minute, second);
                }
            }
            var filtered, total = 0, count = this.options.count;
            var iterNo = 0;
            var i, j, k, dm, div, mod, tmp, pos, dayset, start, end, fixday;
            while (true) {
                tmp = getdayset.call(ii, year, month, day);
                dayset = tmp[0]; start = tmp[1]; end = tmp[2];
                filtered = false;
                for (j = start; j < end; j++) {
                    i = dayset[j];
                    if ((plb(bymonth) && !contains(bymonth, ii.mmask[i])) || (plb(byweekno) && !ii.wnomask[i]) || (plb(byweekday) && !contains(byweekday, ii.wdaymask[i])) || (plb(ii.nwdaymask) && !ii.nwdaymask[i]) || (byeaster !== null && !contains(ii.eastermask, i)) || ((plb(bymonthday) || plb(bynmonthday)) && !contains(bymonthday, ii.mdaymask[i]) && !contains(bynmonthday, ii.nmdaymask[i])) || (plb(byyearday) && ((i < ii.yearlen && !contains(byyearday, i + 1) && !contains(byyearday, -ii.yearlen + i)) || (i >= ii.yearlen && !contains(byyearday, i + 1 - ii.yearlen) && !contains(byyearday, -ii.nextyearlen + i - ii.yearlen)))))
                    {
                        dayset[i] = null;
                        filtered = true;
                    }
                }
                if (plb(bysetpos) && plb(timeset)) {
                    var daypos, timepos, poslist = [];
                    for (i, j = 0; j < bysetpos.length; j++) {
                        var pos = bysetpos[j];
                        if (pos < 0) {
                            daypos = Math.floor(pos / timeset.length);
                            timepos = pymod(pos, timeset.length);
                        } else {
                            daypos = Math.floor((pos - 1) / timeset.length);
                            timepos = pymod((pos - 1), timeset.length);
                        }
                        try {
                            tmp = [];
                            for (k = start; k < end; k++) {
                                var val = dayset[k];
                                if (val === null) {
                                    continue;
                                }
                                tmp.push(val);
                            }
                            if (daypos < 0) {
                                  i = tmp.slice(daypos)[0];
                            } else {
                                i = tmp[daypos];
                            }
                            var time = timeset[timepos];
                            var date = dateutil.fromOrdinal(ii.yearordinal + i);
                            var res = dateutil.combine(date, time);
                            if (!contains(poslist, res)) {
                                poslist.push(res);
                            }
                        } catch (e) {}
                    }
                    dateutil.sort(poslist);
                    for (j = 0; j < poslist.length; j++) {
                        var res = poslist[j];
                        if (until && res > until) {
                            this._len = total;
                            return iterResult.getValue();
                        } else if (res >= dtstart) {
                            ++total;
                            if (!iterResult.accept(res)) {
                                return iterResult.getValue();
                            }
                            if (count) {
                                --count;
                                if (!count) {
                                    this._len = total;
                                    return iterResult.getValue();
                                }
                            }
                        }
                    }
                } else {
                    for (j = start; j < end; j++) {
                        i = dayset[j];
                        if (i !== null) {
                            var date = dateutil.fromOrdinal(ii.yearordinal + i);
                            for (k = 0; k < timeset.length; k++) {
                                var time = timeset[k];
                                var res = dateutil.combine(date, time);
                                if (until && res > until) {
                                    this._len = total;
                                    return iterResult.getValue();
                                } else if (res >= dtstart) {
                                    ++total;
                                    if (!iterResult.accept(res)) {
                                        return iterResult.getValue();
                                    }
                                    if (count) {
                                        --count;
                                        if (!count) {
                                            this._len = total;
                                            return iterResult.getValue();
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                fixday = false;
                if (freq == RRule.YEARLY) {
                    year += interval;
                    if (year > dateutil.MAXYEAR) {
                        this._len = total;
                        return iterResult.getValue();
                    }
                    ii.rebuild(year, month);
                } else if (freq == RRule.MONTHLY) {
                    month += interval;
                    if (month > 12) {
                        div = Math.floor(month / 12);
                        mod = pymod(month, 12);
                        month = mod;
                        year += div;
                        if (month == 0) {
                            month = 12;
                            --year;
                        }
                        if (year > dateutil.MAXYEAR) {
                            this._len = total;
                            return iterResult.getValue();
                        }
                    }
                    ii.rebuild(year, month);
                } else if (freq == RRule.WEEKLY) {
                    if (wkst > weekday) {
                        day += -(weekday + 1 + (6 - wkst)) + interval * 7;
                    } else {
                        day += -(weekday - wkst) + interval * 7;
                    }
                    weekday = wkst;
                    fixday = true;
                } else if (freq == RRule.DAILY) {
                    day += interval;
                    fixday = true;
                } else if (freq == RRule.HOURLY) {
                    if (filtered) {
                        hour += Math.floor((23 - hour) / interval) * interval;
                    }
                    while (true) {
                        hour += interval;
                        dm = divmod(hour, 24);
                        div = dm.div;
                        mod = dm.mod;
                        if (div) {
                            hour = mod;
                            day += div;
                            fixday = true;
                        }
                        if (!plb(byhour) || contains(byhour, hour)) {
                            break;
                        }
                    }
                    timeset = gettimeset.call(ii, hour, minute, second);
                } else if (freq == RRule.MINUTELY) {
                    if (filtered) {
                        minute += Math.floor(
                            (1439 - (hour * 60 + minute)) / interval) * interval;
                    }
                    while(true) {
                        minute += interval;
                        dm = divmod(minute, 60);
                        div = dm.div;
                        mod = dm.mod;
                        if (div) {
                            minute = mod;
                            hour += div;
                            dm = divmod(hour, 24);
                            div = dm.div;
                            mod = dm.mod;
                            if (div) {
                                hour = mod;
                                day += div;
                                fixday = true;
                                filtered = false;
                            }
                        }
                        if ((!plb(byhour) || contains(byhour, hour)) && (!plb(byminute) || contains(byminute, minute))) {
                            break;
                        }
                    }
                    timeset = gettimeset.call(ii, hour, minute, second);
                } else if (freq == RRule.SECONDLY) {
                    if (filtered) {
                        second += Math.floor((86399 - (hour * 3600 + minute * 60 + second)) / interval) * interval;
                    }
                    while (true) {
                        second += interval;
                        dm = divmod(second, 60);
                        div = dm.div;
                        mod = dm.mod;
                        if (div) {
                            second = mod;
                            minute += div;
                            dm = divmod(minute, 60);
                            div = dm.div;
                            mod = dm.mod;
                            if (div) {
                                minute = mod;
                                hour += div;
                                dm = divmod(hour, 24);
                                div = dm.div;
                                mod = dm.mod;
                                if (div) {
                                    hour = mod;
                                    day += div;
                                    fixday = true;
                                }
                            }
                        }
                        if ((!plb(byhour) || contains(byhour, hour)) && (!plb(byminute) || contains(byminute, minute)) && (!plb(bysecond) || contains(bysecond, second)))
                        {
                            break;
                        }
                    }
                    timeset = gettimeset.call(ii, hour, minute, second);
                }
                if (fixday && day > 28) {
                    var daysinmonth = dateutil.monthRange(year, month - 1)[1];
                    if (day > daysinmonth) {
                        while (day > daysinmonth) {
                            day -= daysinmonth;
                            ++month;
                            if (month == 13) {
                                month = 1;
                                ++year;
                                if (year > dateutil.MAXYEAR) {
                                    this._len = total;
                                    return iterResult.getValue();
                                }
                            }
                            daysinmonth = dateutil.monthRange(year, month - 1)[1];
                        }
                        ii.rebuild(year, month);
                    }
                }
            }
        }
    };
    RRule.parseString = function(rfcString) {
        rfcString = rfcString.replace(/^\s+|\s+$/, '');
        if (!rfcString.length) {
            return null;
        }
        var i, j, key, value, attr,
            attrs = rfcString.split(';'),
            options = {};
        for (i = 0; i < attrs.length; i++) {
            attr = attrs[i].split('=');
            key = attr[0];
            value = attr[1];
            switch (key) {
                case 'FREQ':options.freq = RRule[value];
                    break;
                case 'WKST':options.wkst = RRule[value];
                    break;
                case 'COUNT':
                case 'INTERVAL':
                case 'BYSETPOS':
                case 'BYMONTH':
                case 'BYMONTHDAY':
                case 'BYYEARDAY':
                case 'BYWEEKNO':
                case 'BYHOUR':
                case 'BYMINUTE':
                case 'BYSECOND':
                    if (value.indexOf(',') != -1) {
                        value = value.split(',');
                        for (j = 0; j < value.length; j++) {
                            if (/^[+-]?\d+$/.test(value[j])) {
                                value[j] = Number(value[j]);
                            }
                        }
                    } else if (/^[+-]?\d+$/.test(value)) {
                        value = Number(value);
                    }
                    key = key.toLowerCase();
                    options[key] = value;
                    break;
                case 'BYDAY': var n, wday, day, days = value.split(',');
                    options.byweekday = [];
                    for (j = 0; j < days.length; j++) {
                        day = days[j];
                        if (day.length == 2) { 
                            wday = RRule[day]; 
                            options.byweekday.push(wday);
                        } else { // -1MO, +3FR, 1SO, ...
                            day = day.match(/^([+-]?\d)([A-Z]{2})$/);
                            n = Number(day[1]);
                            wday = day[2];
                            wday = RRule[wday].weekday;
                            options.byweekday.push(new Weekday(wday, n));
                        }
                    }
                    break;
                case 'DTSTART':options.dtstart = dateutil.untilStringToDate(value);
                    break;
                case 'UNTIL':options.until = dateutil.untilStringToDate(value);
                    break;
                case 'BYEASTER':options.byeaster = Number(value);
                    break;
                default:
                    throw new Error("Unknown RRULE property '" + key + "'");
            }
        }
        return options;
    };
    RRule.fromString = function(string) {
        return new RRule(RRule.parseString(string));
    };
    var Iterinfo = function(rrule) {
        this.rrule = rrule;
        this.lastyear = null;
        this.lastmonth = null;
        this.yearlen = null;
        this.nextyearlen = null;
        this.yearordinal = null;
        this.yearweekday = null;
        this.mmask = null;
        this.mrange = null;
        this.mdaymask = null;
        this.nmdaymask = null;
        this.wdaymask = null;
        this.wnomask = null;
        this.nwdaymask = null;
        this.eastermask = null;
    };
    Iterinfo.prototype.easter = function(y, offset) {
        offset = offset || 0;
        var a = y % 19,
            b = Math.floor(y / 100),
            c = y % 100,
            d = Math.floor(b / 4),
            e = b % 4,
            f = Math.floor((b + 8) / 25),
            g = Math.floor((b - f + 1) / 3),
            h = Math.floor(19 * a + b - d - g + 15) % 30,
            i = Math.floor(c / 4),
            k = c % 4,
            l = Math.floor(32 + 2 * e + 2 * i - h - k) % 7,
            m = Math.floor((a + 11 * h + 22 * l) / 451),
            month = Math.floor((h + l - 7 * m + 114) / 31),
            day = (h + l - 7 * m + 114) % 31 + 1,
            date = Date.UTC(y, month - 1, day + offset),
            yearStart = Date.UTC(y, 0, 1);
        return [ Math.ceil((date - yearStart) / (1000 * 60 * 60 * 24)) ];
    };
    Iterinfo.prototype.rebuild = function(year, month) {
        var rr = this.rrule;
        if (year != this.lastyear) {
            this.yearlen = dateutil.isLeapYear(year) ? 366 : 365;
            this.nextyearlen = dateutil.isLeapYear(year + 1) ? 366 : 365;
            var firstyday = new Date(year, 0, 1);
            this.yearordinal = dateutil.toOrdinal(firstyday);
            this.yearweekday = dateutil.getWeekday(firstyday);
            var wday = dateutil.getWeekday(new Date(year, 0, 1));
            if (this.yearlen == 365) {
                this.mmask = [].concat(M365MASK);
                this.mdaymask = [].concat(MDAY365MASK);
                this.nmdaymask = [].concat(NMDAY365MASK);
                this.wdaymask = WDAYMASK.slice(wday);
                this.mrange = [].concat(M365RANGE);
            } else {
                this.mmask = [].concat(M366MASK);
                this.mdaymask = [].concat(MDAY366MASK);
                this.nmdaymask = [].concat(NMDAY366MASK);
                this.wdaymask = WDAYMASK.slice(wday);
                this.mrange = [].concat(M366RANGE);
            }
            if (!plb(rr.options.byweekno)) {
                this.wnomask = null;
            } else {
                this.wnomask = repeat(0, this.yearlen + 7);
                var no1wkst, firstwkst, wyearlen;
                no1wkst = firstwkst = pymod(
                    7 - this.yearweekday + rr.options.wkst, 7);
                if (no1wkst >= 4) {
                    no1wkst = 0;
                    wyearlen = this.yearlen + pymod(
                        this.yearweekday - rr.options.wkst, 7);
                } else {
                    wyearlen = this.yearlen - no1wkst;
                }
                var div = Math.floor(wyearlen / 7);
                var mod = pymod(wyearlen, 7);
                var numweeks = Math.floor(div + (mod / 4));
                for (var n, i, j = 0; j < rr.options.byweekno.length; j++) {
                    n = rr.options.byweekno[j];
                    if (n < 0) {
                        n += numweeks + 1;
                    } if (!(0 < n && n <= numweeks)) {
                        continue;
                    } if (n > 1) {
                        i = no1wkst + (n - 1) * 7;
                        if (no1wkst != firstwkst) {
                            i -= 7-firstwkst;
                        }
                    } else {
                        i = no1wkst;
                    }
                    for (var k = 0; k < 7; k++) {
                        this.wnomask[i] = 1;
                        i++;
                        if (this.wdaymask[i] == rr.options.wkst) {
                            break;
                        }
                    }
                }
                if (contains(rr.options.byweekno, 1)) {
                    var i = no1wkst + numweeks * 7;
                    if (no1wkst != firstwkst) {
                        i -= 7 - firstwkst;
                    }
                    if (i < this.yearlen) {
                        for (var j = 0; j < 7; j++) {
                            this.wnomask[i] = 1;
                            i += 1;
                            if (this.wdaymask[i] == rr.options.wkst) {
                                break;
                            }
                        }
                    }
                }
                if (no1wkst) {
                    var lnumweeks;
                    if (!contains(rr.options.byweekno, -1)) {
                        var lyearweekday = dateutil.getWeekday(
                            new Date(year - 1, 0, 1));
                        var lno1wkst = pymod(
                            7 - lyearweekday + rr.options.wkst, 7);
                        var lyearlen = dateutil.isLeapYear(year - 1) ? 366 : 365;
                        if (lno1wkst >= 4) {
                            lno1wkst = 0;
                            lnumweeks = Math.floor(52 + pymod(lyearlen + pymod(lyearweekday - rr.options.wkst, 7), 7) / 4);
                        } else {
                            lnumweeks = Math.floor(52 + pymod(this.yearlen - no1wkst, 7) / 4);
                        }
                    } else {
                        lnumweeks = -1;
                    }
                    if (contains(rr.options.byweekno, lnumweeks)) {
                        for (var i = 0; i < no1wkst; i++) {
                            this.wnomask[i] = 1;
                        }
                    }
                }
            }
        }
        if (plb(rr.options.bynweekday) && (month != this.lastmonth || year != this.lastyear)) {
            var ranges = [];
            if (rr.options.freq == RRule.YEARLY) {
                if (plb(rr.options.bymonth)) {
                    for (j = 0; j < rr.options.bymonth.length; j++) {
                        month = rr.options.bymonth[j];
                        ranges.push(this.mrange.slice(month - 1, month + 1));
                    }
                } else {
                    ranges = [[0, this.yearlen]];
                }
            } else if (rr.options.freq == RRule.MONTHLY) {
                ranges = [this.mrange.slice(month - 1, month + 1)];
            }
            if (plb(ranges)) {
                this.nwdaymask = repeat(0, this.yearlen);
                for (var j = 0; j < ranges.length; j++) {
                    var rang = ranges[j];
                    var first = rang[0], last = rang[1];
                    last -= 1;
                    for (var k = 0; k < rr.options.bynweekday.length; k++) {
                        var wday = rr.options.bynweekday[k][0],
                            n = rr.options.bynweekday[k][1];
                        if (n < 0) {
                            i = last + (n + 1) * 7;
                            i -= pymod(this.wdaymask[i] - wday, 7);
                        } else {
                            i = first + (n - 1) * 7;
                            i += pymod(7 - this.wdaymask[i] + wday, 7);
                        }
                        if (first <= i && i <= last) {
                            this.nwdaymask[i] = 1;
                        }
                    }
                }
            }
            this.lastyear = year;
            this.lastmonth = month;
        }
        if (rr.options.byeaster !== null) {
            this.eastermask = this.easter(year, rr.options.byeaster);
        }
    };
    Iterinfo.prototype.ydayset = function(year, month, day) {
        return [range(this.yearlen), 0, this.yearlen];
    };
    Iterinfo.prototype.mdayset = function(year, month, day) {
        var set = repeat(null, this.yearlen);
        var start = this.mrange[month-1];
        var end = this.mrange[month];
        for (var i = start; i < end; i++) {
            set[i] = i;
        }
        return [set, start, end];
    };
    Iterinfo.prototype.wdayset = function(year, month, day) {
        var set = repeat(null, this.yearlen + 7);
        var i = dateutil.toOrdinal(
            new Date(year, month - 1, day)) - this.yearordinal;
        var start = i;
        for (var j = 0; j < 7; j++) {
            set[i] = i;
            ++i;
            if (this.wdaymask[i] == this.rrule.options.wkst) {
                break;
            }
        }
        return [set, start, i];
    };
    Iterinfo.prototype.ddayset = function(year, month, day) {
        var set = repeat(null, this.yearlen);
        var i = dateutil.toOrdinal(
            new Date(year, month - 1, day)) - this.yearordinal;
        set[i] = i;
        return [set, i, i + 1];
    };
    Iterinfo.prototype.htimeset = function(hour, minute, second) {
        var set = [], rr = this.rrule;
        for (var i = 0; i < rr.options.byminute.length; i++) {
            minute = rr.options.byminute[i];
            for (var j = 0; j < rr.options.bysecond.length; j++) {
                second = rr.options.bysecond[j];
                set.push(new dateutil.Time(hour, minute, second));
            }
        }
        dateutil.sort(set);
        return set;
    };
    Iterinfo.prototype.mtimeset = function(hour, minute, second) {
        var set = [], rr = this.rrule;
        for (var j = 0; j < rr.options.bysecond.length; j++) {
            second = rr.options.bysecond[j];
            set.push(new dateutil.Time(hour, minute, second));
        }
        dateutil.sort(set);
        return set;
    };
    Iterinfo.prototype.stimeset = function(hour, minute, second) {
        return [new dateutil.Time(hour, minute, second)];
    };
    var IterResult = function(method, args) {
        this.init(method, args);
    };
    IterResult.prototype = {
        init: function(method, args) {
            this.method = method;
            this.args = args;
            this._result = [];
            this.minDate = null;
            this.maxDate = null;
            if (method == 'between') {
                this.maxDate = args.inc ? args.before : new Date(args.before.getTime() - 1);
                this.minDate = args.inc ? args.after : new Date(args.after.getTime() + 1);
            } else if (method == 'before') {
                this.maxDate = args.inc ? args.dt : new Date(args.dt.getTime() - 1);
            } else if (method == 'after') {
                this.minDate = args.inc ? args.dt : new Date(args.dt.getTime() + 1);
            }
        },
        accept: function(date) {
            var tooEarly = this.minDate && date < this.minDate,
                tooLate = this.maxDate && date > this.maxDate;
            if (this.method == 'between') {
                if (tooEarly)
                    return true;
                if (tooLate)
                    return false;
            } else if (this.method == 'before') {
                if (tooLate)
                    return false;
            } else if (this.method == 'after') {
                if (tooEarly)
                    return true;
                this.add(date);
                return false;
            }
            return this.add(date);
        },
        add: function(date) {
            this._result.push(date);
            return true;
        },
        getValue: function() {
            switch (this.method) {
                case 'all':case 'between':return this._result;
                case 'before':case 'after':return this._result.length ? this._result[this._result.length - 1] : null;
            }
        }
    };
    var CallbackIterResult = function(method, args, iterator) {
        var allowedMethods = ['all', 'between'];
        if (!contains(allowedMethods, method)) {
            throw new Error('Invalid method "' + method + '". Only all and between works with iterator.');
        }
        this.add = function(date) {
            if (iterator(date, this._result.length)) {
                this._result.push(date);
                return true;
            }
            return false;
    
        };
        this.init(method, args);
    };
    CallbackIterResult.prototype = IterResult.prototype;
    if (serverSide) {
        module.exports = {
            RRule: RRule
        };
    }
    if (typeof ender === "undefined") {
        root["RRule"] = RRule;
    }
    if (typeof define === "function" && define.amd) {
        define("rrule", [], function () {
            return RRule;
        });
    }
}(this));