// Copyright 2016 The Charles Stark Draper Laboratory
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {logs, emptyLogs} from './packager.js';


function transmitLogs (url) {

  var req = new XMLHttpRequest();

  req.open('POST', url);
  req.setRequestHeader('Content-type', 'application/json;charset=UTF-8');

  req.onreadystatechange = function () {
    if (req.readyState == 4 && req.status == 200) {
      emptyLogs();
    }
  }

  req.send(JSON.stringify(logs));
}


export function sender (config) {
  if (logs.length >= config.logCountThreshold) {
    transmitLogs(config.url);
  }

  setTimeout(function () {
    sender(config);
  }, config.transmitInterval);
}


export function sendEnd (config) {
  window.addEventListener('beforeunload', function () {
    if (logs.length > 0) {
      transmitLogs(config.url);
    }
  }, true);
}