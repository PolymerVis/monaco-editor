/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

// DO NOT EDIT THIS GENERATED OUTPUT DIRECTLY!
// This file should be overwritten as part of your build process.
// If you need to extend the behavior of the generated service worker, the best approach is to write
// additional code and include it using the importScripts option:
//   https://github.com/GoogleChrome/sw-precache#importscripts-arraystring
//
// Alternatively, it's possible to make changes to the underlying template file and then use that as the
// new base for generating output, via the templateFilePath option:
//   https://github.com/GoogleChrome/sw-precache#templatefilepath-string
//
// If you go that route, make sure that whenever you update your sw-precache dependency, you reconcile any
// changes made to this original template file with your modified copy.

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren, quotes, comma-spacing */
'use strict';

var precacheConfig = [["bower_components/font-roboto/roboto.html","50a4457123c499ff4c0a13aa13f92983"],["bower_components/iron-a11y-keys-behavior/iron-a11y-keys-behavior.html","e3c773cb481ccc7539cf61c5e994e3f0"],["bower_components/iron-behaviors/iron-button-state.html","03abf479cb6fbf60e83aec1e93f602b1"],["bower_components/iron-behaviors/iron-control-state.html","ba130c38639bec8358c840f676dca6fd"],["bower_components/iron-demo-helpers/demo-pages-shared-styles.html","14d54fd71e52652c38edfc308327edc3"],["bower_components/iron-demo-helpers/demo-snippet.html","170230200a5a96f8856f807be672589b"],["bower_components/iron-flex-layout/iron-flex-layout-classes.html","5c0a1b7665339c668c1af0ce56bb1ef5"],["bower_components/iron-flex-layout/iron-flex-layout.html","e7cd9a037db439056ca92eaca9b74664"],["bower_components/iron-icon/iron-icon.html","bd8f8bc585d40488e5456fb8ae1b8576"],["bower_components/iron-iconset-svg/iron-iconset-svg.html","8f71334b09c7fe86f3755709dc7e6308"],["bower_components/iron-menu-behavior/iron-menu-behavior.html","626775f565eab1ca16ec33d00d7f14ad"],["bower_components/iron-menu-behavior/iron-menubar-behavior.html","5c6662113952baa77fb0f5093136abbb"],["bower_components/iron-meta/iron-meta.html","d3c6ce7ab199264556eb3dc30e9050b1"],["bower_components/iron-resizable-behavior/iron-resizable-behavior.html","7b020485aec7d80fdf126996ba44e83a"],["bower_components/iron-selector/iron-multi-selectable.html","abfb529ac2d1cddd1ddb380451015cc6"],["bower_components/iron-selector/iron-selectable.html","7fe18c9d3fcdde5cff5d5d2837725bda"],["bower_components/iron-selector/iron-selection.html","6820931a3f3849002e7a95cabd6d23f5"],["bower_components/marked-element/marked-element.html","49f3cb313c7bb42211edcce49a71dcce"],["bower_components/marked-element/marked-import.html","7bcb02ba342628e5ef3104cb4a66a20f"],["bower_components/marked/lib/marked.js","8cf2548397fd582ce8e065218bddd0a7"],["bower_components/monaco-editor/monaco-editor.html","d5af6ff60b2b4f5a8aa7ea8413e58490"],["bower_components/monaco-editor/monaco-schema-vega-lite.js","603d6906a8a10e6ed2ff8153d4623a37"],["bower_components/monaco-editor/monaco-schema-vega.js","8eb7c6a81257691e8bfdb84ee2ee2e6a"],["bower_components/monaco-editor/monaco-schemas.html","33278f7565c959b49b5ce3b073f71a11"],["bower_components/monaco-editor/monaco-schemas.js","93e914d5297d378c76c4678e7e865cff"],["bower_components/monaco-editor/node_modules/monaco-editor/min/vs/loader.js","daf0c47c6031f1566bcf820d951ab835"],["bower_components/paper-behaviors/paper-inky-focus-behavior.html","5e34513d00a9b66055202e85990c1feb"],["bower_components/paper-behaviors/paper-ripple-behavior.html","dba097e9308cc1d673bfddb996c0f060"],["bower_components/paper-icon-button/paper-icon-button.html","98228b90c08418b85b4106d7dae1d730"],["bower_components/paper-ripple/paper-ripple.html","857bfb9402ec02531501e62ad9ab8b89"],["bower_components/paper-styles/color.html","866b6ec41ce8d64f1c2d855b5575c2f8"],["bower_components/paper-styles/default-theme.html","e8d31d2b3b8a50ffcc41309a0d30d6fd"],["bower_components/paper-tabs/paper-tab.html","b41713b4d329bc5b81387d62ba37c7c3"],["bower_components/paper-tabs/paper-tabs-icons.html","c48ea33d583e13726e490f48c721bfa4"],["bower_components/paper-tabs/paper-tabs.html","3a0d41e43c6614c50cb069528fd56c20"],["bower_components/polymer-vis/polymer-vis.html","7d126e2d806e2b98e01aa4f686fab690"],["bower_components/polymer-vis/polymer-vis.js","859b99a1b834288b5eb8f8a9c4c69e7d"],["bower_components/polymer/lib/elements/array-selector.html","c98c3739af0bb72ecafec75b30c00527"],["bower_components/polymer/lib/elements/custom-style.html","9e264eada2044840c0645dffce840961"],["bower_components/polymer/lib/elements/dom-bind.html","30a6381d72d6b3745b6af8e00bb511cf"],["bower_components/polymer/lib/elements/dom-if.html","ff91452e16d1d9414cbe195a539f2b6d"],["bower_components/polymer/lib/elements/dom-module.html","58255467ee9d14b88f497d1403526c63"],["bower_components/polymer/lib/elements/dom-repeat.html","1ea67e59ee56dbb745cc054fcb02f48b"],["bower_components/polymer/lib/legacy/class.html","425380bccf813d715e3e02cfa5ef5bab"],["bower_components/polymer/lib/legacy/legacy-element-mixin.html","b6345314677979975018413ef3c46dd6"],["bower_components/polymer/lib/legacy/mutable-data-behavior.html","7204fc3600b8055e64555ae72b93172c"],["bower_components/polymer/lib/legacy/polymer-fn.html","98f3ccc626ba22a646333eb2ce2ea500"],["bower_components/polymer/lib/legacy/polymer.dom.html","5f37c1a70092c03a9eff9c19cda61a1b"],["bower_components/polymer/lib/legacy/templatizer-behavior.html","a55016c31558f1080129c6f3962ab6ea"],["bower_components/polymer/lib/mixins/dir-mixin.html","31cff4d96f2cb0896d22abeea74b287f"],["bower_components/polymer/lib/mixins/element-mixin.html","cdd95e1478c2ebe81baf14de7cd8953f"],["bower_components/polymer/lib/mixins/gesture-event-listeners.html","b31a49d82d3805af87818b3e53ab4611"],["bower_components/polymer/lib/mixins/mutable-data.html","a80cc269b5d6a48c317ae0740981adb3"],["bower_components/polymer/lib/mixins/property-accessors.html","af2a88604c33ca92f2a2b945f143e4ba"],["bower_components/polymer/lib/mixins/property-effects.html","665dddac9c89ff5262c9ae0cb6115629"],["bower_components/polymer/lib/mixins/template-stamp.html","d74a115ea5a3dd5eeba7ec21d15c2f60"],["bower_components/polymer/lib/utils/array-splice.html","339ac1cbf962543ce01bb1b4c48bdc31"],["bower_components/polymer/lib/utils/async.html","f37a62bee6706cf7d238ef4522ae219f"],["bower_components/polymer/lib/utils/boot.html","0f8df995a7b07914203b641e0264c731"],["bower_components/polymer/lib/utils/case-map.html","462e6522491725c44d357337c8088dd7"],["bower_components/polymer/lib/utils/debounce.html","039befd530c8a87fbd2b504fcbf359a3"],["bower_components/polymer/lib/utils/flattened-nodes-observer.html","010533c3d25a2558fb4b13cd8a75ec77"],["bower_components/polymer/lib/utils/flush.html","cd5125e070988c9329e5119dbaf864ad"],["bower_components/polymer/lib/utils/gestures.html","a7c8893c4a198856f5495ab9c9c4c848"],["bower_components/polymer/lib/utils/import-href.html","46c29c17f2c707eed932c5a09ea3f7de"],["bower_components/polymer/lib/utils/mixin.html","5431b0027fd6525d05e09141defdc2a6"],["bower_components/polymer/lib/utils/path.html","b9ceaa5bceb01d1900fc2b957ec54cf4"],["bower_components/polymer/lib/utils/render-status.html","2ba8499f2f1a07d43081d4316197dcb2"],["bower_components/polymer/lib/utils/resolve-url.html","070a89863051056ff9b11cf7be5df75c"],["bower_components/polymer/lib/utils/settings.html","588fc78b339e4c8a69ad622a78061e6b"],["bower_components/polymer/lib/utils/style-gather.html","6c5cd28d53d56a73df16252708535c15"],["bower_components/polymer/lib/utils/templatize.html","2c3e977edb5df3b1d75641590db429a7"],["bower_components/polymer/lib/utils/unresolved.html","91b0d5a50989cdeddd3481eddefc3919"],["bower_components/polymer/polymer-element.html","39275b896623fee1e7e694f2c8fd3773"],["bower_components/polymer/polymer.html","564b54a6e1b1b5eebcb43ad4c850dab5"],["bower_components/prism-element/prism-highlighter.html","3c584b2fa5e9626a0e453e8c5f173d56"],["bower_components/prism-element/prism-import.html","adc6e6f2eeac0e86d3410cd0a748181a"],["bower_components/prism-element/prism-theme-default.html","b2a0d0de3a32424a640e38a28567b0d7"],["bower_components/prism/prism.js","67fd0e3f2374f10f3be4a09315a6352f"],["bower_components/prism/themes/prism.css","298e3aafa62f48b863042aa3696a2b34"],["bower_components/shadycss/apply-shim.html","a7855a6be7cd2ceab940f13c1afba1f3"],["bower_components/shadycss/apply-shim.min.js","38765ad94ef12f71e43b6537a6ee6d7f"],["bower_components/shadycss/custom-style-interface.html","7784f566f143bec28bf67b864bedf658"],["bower_components/shadycss/custom-style-interface.min.js","6e2cb1745040846fe648378e542eeb62"],["bower_components/vega-element/vega-element.html","d6b5d11934c0b00ebbb37674c61535e1"],["bower_components/vega-element/vega-lite.html","30d2b28171751453fe56cb0d1ff27ac7"],["bower_components/vega-element/vega-tooltip.html","ace21ad0442e759c74c5d269af1bfa4d"],["bower_components/vega-element/vega.html","5cc52c5a6e9dbfb12883bb2dcbe65d6e"],["bower_components/vega-lite/build/vega-lite.min.js","45d9774c6c17ac54f666c7e906e247c4"],["bower_components/vega-tooltip/build/vega-tooltip.min.css","a1ab04fb8d27a564e516de8a3d4b442b"],["bower_components/vega-tooltip/build/vega-tooltip.min.js","80ffd5f61f278711afb87ba6e10b520f"],["bower_components/vega/docs/vega.js","e929462a9fc0a1d35d03526a2de80ba4"],["bower_components/webcomponentsjs/webcomponents-lite.js","b591b76678e2f5d584eff169fd0ff2f8"],["index.html","cae63ad67b1ebe7ef7b5289779c55d12"],["src/demo/index.html","500d28979971f2f92970cc928629c51e"],["src/demo/monaco-schemas.html","949f980b2059af04ac4e0bb30785d8f7"],["src/demo/vega-editor.html","34681ae7bf714dd78229dd01b544f959"],["src/monaco-editor-demo/monaco-editor-demo.html","4aae678648a0c5f027faf8d8b9ef9f53"]];
var cacheName = 'sw-precache-v3--' + (self.registration ? self.registration.scope : '');


var ignoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var cleanResponse = function (originalResponse) {
    // If this is not a redirected response, then we don't have to do anything.
    if (!originalResponse.redirected) {
      return Promise.resolve(originalResponse);
    }

    // Firefox 50 and below doesn't support the Response.body stream, so we may
    // need to read the entire body to memory as a Blob.
    var bodyPromise = 'body' in originalResponse ?
      Promise.resolve(originalResponse.body) :
      originalResponse.blob();

    return bodyPromise.then(function(body) {
      // new Response() is happy when passed either a stream or a Blob.
      return new Response(body, {
        headers: originalResponse.headers,
        status: originalResponse.status,
        statusText: originalResponse.statusText
      });
    });
  };

var createCacheKey = function (originalUrl, paramName, paramValue,
                           dontCacheBustUrlsMatching) {
    // Create a new URL object to avoid modifying originalUrl.
    var url = new URL(originalUrl);

    // If dontCacheBustUrlsMatching is not set, or if we don't have a match,
    // then add in the extra cache-busting URL parameter.
    if (!dontCacheBustUrlsMatching ||
        !(url.pathname.match(dontCacheBustUrlsMatching))) {
      url.search += (url.search ? '&' : '') +
        encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue);
    }

    return url.toString();
  };

var isPathWhitelisted = function (whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
      return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
      return path.match(whitelistedPathRegex);
    });
  };

var stripIgnoredUrlParameters = function (originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);
    // Remove the hash; see https://github.com/GoogleChrome/sw-precache/issues/290
    url.hash = '';

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var hashParamName = '_sw-precache';
var urlsToCacheKeys = new Map(
  precacheConfig.map(function(item) {
    var relativeUrl = item[0];
    var hash = item[1];
    var absoluteUrl = new URL(relativeUrl, self.location);
    var cacheKey = createCacheKey(absoluteUrl, hashParamName, hash, false);
    return [absoluteUrl.toString(), cacheKey];
  })
);

function setOfCachedUrls(cache) {
  return cache.keys().then(function(requests) {
    return requests.map(function(request) {
      return request.url;
    });
  }).then(function(urls) {
    return new Set(urls);
  });
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return setOfCachedUrls(cache).then(function(cachedUrls) {
        return Promise.all(
          Array.from(urlsToCacheKeys.values()).map(function(cacheKey) {
            // If we don't have a key matching url in the cache already, add it.
            if (!cachedUrls.has(cacheKey)) {
              var request = new Request(cacheKey, {credentials: 'same-origin'});
              return fetch(request).then(function(response) {
                // Bail out of installation unless we get back a 200 OK for
                // every request.
                if (!response.ok) {
                  throw new Error('Request for ' + cacheKey + ' returned a ' +
                    'response with status ' + response.status);
                }

                return cleanResponse(response).then(function(responseToCache) {
                  return cache.put(cacheKey, responseToCache);
                });
              });
            }
          })
        );
      });
    }).then(function() {
      
      // Force the SW to transition from installing -> active state
      return self.skipWaiting();
      
    })
  );
});

self.addEventListener('activate', function(event) {
  var setOfExpectedUrls = new Set(urlsToCacheKeys.values());

  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.keys().then(function(existingRequests) {
        return Promise.all(
          existingRequests.map(function(existingRequest) {
            if (!setOfExpectedUrls.has(existingRequest.url)) {
              return cache.delete(existingRequest);
            }
          })
        );
      });
    }).then(function() {
      
      return self.clients.claim();
      
    })
  );
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    // Should we call event.respondWith() inside this fetch event handler?
    // This needs to be determined synchronously, which will give other fetch
    // handlers a chance to handle the request if need be.
    var shouldRespond;

    // First, remove all the ignored parameters and hash fragment, and see if we
    // have that URL in our cache. If so, great! shouldRespond will be true.
    var url = stripIgnoredUrlParameters(event.request.url, ignoreUrlParametersMatching);
    shouldRespond = urlsToCacheKeys.has(url);

    // If shouldRespond is false, check again, this time with 'index.html'
    // (or whatever the directoryIndex option is set to) at the end.
    var directoryIndex = '';
    if (!shouldRespond && directoryIndex) {
      url = addDirectoryIndex(url, directoryIndex);
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond is still false, check to see if this is a navigation
    // request, and if so, whether the URL matches navigateFallbackWhitelist.
    var navigateFallback = 'index.html';
    if (!shouldRespond &&
        navigateFallback &&
        (event.request.mode === 'navigate') &&
        isPathWhitelisted(["\\/[^\\/\\.]*(\\?|$)"], event.request.url)) {
      url = new URL(navigateFallback, self.location).toString();
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond was set to true at any point, then call
    // event.respondWith(), using the appropriate cache key.
    if (shouldRespond) {
      event.respondWith(
        caches.open(cacheName).then(function(cache) {
          return cache.match(urlsToCacheKeys.get(url)).then(function(response) {
            if (response) {
              return response;
            }
            throw Error('The cached response that was expected is missing.');
          });
        }).catch(function(e) {
          // Fall back to just fetch()ing the request if some unexpected error
          // prevented the cached response from being valid.
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});







