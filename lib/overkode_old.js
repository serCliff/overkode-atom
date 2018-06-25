'use babel';

import OverkodeView from './overkode-view';
import { CompositeDisposable } from 'atom';

const user = null;
const sem = true;

export default {

  overkodeView: null,
  modalPanel: null,
  subscriptions: null,
  aceSocket: null,

  activate(state) {
    this.overkodeView = new OverkodeView(state.overkodeViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.overkodeView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    textBuffer = atom.workspace.getActiveTextEditor().getBuffer()
    this.roomName = baseName(textBuffer.getPath())
    this.user = getRandomInt(0,9999);
    // Register command that toggles this view
    this.subscriptions.add(
      textBuffer.onDidChange((values) => {
          // do something
          console.log(values.changes[0]);

      });
    );


    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'overkode:connect': () => this.connect()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'overkode:sm': () => this.sm()
    }));

  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.overkodeView.destroy();
  },

  serialize() {
    return {
      overkodeViewState: this.overkodeView.serialize()
    };
  },


  connect() {

    console.log('Overkode was connected!');

    this.aceSocket = new WebSocket("ws://127.0.0.1:8000/ws/ace/"+this.roomName+"/");

    // atom.notifications.addSuccess('Overkode was connected!\n\n'+'http://127.0.0.1:8000/ace/'+this.roomName);

    console.log(this.aceSocket);

    this.aceSocket.onclose = function(e) {
      console.error('Chat socket closed unexpectedly');
      atom.notifications.addInfo('Socket closed')
    };

    this.aceSocket.onopen = function(e) {
      splitted = e.target.url.split("ws://127.0.0.1:8000/ws")
      website = "http://127.0.0.1:8000"+splitted[1]
      atom.notifications.addSuccess('Overkode was connected!\n\n'+website);
      atom.workspace.getActiveTextEditor().setTextInBufferRange([[2,0],[2,0]], "hola!!", [])


    };

    this.aceSocket.onmessage = function(e) {
      console.log(e)
    };

  },

  sm() {
    a = this.aceSocket.send(JSON.stringify( {'creation': {'timestamp': 'now', 'user': 123, 'action': 'connecting'}} ));
    atom.notifications.addSuccess('Sent Message!');
    console.log(a);
  },


};

// ATOM EDITOR
function set_text(range, text, atom){
  atom.workspace.getActiveTextEditor().setTextInBufferRange(range, text, []);
};



// AUX METHODS
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function baseName(str)
{
   var base = new String(str).substring(str.lastIndexOf('/') + 1);
    if(base.lastIndexOf(".") != -1)
        base = base.substring(0, base.lastIndexOf("."));
   return base;
}
