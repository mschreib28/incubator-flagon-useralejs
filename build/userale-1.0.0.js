/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * @preserved
 */

(function (exports) {
	'use strict';

	var version$1 = "1.0.0";

	/*
	 * Licensed to the Apache Software Foundation (ASF) under one or more
	 * contributor license agreements.  See the NOTICE file distributed with
	 * this work for additional information regarding copyright ownership.
	 * The ASF licenses this file to You under the Apache License, Version 2.0
	 * (the "License"); you may not use this file except in compliance with
	 * the License.  You may obtain a copy of the License at
	 * 
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 * 
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/**
	 * Extracts the initial configuration settings from the
	 * currently executing script tag.
	 * @return {Object} The extracted configuration object
	 */
	function getInitialSettings() {
	  var settings = {};

	  var script = document.currentScript || (function () {
	    var scripts = document.getElementsByTagName('script');
	    return scripts[scripts.length - 1];
	  })();

	  var get = script ? script.getAttribute.bind(script) : function() { return null; };

	  settings.autostart = get('data-autostart') === 'false' ? false : true;
	  settings.url = get('data-url') || 'http://localhost:8000';
	  settings.transmitInterval = +get('data-interval') || 5000;
	  settings.logCountThreshold = +get('data-threshold') || 5;
	  settings.userId = get('data-user') || null;
	  settings.version = get('data-version') || null;
	  settings.logDetails = get('data-log-details') === 'true' ? true : false;
	  settings.resolution = +get('data-resolution') || 500;
	  settings.toolName = get('data-tool') || null;
	  settings.userFromParams = get('data-user-from-params') || null;
	  settings.time = timeStampScale(document.createEvent('CustomEvent'));

	  return settings;
	}

	/**
	 * Creates a function to normalize the timestamp of the provided event.
	 * @param  {Object} e An event containing a timeStamp property.
	 * @return {timeStampScale~tsScaler}   The timestamp normalizing function.
	 */
	function timeStampScale(e) {
	  if (e.timeStamp && e.timeStamp > 0) {
	    var delta = Date.now() - e.timeStamp;
	    /**
	     * Returns a timestamp depending on various browser quirks.
	     * @param  {?Number} ts A timestamp to use for normalization.
	     * @return {Number} A normalized timestamp.
	     */
	    var tsScaler;

	    if (delta < 0) {
	      tsScaler = function () {
	        return e.timeStamp / 1000;
	      };
	    } else if (delta > e.timeStamp) {
	      var navStart = performance.timing.navigationStart;
	      tsScaler = function (ts) {
	        return ts + navStart;
	      }
	    } else {
	      tsScaler = function (ts) {
	        return ts;
	      }
	    }
	  } else {
	    tsScaler = function () { return Date.now(); };
	  }

	  return tsScaler;
	}

	/*
	 * Licensed to the Apache Software Foundation (ASF) under one or more
	 * contributor license agreements.  See the NOTICE file distributed with
	 * this work for additional information regarding copyright ownership.
	 * The ASF licenses this file to You under the Apache License, Version 2.0
	 * (the "License"); you may not use this file except in compliance with
	 * the License.  You may obtain a copy of the License at
	 * 
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 * 
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/**
	 * Shallow merges the first argument with the second.
	 * Retrieves/updates the userid if userFromParams is provided.
	 * @param  {Object} config    Current configuration object to be merged into.
	 * @param  {Object} newConfig Configuration object to merge into the current config.
	 */
	function configure(config, newConfig) {
	  Object.keys(newConfig).forEach(function(option) {
	    if (option === 'userFromParams') {
	      var userId = getUserIdFromParams(newConfig[option]);
	      if (userId) {
	        config.userId = userId;
	      }
	    }
	    config[option] = newConfig[option];
	  });
	}

	/**
	 * Attempts to extract the userid from the query parameters of the URL.
	 * @param  {string} param The name of the query parameter containing the userid.
	 * @return {string|null}       The extracted/decoded userid, or null if none is found.
	 */
	function getUserIdFromParams(param) {
	  var userField = param;
	  var regex = new RegExp('[?&]' + userField + '(=([^&#]*)|&|#|$)');
	  var results = window.location.href.match(regex);

	  if (results && results[2]) {
	    return decodeURIComponent(results[2].replace(/\+/g, ' '));
	  } else {
	    return null;
	  }
	}

	/*
	 * Licensed to the Apache Software Foundation (ASF) under one or more
	 * contributor license agreements.  See the NOTICE file distributed with
	 * this work for additional information regarding copyright ownership.
	 * The ASF licenses this file to You under the Apache License, Version 2.0
	 * (the "License"); you may not use this file except in compliance with
	 * the License.  You may obtain a copy of the License at
	 * 
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 * 
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	var logs$1;
	var config$1;

	/**
	 * Assigns the config and log container to be used by the logging functions.
	 * @param  {Array} newLogs   Log container.
	 * @param  {Object} newConfig Configuration to use while logging.
	 */
	function initPackager(newLogs, newConfig) {
	  logs$1 = newLogs;
	  config$1 = newConfig;
	}

	/**
	 * Transforms the provided event into a log and appends it to the log container.
	 * @param  {Object} e         The event to be logged.
	 * @param  {Function} detailFcn The function to extract additional log parameters from the event.
	 * @return {boolean}           Whether the event was logged.
	 */
	function packageLog(e, detailFcn) {
	  if (!config$1.on) {
	    return false;
	  }

	  var details = null;
	  if (detailFcn) {
	    details = detailFcn(e);
	  }

	  var log = {
	    'target' : getSelector(e.target),
	    'path' : buildPath(e),
	    'clientTime' : Math.floor((e.timeStamp && e.timeStamp > 0) ? config$1.time(e.timeStamp) : Date.now()),
	    'location' : getLocation(e),
	    'type' : e.type,
	    'userAction' : true,
	    'details' : details,
	    'userId' : config$1.userId,
	    'toolVersion' : config$1.version,
	    'toolName' : config$1.toolName,
	    'useraleVersion': config$1.useraleVersion
	  };

	  logs$1.push(log);

	  return true;
	}

	/**
	 * Extracts coordinate information from the event
	 * depending on a few browser quirks.
	 * @param  {Object} e The event to extract coordinate information from.
	 * @return {Object}   An object containing nullable x and y coordinates for the event.
	 */
	function getLocation(e) {
	  if (e.pageX != null) {
	    return { 'x' : e.pageX, 'y' : e.pageY };
	  } else if (e.clientX != null) {
	    return { 'x' : document.documentElement.scrollLeft + e.clientX, 'y' : document.documentElement.scrollTop + e.clientY };
	  } else {
	    return { 'x' : null, 'y' : null };
	  }
	}

	/**
	 * Builds a string CSS selector from the provided element
	 * @param  {HTMLElement} ele The element from which the selector is built.
	 * @return {string}     The CSS selector for the element, or Unknown if it can't be determined.
	 */
	function getSelector(ele) {
	  if (ele.localName) {
	    return ele.localName + (ele.id ? ('#' + ele.id) : '') + (ele.className ? ('.' + ele.className) : '');
	  } else if (ele.nodeName) {
	    return ele.nodeName + (ele.id ? ('#' + ele.id) : '') + (ele.className ? ('.' + ele.className) : '');
	  } else if (ele && ele.document && ele.location && ele.alert && ele.setInterval) {
	    return "Window";
	  } else {
	    return "Unknown";
	  }
	}

	/**
	 * Builds an array of elements from the provided event target, to the root element.
	 * @param  {Object} e Event from which the path should be built.
	 * @return {HTMLElement[]}   Array of elements, starting at the event target, ending at the root element.
	 */
	function buildPath(e) {
	  var path = [];
	  if (e.path) {
	    path = e.path;
	  } else {
	    var ele = e.target
	    while(ele) {
	      path.push(ele);
	      ele = ele.parentElement;
	    }
	  }

	  return selectorizePath(path);
	}

	/**
	 * Builds a CSS selector path from the provided list of elements.
	 * @param  {HTMLElement[]} path Array of HTMLElements from which the path should be built.
	 * @return {string[]}      Array of string CSS selectors.
	 */
	function selectorizePath(path) {
	  var i = 0;
	  var pathEle;
	  var pathSelectors = [];
	  while (pathEle = path[i]) {
	    pathSelectors.push(getSelector(pathEle));
	    ++i;
	  }
	  return pathSelectors;
	}

	var events;
	var bufferBools;
	var bufferedEvents;
	var windowEvents;

	/**
	 * Defines the way information is extracted from various events.
	 * Also defines which events we will listen to.
	 * @param  {Object} config Configuration object to read from.
	 */
	function defineDetails(config) {
	  // Events list
	  // Keys are event types
	  // Values are functions that return details object if applicable
	  events = {
	    'click' : function(e) { return { 'clicks' : e.detail, 'ctrl' : e.ctrlKey, 'alt' : e.altKey, 'shift' : e.shiftKey, 'meta' : e.metaKey }; },
	    'dblclick' : function(e) { return { 'clicks' : e.detail, 'ctrl' : e.ctrlKey, 'alt' : e.altKey, 'shift' : e.shiftKey, 'meta' : e.metaKey }; },
	    'mousedown' : function(e) { return { 'clicks' : e.detail, 'ctrl' : e.ctrlKey, 'alt' : e.altKey, 'shift' : e.shiftKey, 'meta' : e.metaKey }; },
	    'mouseup' : function(e) { return { 'clicks' : e.detail, 'ctrl' : e.ctrlKey, 'alt' : e.altKey, 'shift' : e.shiftKey, 'meta' : e.metaKey }; },
	    'focus' : null,
	    'blur' : null,
	    'input' : config.logDetails ? function(e) { return { 'value' : e.target.value }; } : null,
	    'change' : config.logDetails ? function(e) { return { 'value' : e.target.value }; } : null,
	    'dragstart' : null,
	    'dragend' : null,
	    'drag' : null,
	    'drop' : null,
	    'keydown' : config.logDetails ? function(e) { return { 'key' : e.keyCode, 'ctrl' : e.ctrlKey, 'alt' : e.altKey, 'shift' : e.shiftKey, 'meta' : e.metaKey }; } : null,
	    'mouseover' : null,
	    'submit' : null
	  };

	  bufferBools = {};
	  bufferedEvents = {
	    'wheel' : function(e) { return { 'x' : e.deltaX, 'y' : e.deltaY, 'z' : e.deltaZ }; },
	    'scroll' : function() { return { 'x' : window.scrollX, 'y' : window.scrollY }; },
	    'resize' : function() { return { 'width' : window.outerWidth, 'height' : window.outerHeight }; }
	  };

	  windowEvents = ['load', 'blur', 'focus'];
	}

	/**
	 * Hooks the event handlers for each event type of interest.
	 * @param  {Object} config Configuration object to use.
	 * @return {boolean}        Whether the operation succeeded
	 */
	function attachHandlers(config) {
	  defineDetails(config);

	  Object.keys(events).forEach(function(ev) {
	    document.addEventListener(ev, function(e) {
	      packageLog(e, events[ev]);
	    }, true);
	  });

	  Object.keys(bufferedEvents).forEach(function(ev) {
	    bufferBools[ev] = true;

	    window.addEventListener(ev, function(e) {
	      if (bufferBools[ev]) {
	        bufferBools[ev] = false;
	        packageLog(e, bufferedEvents[ev]);
	        setTimeout(function() { bufferBools[ev] = true; }, config.resolution);
	      }
	    }, true);
	  });

	  windowEvents.forEach(function(ev) {
	    window.addEventListener(ev, function(e) {
	      packageLog(e, function() { return { 'window' : true }; });
	    }, true);
	  });

	  return true;
	}

	/*
	 * Licensed to the Apache Software Foundation (ASF) under one or more
	 * contributor license agreements.  See the NOTICE file distributed with
	 * this work for additional information regarding copyright ownership.
	 * The ASF licenses this file to You under the Apache License, Version 2.0
	 * (the "License"); you may not use this file except in compliance with
	 * the License.  You may obtain a copy of the License at
	 * 
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 * 
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/**
	 * Initializes the log queue processors.
	 * @param  {Array} logs   Array of logs to append to.
	 * @param  {Object} config Configuration object to use when logging.
	 */
	function initSender(logs, config) {
	  sendOnInterval(logs, config);
	  sendOnClose(logs, config);
	}

	/**
	 * Checks the provided log array on an interval, flushing the logs
	 * if the queue has reached the threshold specified by the provided config.
	 * @param  {Array} logs   Array of logs to read from.
	 * @param  {Object} config Configuration object to be read from.
	 */
	function sendOnInterval(logs, config) {
	  setInterval(function() {
	    if (logs.length >= config.logCountThreshold) {
	      sendLogs(logs.slice(0), config.url, 0); // Send a copy
	      logs.splice(0); // Clear array reference (no reassignment)
	    }
	  }, config.transmitInterval);
	}

	/**
	 * Attempts to flush the remaining logs when the window is closed.
	 * @param  {Array} logs   Array of logs to be flushed.
	 * @param  {Object} config Configuration object to be read from.
	 */
	function sendOnClose(logs, config) {
	  if (navigator.sendBeacon) {
	    window.addEventListener('unload', function() {
	      navigator.sendBeacon(config.url, JSON.stringify(logs));
	    });
	  } else {
	    window.addEventListener('beforeunload', function() {
	      if (logs.length > 0) {
	        sendLogs(logs, config.url, 1);
	      }
	    })
	  }
	}

	/**
	 * Sends the provided array of logs to the specified url,
	 * retrying the request up to the specified number of retries.
	 * @param  {Array} logs    Array of logs to send.
	 * @param  {string} url     URL to send the POST request to.
	 * @param  {Number} retries Maximum number of attempts to send the logs.
	 */
	function sendLogs(logs, url, retries) {
	  var req = new XMLHttpRequest();

	  var data = JSON.stringify(logs);

	  req.open('POST', url);
	  req.setRequestHeader('Content-type', 'application/json;charset=UTF-8');

	  req.onreadystatechange = function() {
	    if (req.readyState === 4 && req.status !== 200) {
	      if (retries > 0) {
	        sendLogs(logs, url, retries--);
	      }
	    }
	  };

	  req.send(data);
	}

	var config = {};
	var logs = [];
	exports.started = false;


	// Start up Userale
	config.on = false;
	config.useraleVersion = version$1;

	configure(config, getInitialSettings());
	initPackager(logs, config);

	if (config.autostart) {
	  setup(config);
	}

	/**
	 * Hooks the global event listener, and starts up the
	 * logging interval.
	 * @param  {Object} config Configuration settings for the logger
	 */
	function setup(config) {
	  if (!exports.started) {
	    setTimeout(function() {
	      var state = document.readyState;

	      if (state === 'interactive' || state === 'complete') {
	        attachHandlers(config);
	        initSender(logs, config);
	        exports.started = config.on = true;
	      } else {
	        setup(config);
	      }
	    }, 100);
	  }
	}


	// Export the Userale API
	var version = version$1;

	/**
	 * Used to start the logging process if the
	 * autostart configuration option is set to false.
	 */
	function start() {
	  if (!exports.started) {
	    setup(config);
	  }

	  config.on = true;
	}

	/**
	 * Halts the logging process. Logs will no longer be sent.
	 */
	function stop() {
	  config.on = false;
	}

	/**
	 * Updates the current configuration
	 * object with the provided values.
	 * @param  {Object} newConfig The configuration options to use.
	 * @return {Object}           Returns the updated configuration.
	 */
	function options(newConfig) {
	  if (newConfig !== undefined) {
	    configure(config, newConfig);
	  }

	  return config;
	}

	/**
	 * Appends a log to the log queue.
	 * @param  {Object} customLog The log to append.
	 * @return {boolean}          Whether the operation succeeded.
	 */
	function log(customLog) {
	  if (customLog !== null && typeof customLog === 'object') {
	    logs.push(customLog);
	    return true;
	  } else {
	    return false;
	  }
	}

	exports.version = version;
	exports.start = start;
	exports.stop = stop;
	exports.options = options;
	exports.log = log;

}((this.userale = this.userale || {})));