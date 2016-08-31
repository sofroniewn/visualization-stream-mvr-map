var viz = require('./')()
var IPCStream = require('electron-ipc-stream')
var ipcsD = new IPCStream('device')
var ipcsT = new IPCStream('trial')
var ipcRenderer = require('electron').ipcRenderer

var stream = null

ipcsT.on('data', function (data) {
  viz.updateTrial(data.map)
})

ipcRenderer.on('initViz', function (event, map) {
  stream = viz.createStream(map)
  ipcsD.pipe(stream)
})