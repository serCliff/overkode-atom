'use babel';

import OverkodeView from './overkode-view';
import { CompositeDisposable } from 'atom';
const AtomSocket = require('atom-socket')
const roomName = "";
// const aceSocket = new WebSocket("ws://127.0.0.1:8000/ws/ace/this.roomName/");

export default {

  overkodeView: null,
  modalPanel: null,
  subscriptions: null,




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
    // Register command that toggles this view
    this.subscriptions.add(
      textBuffer.onDidChange((values) => {
        // do something
        console.log(values.changes[0])

      })
    );


    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'overkode:connect': () => this.connect()
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





    var aceSocket = new WebSocket("ws://127.0.0.1:8000/ws/ace/"+this.roomName+"/");
    atom.notifications.addSuccess('Overkode was connected!');
    // atom.notifications.addSuccess("127.0.0.1:8000/ace/"+this.roomName);
    console.log(aceSocket);


    // return (
    //   this.modalPanel.isVisible() ?
    //   this.modalPanel.hide() :
    //   this.modalPanel.show()
    // );
    aceSocket.onclose = function(e) {
      console.error('Chat socket closed unexpectedly');
    };

    aceSocket.onmessage = function(e) {
      console.log(e)
    };

  }



};




// this.aceSocket.on('error', (err) => {
//   console.error(err)
// })
//
// this.aceSocket.on('open', () => {
//   console.log('Client Connected')
// })
//
// this.aceSocket.on('open:cached', () => {
//   console.log('Client Connected through Existing WebSocket')
// })
//
// this.aceSocket.send('hello world')
//
// this.aceSocket.close()
//
// this.aceSocket.reset()



function baseName(str)
{
   var base = new String(str).substring(str.lastIndexOf('/') + 1);
    if(base.lastIndexOf(".") != -1)
        base = base.substring(0, base.lastIndexOf("."));
   return base;
}
