(function(PolymerVis) {
  PolymerVis.monaco = PolymerVis.monaco || {};

  class MonacoProxy {
    constructor(iframe, editorReference) {
      this._iframe_ = iframe;
      this._editorReference_ = editorReference;
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
        }
      };
    }
    postMessage(msg) {
      msg.editorReference = this._editorReference_;
      this._iframe_.contentWindow.postMessage(msg, document.location.href);
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
        }
      };
    }
  }

  class EditorProxy {
    constructor(iframe, editorReference) {
      this._iframe_ = iframe;
      this._editorReference_ = editorReference;
    }

    postMessage(msg) {
      msg.editorReference = this._editorReference_;
      this._iframe_.contentWindow.postMessage(msg, document.location.href);
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
            console.log(editorReference)
            var proxy = {};
            var queue = [];
            
            require.config({
              paths: {vs: "${libPath}"}
            });

            require(['vs/editor/editor.main'], () => {
              proxy.monaco = monaco;
              var div = document.querySelector('#editor')
              proxy.editor = monaco.editor.create(div, ${JSON.stringify(opts)});
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

            var resizeHandler = ()=> {
              if(proxy.editor) {
                var clientRects = document.body.getClientRects()[0]
                proxy.editor.layout({width : clientRects.width, height: clientRects.height})
              }
            };
            
            window.addEventListener('resize', resizeHandler);

            window.addEventListener('message', handler);

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
              if (event === 'layout') {
                resizeHandler();
              }
              if (event === 'setModelLanguage') {
                args[0] = proxy.editor.getModel();
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
