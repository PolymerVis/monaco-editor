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

var precacheConfig = [["bower_components/font-roboto/roboto.html","3dd603efe9524a774943ee9bf2f51532"],["bower_components/iron-a11y-keys-behavior/iron-a11y-keys-behavior.html","7e459d599801c582676534c6d03a4b13"],["bower_components/iron-behaviors/iron-button-state.html","7f7f96935de5deaf9a51264225eb1a5a"],["bower_components/iron-behaviors/iron-control-state.html","f1329af310a186a0c3ce264937c34c5e"],["bower_components/iron-demo-helpers/demo-pages-shared-styles.html","252199437b968a9658ec332117dc4f94"],["bower_components/iron-demo-helpers/demo-snippet.html","4cef8f393876cd70082ebf2e6ce5b1eb"],["bower_components/iron-flex-layout/iron-flex-layout-classes.html","7fdc2ab3c7921949621e8374a86e2af4"],["bower_components/iron-flex-layout/iron-flex-layout.html","03e6f060e1a174a51cc599efac9de802"],["bower_components/iron-icon/iron-icon.html","0d81dc84af38dfdaa7eca375ab7a9b9e"],["bower_components/iron-iconset-svg/iron-iconset-svg.html","b4ba3d89346b84fd775da5d96c484015"],["bower_components/iron-menu-behavior/iron-menu-behavior.html","7744b8d275a22ea335c23e4db0012281"],["bower_components/iron-menu-behavior/iron-menubar-behavior.html","300745a77aae1eaa953f015ae1f77025"],["bower_components/iron-meta/iron-meta.html","34aa95312ed8ffc8e3104c297a4b44c8"],["bower_components/iron-resizable-behavior/iron-resizable-behavior.html","ef694568c45e136bc268824fd6de7a0a"],["bower_components/iron-selector/iron-multi-selectable.html","2e226f063dd99d8ecda93977d986176b"],["bower_components/iron-selector/iron-selectable.html","cdf4a3867b5f5e366287b53eded7cae9"],["bower_components/iron-selector/iron-selection.html","19a051eb5d88baed09f6439512841bda"],["bower_components/marked-element/marked-element.html","4eab9a015ab00414d8cd6e5954355d56"],["bower_components/marked-element/marked-import.html","29737e5b52c7e8f16cd1de76869fa688"],["bower_components/marked/lib/marked.js","dc4f68cf84f21c6c71acb135c15863f4"],["bower_components/monaco-editor/monaco-editor.html","6ec352a95ff47aebe668d7cebacf60c3"],["bower_components/monaco-editor/monaco-schema-vega-lite.js","603d6906a8a10e6ed2ff8153d4623a37"],["bower_components/monaco-editor/monaco-schema-vega.js","8eb7c6a81257691e8bfdb84ee2ee2e6a"],["bower_components/monaco-editor/monaco-schemas.html","8ecb24385ca9e6a01f7a698a8d29f2d6"],["bower_components/monaco-editor/monaco-schemas.js","93e914d5297d378c76c4678e7e865cff"],["bower_components/monaco-editor/node_modules/monaco-editor/min/vs/loader.js","3acee370238822ca80948e3a3b4b910f"],["bower_components/paper-behaviors/paper-inky-focus-behavior.html","52c2ca1ef155e8bca281d806fc9a8673"],["bower_components/paper-behaviors/paper-ripple-behavior.html","d865b73dbb028c24ed30c47da4a3e8fe"],["bower_components/paper-icon-button/paper-icon-button.html","c3acafc40e7feb18eec57b7e49df808c"],["bower_components/paper-ripple/paper-ripple.html","0c89f5d6aec27fa86d0a5422dae34099"],["bower_components/paper-styles/color.html","549925227bc04f9c17b52e2e35cd2e26"],["bower_components/paper-styles/default-theme.html","5357609d26772a270098c0e3ebb1bb98"],["bower_components/paper-tabs/paper-tab.html","bd70d15ac4e9925698696f62f0185961"],["bower_components/paper-tabs/paper-tabs-icons.html","f8e9e4ba00752fc54f1046143ba1be28"],["bower_components/paper-tabs/paper-tabs.html","47db13e0009bb14bbbb382e9b69c33e7"],["bower_components/polymer-vis/polymer-vis.html","1d559e5cfc4cb332fc27e514b87a89a1"],["bower_components/polymer-vis/polymer-vis.js","2671896684525519cc70525b902b0045"],["bower_components/polymer/lib/elements/array-selector.html","a8b920f6342d0c0a93209e7f2c7ce2cd"],["bower_components/polymer/lib/elements/custom-style.html","8b8096f121770ec733086535e851d79a"],["bower_components/polymer/lib/elements/dom-bind.html","7846323d2f034392a81a6470d3a95504"],["bower_components/polymer/lib/elements/dom-if.html","2bc89ed73da881118b5dc815ae231c61"],["bower_components/polymer/lib/elements/dom-module.html","c1207c8ad129b1e96a6a8b29cbd0e6f5"],["bower_components/polymer/lib/elements/dom-repeat.html","aa0b12b8bba5b4f31f2287b41275994c"],["bower_components/polymer/lib/legacy/class.html","b3a28b781c4abefac6978fde54514322"],["bower_components/polymer/lib/legacy/legacy-element-mixin.html","bc4dd231af01d3bcf844c75ad33eb5c1"],["bower_components/polymer/lib/legacy/mutable-data-behavior.html","ca93373534d98979a78eb8aa6facc8df"],["bower_components/polymer/lib/legacy/polymer-fn.html","5d99aef273c86bd97b5b35b1252e660a"],["bower_components/polymer/lib/legacy/polymer.dom.html","b752b7d795cbf62cb2f3dc2553ecfd56"],["bower_components/polymer/lib/legacy/templatizer-behavior.html","8e107957eda9b14593cfef065fce57d0"],["bower_components/polymer/lib/mixins/dir-mixin.html","83d3ae058d7f6d43e4dfe9e069f6b2b1"],["bower_components/polymer/lib/mixins/element-mixin.html","9c55c654b0e96c20cab9051bc2945c5a"],["bower_components/polymer/lib/mixins/gesture-event-listeners.html","c354a4fb2a63faebc074cff276533cb2"],["bower_components/polymer/lib/mixins/mutable-data.html","ffa78b3164fc1a2f8eec19cf303e9c3e"],["bower_components/polymer/lib/mixins/property-accessors.html","5613fd803d5b295d7923d6677d29a2ad"],["bower_components/polymer/lib/mixins/property-effects.html","4a04dede764eb189bcfebeae87b217a0"],["bower_components/polymer/lib/mixins/template-stamp.html","1c982cc1e445b29ada06a1c240bed696"],["bower_components/polymer/lib/utils/array-splice.html","d2bb02b1c08121d1597fdf59f1e3fac9"],["bower_components/polymer/lib/utils/async.html","775a189357dd03e8638682924de8cc83"],["bower_components/polymer/lib/utils/boot.html","06e75c73d0545e069dfca2e8c2c978a0"],["bower_components/polymer/lib/utils/case-map.html","09a10641f0af240bf5f4e7406899e3e6"],["bower_components/polymer/lib/utils/debounce.html","e6bda7bb7d338088cbce78e2c230b345"],["bower_components/polymer/lib/utils/flattened-nodes-observer.html","69786cef72296bb7e86eaa857a894e81"],["bower_components/polymer/lib/utils/flush.html","c2c1a523aae0b066aeb4fb7b6c247293"],["bower_components/polymer/lib/utils/gestures.html","81124691c911ece9f74740bffabc8c39"],["bower_components/polymer/lib/utils/import-href.html","4a541763590e235c25da6d8bbf790de8"],["bower_components/polymer/lib/utils/mixin.html","d09c423f377db40fc2e0074fdd3ec17c"],["bower_components/polymer/lib/utils/path.html","e833e5f67bec5678897a885a7a0f3b45"],["bower_components/polymer/lib/utils/render-status.html","103c32d3aa48564db34d93594a19f6ff"],["bower_components/polymer/lib/utils/resolve-url.html","d5d32c9b4c30c7ad8bc655cf424aa3c0"],["bower_components/polymer/lib/utils/settings.html","1c51481b8bb506bf9df1bdde4ac3f1c7"],["bower_components/polymer/lib/utils/style-gather.html","019c47cfa7c2fc85543c627bf59522d0"],["bower_components/polymer/lib/utils/templatize.html","5d84654aab6089ddafe02032a509ce40"],["bower_components/polymer/lib/utils/unresolved.html","2ed3277470301933b1af10d413d8c614"],["bower_components/polymer/polymer-element.html","31b98668d3a96df5ab93c6fd2dd8d6db"],["bower_components/polymer/polymer.html","041f02f3388a7a3c087298fde431df80"],["bower_components/prism-element/prism-highlighter.html","6556a76c08e8ffca77d850454735515d"],["bower_components/prism-element/prism-import.html","9ed19158a2c23c9fa5cb3b2953eeefac"],["bower_components/prism-element/prism-theme-default.html","b31328e57256a2ed2f5c9cf6ca539e3b"],["bower_components/prism/prism.js","67fd0e3f2374f10f3be4a09315a6352f"],["bower_components/prism/themes/prism.css","298e3aafa62f48b863042aa3696a2b34"],["bower_components/shadycss/apply-shim.html","5b73ef5bfcac4955f6c24f55ea322eb1"],["bower_components/shadycss/apply-shim.min.js","38765ad94ef12f71e43b6537a6ee6d7f"],["bower_components/shadycss/custom-style-interface.html","7e28230b85cdcc2488e87172c3395d52"],["bower_components/shadycss/custom-style-interface.min.js","6e2cb1745040846fe648378e542eeb62"],["bower_components/vega-element/vega-element.html","7f25f48eb2aaa12ce6b1c8a6acd10f25"],["bower_components/vega-element/vega-lite.html","3faf0bd2b619de14b65a7a8ffcd6ebf0"],["bower_components/vega-element/vega-tooltip.html","cc9c787ca7191a0f8f506db509d2c286"],["bower_components/vega-element/vega.html","68f12da31ac1b3bf954bfb5761ce7bc6"],["bower_components/vega-lite/build/vega-lite.min.js","d73d49bce94ddad63ed2f7921a5a2cc3"],["bower_components/vega-tooltip/build/vega-tooltip.min.css","a1ab04fb8d27a564e516de8a3d4b442b"],["bower_components/vega-tooltip/build/vega-tooltip.min.js","86b8ab6d57b328c56b9a32e46cbd924d"],["bower_components/vega/docs/vega.js","c915c48e5ff171ff602b0b688c8382a1"],["bower_components/webcomponentsjs/webcomponents-lite.js","b591b76678e2f5d584eff169fd0ff2f8"],["index.html","286440d0df0ed41902fb598d4a77e396"],["src/demo/index.html","308940651f75597ac1e694cb60047f9b"],["src/demo/monaco-schemas.html","bd99eea3a970d4153bb810d0b9ec7b61"],["src/demo/vega-editor.html","a35b51b34ced19907ded6de0488b6405"],["src/monaco-editor-demo/monaco-editor-demo.html","70f08e7e5d3f45469bc1200b337f17d7"]];
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







