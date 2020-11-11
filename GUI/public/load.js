(function () {
	"use strict";
	var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor),
	
	loadCssHack = function(url, callback){
		var link = document.createElement('link');
		link.type = 'text/css';
		link.rel = 'stylesheet';
		link.href = url;

		document.getElementsByTagName('head')[0].appendChild(link);

		var img = document.createElement('img');
		img.onerror = function(){
			if (callback && typeof callback === "function") {
				callback();
			}
		};
		img.src = url;
	},
	loadRemote = function(url, type, callback) {
		if (type === "css" && isSafari) {
			loadCssHack(url, callback);
			return;
		}
		var _element, _type, _attr, scr, s, element;
		
		switch (type) {
		case 'css':
			_element = "link";
			_type = "text/css";
			_attr = "href";
			break;
		case 'js':
			_element = "script";
			_type = "text/javascript";
			_attr = "src";
			break;
		}
		
		scr = document.getElementsByTagName(_element);
		s = scr[scr.length - 1];
		element = document.createElement(_element);
		element.type = _type;
		if (type == "css") {
			element.rel = "stylesheet";
		}
		if (element.readyState) {
			element.onreadystatechange = function () {
				if (element.readyState == "loaded" || element.readyState == "complete") {
					element.onreadystatechange = null;
					if (callback && typeof callback === "function") {
						callback();
					}
				}
			};
		} else {
			element.onload = function () {
				if (callback && typeof callback === "function") {
					callback();
				}
			};
		}
		element[_attr] = url;
		(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(element);
	},
	loadScript = function (url, callback) {
		loadRemote(url, "js", callback);
	},
	loadCss = function (url, callback) {
		loadRemote(url, "css", callback);
	},
	loadScriptOrContinue = function (url, check, callback) {
		var result;
		if (typeof check === "function") {
			result = check.call(null);
		} else {
			result = check;
		}
		if (result) {
			loadScript(url, callback);
		} else if (typeof callback === "function") {
			callback.call(null);
		}
	},
	randomString = function (length, chars) {
		var result = "";
		for (var i = length; i > 0; --i) {
			result += chars[Math.round(Math.random() * (chars.length - 1))];
		}
		return result;
	},
	getSessionId = function () {
		return sessionStorage.getItem("session_id") == null ? "" : sessionStorage.getItem("session_id");
	},
	createSessionId = function () {
		if (getSessionId() == "") {
			sessionStorage.setItem("session_id", randomString(32, "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"));
		}
	},
	options = {
		url: '//demo.phpjabbers.com/popup/',
		uuid: ''
	},
	enabled = true;
	
	var m = window.location.pathname.match(/\/(\d{10}_\d{3})\//);
	if (m !== null) {
		options.uuid = m[1];
	}
	
	if (isSafari) {
		createSessionId();
		options.session_id = getSessionId();
	} else {
		options.session_id = "";
	}
	
	function init () {
		loadScriptOrContinue('https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js', function () {
			if (typeof window.jQuery === "undefined") {
				return true;
			}
			return false;
		}, function () {
			loadCss(options.url + 'css/popup.css');
			loadScript(options.url + 'js/popup.js', function () {
				pjPopup(options);
			});
		});
	}
	
	function load () {
		window.setTimeout(function () {
			if (enabled) {
				init.call(null);
			} else {
				var a = document.querySelectorAll('a');
				if (a.length) {
					for (var i = 0, iCnt = a.length; i < iCnt; i += 1) {
						if (a[i].target == '_blank' && a[i].href.indexOf('://demo.phpjabbers.com/') !== -1) {
							a[i].target = '_self';
						}
					}
				}
			}
		}, 600);
	}
	
	function destroy () {
		var node;
		
		node = document.querySelector('.pjd-popup-trigger');
		if (node && node.parentNode) {
			node.parentNode.removeChild(node);
		}
		node = document.querySelector('.pjd-popup-extend');
		if (node && node.parentNode) {
			node.parentNode.removeChild(node);
		}
		node = document.querySelector('.pjd-popup-ask-question');
		if (node && node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}
	
	function message (event) {
		if (event.origin !== 'http://phpdemo.online' || event.origin !== 'https://phpdemo.online') {
			return;
		}
		
		if (event.data === 'white_label') {
			enabled = false;
			
			destroy();
			window.setTimeout(function () {
				destroy();
			}, 1000);
		}
	}
	
	if (window.addEventListener) {
        window.addEventListener("load", load, false);
        window.addEventListener("message", message, false);
    } else if (window.attachEvent) {
        window.attachEvent("onload", load);
        window.attachEvent("onmessage", message);
    }
})();