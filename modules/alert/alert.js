Module.register("alert",{
	defaults: {
		effect: "slide",
		alert_effect: "jelly",
		position: "center",
		display_time: 5000,
		welcome_message: true,
	},
	
	getScripts: function() {
		return [
            this.data.path + "../../js/modernizr.min.js", 
            this.data.path + "../../js/notificationFx.js"
		    ];
	},
	
	getStyles: function() {
		return ["alert.css", "font-awesome.css"];
	},
	
	show_notification: function(message) {
		if (this.config.effect === "slide") {this.config.effect = this.config.effect + "-" + this.config.position;}
		msg = "";
		if (message.title) {
			msg += "<span class='medium thin dimmed'>" + message.title + "</span>";
		}
		if (message.message){
			if (msg !== ""){
				msg+= "<br />";
			}
			msg += "<span class='xsmall light bright'>" + message.message + "</span>";
		}
		new NotificationFx({
			message: msg,
			layout: "growl",
			effect: this.config.effect,
			ttl: message.timer !== undefined ? message.timer : this.config.display_time
		}).show();
	},
	
	show_alert: function(params, sender) {
		var self = this;
		if (typeof params.timer === "undefined") { params.timer = null; }
		if (typeof params.imageHeight === "undefined") { params.imageHeight = "80px"; }
		if (typeof params.imageUrl === "undefined" && typeof params.imageFA === "undefined") {
			params.imageUrl = null;
			image = "";
		} else if (typeof params.imageFA === "undefined"){
			image = "<img src='" + (params.imageUrl).toString() + "' height='" + (params.imageHeight).toString() + "' style='margin-bottom: 10px;'/><br />";
		} else if (typeof params.imageUrl === "undefined"){
			image = "<span class='bright " + "fa fa-" + params.imageFA + "' style='margin-bottom: 10px;font-size:" + (params.imageHeight).toString() + ";'/></span><br />";
		}
		var overlay = document.createElement("div");
		overlay.id = "overlay";
		overlay.innerHTML += "<div class='black_overlay'></div>";
		document.body.insertBefore(overlay, document.body.firstChild);
		if (this.alerts[sender.name]) {
			this.hide_alert(sender);
		}
		var message = "";
		if (params.title) {
			message += "<span class='light dimmed large'>" + params.title + "</span>";
		}
		if (params.message) {
			if (message !== ""){
				message += "<br />";
			}

			message += "<span class='thin bright medium'>" + params.message + "</span>";
		}
		this.alerts[sender.name] = new NotificationFx({
			message: image + message,
			effect: this.config.alert_effect,
			ttl: params.timer,
			al_no: "ns-alert"
		});

		this.alerts[sender.name].show();
		if (params.timer) {
			setTimeout(function() {
				self.hide_alert(sender);
			}, params.timer);
		}
	},
	
	hide_alert: function(sender) {
		if (this.alerts[sender.name]) {
			this.alerts[sender.name].dismiss();
			this.alerts[sender.name] = null;
			var overlay = document.getElementById("overlay");
			overlay.parentNode.removeChild(overlay);
		}
	},
	
	setPosition: function(pos) {
		var sheet = document.createElement("style");
		if (pos === "center") {sheet.innerHTML = ".ns-box {margin-left: auto; margin-right: auto;text-align: center;}";}
		if (pos === "right") {sheet.innerHTML = ".ns-box {margin-left: auto;text-align: right;}";}
		if (pos === "left") {sheet.innerHTML = ".ns-box {margin-right: auto;text-align: left;}";}
		document.body.appendChild(sheet);
	},
	
	notificationReceived: function(notification, payload, sender) {
		if (notification === "SHOW_ALERT") {
			if (typeof payload.type === "undefined") { payload.type = "alert"; }
			if (payload.type === "alert") {
				this.show_alert(payload, sender);
			} else if (payload.type === "notification") {
				this.show_notification(payload);
			}
		} else if (notification === "HIDE_ALERT") {
			this.hide_alert(sender);
		}
	},
	
	start: function() {
		this.alerts = {};
		this.setPosition(this.config.position);
		if (this.config.welcome_message) {
			if (this.config.welcome_message === true){
				this.show_notification({title: "SmartMirror&sup2;", message: "Redesigned by R&#259;zvan Cristea"});
			}
			else{
				this.show_notification({title: this.config.message.title, message: this.config.welcome_message});
			}
		}
		Log.info("Starting module: " + this.name);
	}
});