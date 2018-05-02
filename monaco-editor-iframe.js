(function(PolymerVis) {
  PolymerVis.monaco = PolymerVis.monaco || {};

  class MonacoProxy {
    constructor(iframe, editorReference) {
      this._iframe_ = iframe;
      this._editorReference_ = editorReference;
      this._messageFlowActive_ = false;
      this._delayedMessages_ = [];
      this.languages.json.jsonDefaults.setDiagnosticsOptions;
    }
    get languages() {
      return {
        json: {
          jsonDefaults: {
            setDiagnosticsOptions: opts => {
              this.postMessage({
                path: ['monaco', 'languages', 'json', 'jsonDefaults'],
                event: 'setDiagnosticsOptions',
                args: [opts]
              });
            }
          }
        },
        registerCompletionItemProvider: (languageId, provider) => {
          if (provider.provideCompletionItems) {
            provider.provideCompletionItems = provider.provideCompletionItems.toString();
          }
          if (provider.resolveCompletionItem) {
              provider.resolveCompletionItem = provider.resolveCompletionItem.toString();
          }
          this.postMessage({
            path: ['monaco', 'languages'],
            event: 'registerCompletionItemProvider',
            args: [languageId, provider]
          });
        },
        registerSignatureHelpProvider: (languageId, provider) => {
          if (provider.provideSignatureHelp) {
            provider.provideSignatureHelp = provider.provideSignatureHelp.toString();
          }
          this.postMessage({
            path: ['monaco', 'languages'],
            event: 'registerSignatureHelpProvider',
            args: [languageId, provider]
          });
        }
      };
    }
    postMessage(msg) {
      msg.editorReference = this._editorReference_;
      if (this._messageFlowActive_) {
        this._iframe_.contentWindow.postMessage(msg, document.location.href);
      }
      else {
        this._delayedMessages_.push(msg);
      }
    }
    setMessageFlowActive(value) {
      this._messageFlowActive = value;
      if (value) {
        for (let msg of this._delayedMessages_) {
          this._iframe_.contentWindow.postMessage(msg, document.location.href);
        }
        this._delayedMessages_ = [];
      }
    }
    get editor() {
      return {
        setModelLanguage: (model, language) => {
          this.postMessage({
            path: ['monaco', 'editor'],
            event: 'setModelLanguage',
            args: [null, language]
          });
        },
        layout: () => {
          this.postMessage({
            path: ['monaco', 'editor'],
            event: 'layout',
            args: [null]
          });
        },
        setTheme: theme => {
          this.postMessage({
            path: ['monaco', 'editor'],
            event: 'setTheme',
            args: [theme]
          });
        },
        highlightLine: (debugInfo) => {
          if(debugInfo){
              this.postMessage({
                path: ['monaco', 'editor'],
                event: 'highlightLine',
                args: [debugInfo]
              })
          }
        },
        removeHighlights: () => {
          this.postMessage({
            path: ['monaco', 'editor'],
            event: 'removeHighlights',
            args: []
        })
      },
      addTypeScriptLibs: (libs) => {
          this.postMessage({
            path: ['monaco', 'editor'],
            event: 'addLibs',
            args: [libs]
          })
        }
      };
  }
}

  class EditorProxy {
    constructor(iframe, editorReference) {
      this._iframe_ = iframe;
      this._editorReference_ = editorReference;
      this._messageFlowActive_ = false;
      this._delayedMessages_ = [];
    }

    postMessage(msg) {
      msg.editorReference = this._editorReference_;
      if (this._messageFlowActive_) {
        this._iframe_.contentWindow.postMessage(msg, document.location.href);
      }
      else {
        this._delayedMessages_.push(msg);
      }
    }

    setMessageFlowActive(value) {
      this._messageFlowActive = value;
      if (value) {
        for (let msg of this._delayedMessages_) {
          this._iframe_.contentWindow.postMessage(msg, document.location.href);
        }
        this._delayedMessages_ = [];
      }
    }

    updateOptions(opts) {
      this.postMessage({
        path: ['editor'],
        event: 'updateOptions',
        args: [opts]
      });
    }

    getModel() {
      return {
        setValue: value => {
          this.postMessage({
            path: ['editor'],
            event: 'setValue',
            args: [value]
          });
        }
      };
    }

    dispose() {
      this.postMessage({path: ['editor'], event: 'dispose', args: []});
    }
  }

  class MonacoIFrame {
    constructor(root) {
      this._root_ = root;
      this._iframe_ = document.createElement('iframe');
      this._iframe_.id = 'monaco-iframe';
      this._iframe_.scrolling = 'no';

      this._root_.appendChild(this._iframe_);

      this._node_ = this.document.createElement('div');
      this._node_.id = 'editor';
      this.document.body.appendChild(this._node_);
      this._monaco_ = new MonacoProxy(this.iframe);
      this._editor_ = new EditorProxy(this.iframe);
    }
    get monaco() {
      return this._monaco_;
    }
    get editor() {
      return this._editor_;
    }
    get root() {
      return this._root_;
    }
    get node() {
      return this._node_;
    }
    get iframe() {
      return this._iframe_;
    }
    get document() {
      return this.iframe.contentWindow.document;
    }
    get proxy() {
      return this._proxy_;
    }
    activateMessageFlow() {
      this.editor.setMessageFlowActive(true);
      this.monaco.setMessageFlowActive(true);
    }
    resize(w, h) {
      this.node.style.height = h;
      this.node.style.width = w;
    }
    insertScriptElement({src, text, onload}) {
      var ele = this.document.createElement('script');
      if (src) ele.src = src;
      if (text) ele.text = text;
      if (onload) ele.onload = onload;
      this.document.head.appendChild(ele);
    }

    insertStyle() {
      var css = `#editor {
        width: 100%;
        height: 100%;
      }
      .debug-red {
        background : red;
      }
      .debug-green {
        background : green;
      }
      html,body {
        margin : 0px;
      }`;
      var head = this.document.head;
      var style = this.document.createElement('style');
      style.type = 'text/css';
      if (style.styleSheet){
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(this.document.createTextNode(css));
      }
      head.appendChild(style);
    }

    init(libPath, opts) {
      this.insertScriptElement({
        src: `${libPath}/loader.js`,
        onload: () => {
          this.insertScriptElement({text: this.loaderOnLoad(libPath, opts)});
          this.insertStyle();
        }
      });
    }

    loaderOnLoad(libPath, opts = {}) {
      return `
            var editorReference = "${opts.editorReference}"
            var proxy = {};
            var queue = [];
            
            require.config({
              paths: {vs: "${libPath}"}
            });

            require(['vs/editor/editor.main'], () => {
              proxy.monaco = monaco;
              var div = document.querySelector('#editor')
              proxy.editor = monaco.editor.create(div, ${JSON.stringify(opts)});
              monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                  target: monaco.languages.typescript.ScriptTarget.ES2017,
                  allowNonTsExtensions: true,
                  noLib: true
              });
              // [
              //   {url : 'https://cdn.rawgit.com/Microsoft/TypeScript/64b3086f/lib/lib.es6.d.ts', name : 'es6.d.ts'},
              //   {url : 'https://cdn.rawgit.com/anandanand84/technicalindicators/235ff767/declarations/generated.d.ts', name : 'Indicators.d.ts', convert : true}
              // ]
              proxy.model = proxy.editor.getModel();
              proxy.model.onDidChangeContent(() => {
                parent.postMessage({editorReference: editorReference, event: 'value-changed', details: proxy.model.getValue()}, parent.document.location.href);
              });
              proxy.editor.onDidFocusEditor(() => {
                parent.postMessage({editorReference: editorReference, event: 'editor-focused'}, parent.document.location.href);
              });
              queue.forEach(e => handler(e));
              queue = [];
              parent.postMessage({editorReference: editorReference, ready: true}, parent.document.location.href);
              resizeHandler();
            });

            async function loadLibs(libs) {
                for(let lib of libs) {
                    var response = await fetch(lib.url)
                    var types = await response.text();
                    if(lib.convert)
                        types = types.replace(new RegExp('default ', 'g'), '').split('export').join('declare');
                    monaco.languages.typescript.typescriptDefaults.addExtraLib(types, lib.name);
                    console.log('Added lib ', lib.name);
                }
            }

            var resizeHandler = ()=> {
              if(proxy.editor) {
                var clientRects = document.body.getClientRects()[0]
                proxy.editor.layout({width : clientRects.width, height: clientRects.height})
              }
            };
            
            window.addEventListener('resize', resizeHandler);

            window.addEventListener('message', handler);
            parent.postMessage({editorReference: editorReference, event: 'editor-message-handler-ready'}, parent.document.location.href);

            function handler(e) {
              var {path, event, args} = e.data;
              var node = path[0];
              if (!proxy[node]) {
                queue.push(e);
                return;
              }
              if (event === 'setValue') {
                proxy.editor.getModel().setValue(args[0]);
                return;
              }
              if(event === 'highlightLine') {
                proxy.editor.decorationList = [];
                var debugInfo = args[0];
                Object.keys(debugInfo).forEach(function (line) {
                  var lineNo = line - 2;
                  var status = debugInfo[line] === 0 ? 'debug-red' : 'debug-green';
                  proxy.editor.decorationList.push({
                      range: new monaco.Range(lineNo,1,lineNo,1),
                      options: {
                        isWholeLine: true,
                        className: status,
                      }
                    });
                })
                proxy.editor.lastDecorations = proxy.editor.deltaDecorations([], proxy.editor.decorationList);;
              }
              if(event === 'removeHighlights') {
                if(proxy.editor.lastDecorations && proxy.editor.lastDecorations.length > 1) {
                  proxy.editor.lastDecorations = proxy.editor.deltaDecorations(proxy.editor.lastDecorations, [{ range: new monaco.Range(1,1,1,1), options : { } }]); 
                }
              }
              if(event === 'addLibs') {
                console.log('loading libs ', args[0])
                var libs = args[0];
                loadLibs(libs);
              }
              if (event === 'layout') {
                resizeHandler();
              }
              if (event === 'setModelLanguage') {
                args[0] = proxy.editor.getModel();
              }
              if (event === 'registerCompletionItemProvider') {
                if (args[1].provideCompletionItems) {
                  args[1].provideCompletionItems = eval(args[1].provideCompletionItems);
                  args[1].resolveCompletionItem = eval(args[1].resolveCompletionItem);
                }
              }
              if (event === 'registerSignatureHelpProvider') {
                if (args[1].provideSignatureHelp) {
                  args[1].provideSignatureHelp = eval(args[1].provideSignatureHelp);
                }
              }
              try {
                let cmd = proxy;
                path.forEach(k => { cmd = cmd[k]; });
                cmd[event](...args);
              } catch (err) {
                console.error(err);
              }
            }
      `;
    }
  }

  PolymerVis.monaco = PolymerVis.monaco || {};
  PolymerVis.monaco.MonacoIFrame = MonacoIFrame;
})((window.PolymerVis = window.PolymerVis || {}));
