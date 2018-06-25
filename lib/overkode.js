'use babel';

import OverkodeView from './overkode-view';
import { CompositeDisposable } from 'atom';

var textBuffer = null;


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

    // TODO: Pensar en llevarse esto a connect()
    this.textBuffer = atom.workspace.getActiveTextEditor().getBuffer()
    this.roomName = baseName(this.textBuffer.getPath())
    this.user = getRandomInt(0,9999);
    // Register command that toggles this view
    this.subscriptions.add(
      this.textBuffer.onDidChange((values) => {
        // do something
        console.log(values.changes[0])

      })
    );

    current_text = atom.workspace.getActiveTextEditor().getTextInBufferRange( [[ 0, 0 ], [ 2, 44 ]] )
    console.log("current_text");
    console.log(current_text);

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
    // TODO: Necesitamos desencapsular los metodos para poderles pasar variables
    
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
      // set_text([[2,0],[2,0]], "hola!!", atom)


    };

    this.aceSocket.onmessage = function(e) {
      var data = JSON.parse(e.data);
      console.log("Received from websocket")
      console.log(data)

      // if (data['creation']['action'] == "connecting") {
      //     connecting_message()
      // } else {
      //     edition_message(data)
      // };
    };

  },

  sm() {
    // a = this.aceSocket.send(JSON.stringify( {'creation': {'timestamp': 'now', 'user': 123, 'action': 'connecting'}} ));
    // atom.notifications.addSuccess('Sent Message!');
    current_text = atom.workspace.getActiveTextEditor().getTextInBufferRange( [[ 2, 44 ], [ 2, 44 ]] )
    console.log(current_text);
  },






};


function set_text(range, text, atom){
  atom.workspace.getActiveTextEditor().setTextInBufferRange(range, text, []);
};

function remove_text(delta, atom){

}

function insert_text(delta, atom){
    //Insert the text on the editor
    var start = delta['start']
    var end = delta['end']
    var lines = delta['lines']

    var text = ""
    for (var row in lines){
        text += lines[row]
        if(row != (lines.length-1)){
            text+="\n"
        }
    };
    current_text = atom.workspace.getActiveTextEditor().getTextInBufferRange([[ start['row'], start['column'] ], [end['row'], end['column']]] )
    // current_text = editor.session.getTextRange(new ace.Range( start['row'], start['column'], end['row'], end['column'] ))
    debugger;
    if ( current_text != text  ) {
        //Update the editor inserting new text on his specific place
        range = [[start['column'], start['row']], [start['column'], start['row']] ]
        set_text(range, text, atom)

    } else {
        //If the text exists but can be an update or insert the same characters on the same place
        line_text = atom.workspace.getActiveTextEditor().lineTextForBufferRow(start['row'])
        console.log(line_text)
        debugger;
        if (line_text != text) {
            doc.insert(doc.indexToPosition(start['column'], start['row']), text);
        };
    };
};

// Connecting message
function connecting_message(){
    this.aceSocket.send(
        JSON.stringify( {'creation': {'timestamp': 'now', 'user': this.user, 'action': 'connecting'}} ));
};


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
