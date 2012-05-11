/** 
 * Absolom: dispatcher 
 * 		  ver: alpha
 *        rel: 4 May 2012
 *     author: michele puddu
 *  email/msn: modok64@hotmail.com
 *    website: http://www.oim-worlds.com
 *    License: MIT (http://www.opensource.org/licenses/mit-license.php)    
 */
(function(w){
	'use strict';
	if(!!w.Absolom)
		return;
	
	var debug = function (outputString, obj) {
		if(!!window.console) {
			console.log(outputString);
			console.log(obj);
		}
	};
	var clone = function(o) {
		if (o == null || typeof o !== "object") return o;
	    var c = {};
	    for (var a in o) {
	        if (o.hasOwnProperty(a)) c[a] = o[a];
	    }

	    return c;
	};
	var merge = function(obj1, obj2) {
		var temp = {};
		temp = clone(obj1);
		temp = clone(obj2);
		return temp;
	};
	var checkDTD = function (obj) {
		if(typeof obj !== "object" || obj == null) {
			debug("object wrong", obj);
			
			return false;
		}
		if(!obj.when || !obj.that) {
			if(!obj.when)
				debug("when property is missing");
			if(!obj.that)
				debug("that property is missing");
			
			return false;
		}
		if(typeof obj._with === 'undefined') {
			return true;
		} else if( typeof obj._with !== 'object' || obj._with == null) {
			debug("_with property has to be undefined or a not null object");
			
			return false;
		}
		
			return true;
	};
	var eventsXCreature = function () {
		var obj = {};
		for(var c in creatures) {
			var evt = creatures[c].events;
			for(var e in evt) {
				if(!!obj[e]) {
					obj[e].count++;
					if(!!creatures[c].name)
						obj[e].names += ', ' + creatures[c].name;
				} else { 
					obj[e] = {count:1};
					if(!!creatures[c].name)
						obj[e].names = creatures[c].name;
				}
			}
		}
		
		return obj;
	};
	var creatures = {};
	var GUID = 0;
	var creature = function (obj) {
		var events = {};
		this.find = function (evt) {
			if(!!events[evt])
				return true;
			else
				return false;
		};
		this.add = function(obj) {
			if(!events[obj.when])
				events[obj.when] = {scope:obj.that, cbk:obj.does, param:obj._with};
		};
		this.remove = function (evt) {
			if(!! events[evt])
				delete events[evt];
		};
		this.exec = function (evt, args) {
			if(!! events[evt]) {
				var x;
				if(typeof args !== "undefined" && typeof args === 'object' && args != null)
					if(typeof events[evt].param !== 'undefined')
						x = merge(events[evt].param, args);
					else
						x = args;
				else
					x = events[evt].param;
				
				if(!!events[evt].cbk) {
					if(typeof events[evt].cbk === "function")
						events[evt].cbk.call(events[evt].scope, x);
					else if(typeof events[evt].cbk === "string" && events[evt].cbk != "") {
						if(!!events[evt].scope[events[evt].cbk]) {
							events[evt].scope[events[evt].cbk](x);
						}
					}
				} else {
					if(!!events[evt].scope[evt]) {
						events[evt].scope[evt](x);
					}
				}
			}
		};
		this.events = events;
		this.add(obj);
		if(!!obj.that.wname)
			this.name = obj.that.wname;
	};
	var a = new function() {
		var n = "Absolom";
		this.wname = n;
		this.knows = function(string) {
			if(!!string) {
				if(string == "events")
					return eventsXCreature();
			}
			
			return creatures;
		};
		this.learns = function(obj) {
			if(!checkDTD(obj))
				return;
			
			if(!creatures[obj.that.guid]) {
				creatures[obj.that.guid] = new creature(obj);
			} else if (!creatures[obj.that.guid].find(obj.when)) {
				creatures[obj.that.guid].add(obj);
			} else {
				debug("Absolom already knows what 'that' does 'when'");
			}
		};
		this.forgets = function(obj) {
			if(!!creatures[obj.about.guid]) {
				if(!obj.when)
					delete creatures[obj.about.guid];
				else {
					creatures[obj.about.guid].remove(obj.when);
				}
			}
				
		};
		this.handshake = function() {
			return GUID++;
		};
		this.makeFriend = function (obj) {
			if(!obj)
				return;
			AbsolomFriend.call(obj);
		};
		this.makeFriends = function(arrObj) {
			if(!arrObj)
				return;
			
			for(var i = 0, l = arrObj.length; i < l; i++ ) {
				this.makeFriend(arrObj[i]);
			}
		};
		this.shouts = function(evt, args) {
			var _a = args || {};
			_a.scope = this;
			var safe = clone(creatures);
			for(var c in safe) {
				if(safe[c].find(evt))
					safe[c].exec(evt, _a);
			}
		};
		this.friendWith = function (t, wname) {
			af.call(t, wname);
		};
		
	};
	var af = function (wname) {
		if(!this.guid)
			this.guid = a.handshake();
		if(!!wname && !this.wname)
			this.wname = wname;
		if(!this.saysA) {
			this.saysA = function (obj) {
				obj.that = this;
				a.learns(obj);
			};
		}
		if(!this.shouts) {
			this.shouts = a.shouts;
		}	
		if(!this.AForgets) {
			this.AForgets = function (obj) {
				var _obj = obj || {};
				_obj.about = this;
				a.forgets(_obj);
			};
		}
	};
	
	w.Absolom = w._A_ = a;
	//w.AbsolomFriend = af;
	
})(window);