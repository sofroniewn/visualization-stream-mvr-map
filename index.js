var writer = require('to2')
var raf = require('raf')

function convertMap (maze) {
  var map = {}
  map['area'] = []
  maze.area.forEach(function (el) {
    var line = []
    for (var i = 0; i < el.x.length; i++) {
      line.push([el.x[i], el.y[i]])
    }
    map['area'].push(line)
  })
  map['borders'] = []
  maze.borders.forEach(function (el) {
    var line = []
    for (var i = 0; i < el.x.length; i++) {
      line.push([el.x[i], el.y[i]])
    }
    map['borders'].push(line)
  })
  map['triggers'] = []
  maze.triggers.forEach(function (el) {
    var line = []
    for (var i = 0; i < el.x.length; i++) {
      line.push([el.x[i], el.y[i]])
    }
    map['triggers'].push(line)
  })
  map['links'] = []
  maze.links.forEach(function (el) {
    map['links'].push([[el.x[0], el.y[0]], [el.x[1], el.y[1]]], [[el.x[2], el.y[2]], [el.x[3], el.y[3]]])
  })
  return map
}

module.exports = function () {
  var map = null
  var playerShape = [[-2,-1.5], [0, 1.5], [2, -1.5]]
  var playerStart = [0, 0.5]

  return {
    createStream: function (initMap) {
      map = convertMap(initMap)
      var canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 800
      canvas.style.backgroundColor = '#000000'
      document.body.appendChild(canvas)

      drawPolygon = function (context, points, props) {
        if (props.fill || props.stroke) {
          if (props.shadow) {
            context.shadowBlur = props.shadow.size
            context.shadowColor = props.shadow.color
          }
          context.beginPath()
          context.lineCap = 'round'
          points.forEach(function (xy) {
            context.lineTo(xy[0], xy[1])
          })
          //context.closePath()
          context.lineWidth = props.thickness || 1
          context.fillStyle = props.fill
          context.strokeStyle = props.stroke
          if (props.stroke) context.stroke()
          if (props.fill) context.fill()
          if (props.shadow) {
            context.shadowBlur = 0
          }
        }
      }

      scale = function (canvas, points) {
        width = 75.6 // determine automatically from map as max - min
        height = 95.4 // determine automatically from map as max - min
        return points.map(function (xy) {
          return [xy[0]/width*canvas.width/2*0.90 + canvas.width / 2, 0.9625*canvas.height - 0.925*xy[1]/height*canvas.height]
        })
      }

      shift = function (orig, points) {
        return points.map(function (xy) {
          return [xy[0] + orig[0], xy[1] + orig[1]]
        })
      }

      var context = canvas.getContext('2d');
      var position = playerStart
      var hit = [[[position, position], [position, position]], [[position, position], [position, position]], [[position, position], [position, position]]]

      raf(function tick() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawPolygon(context, scale(canvas, map.area[0]), {
          fill: '#D6D0C4',
        })

        drawPolygon(context, scale(canvas, map.borders[0]), {
          stroke: '#5e5e5e',
          thickness: 7,
        })

        drawPolygon(context, scale(canvas, map.borders[1]), {
          stroke: '#5e5e5e',
          thickness: 7,
        })

        drawPolygon(context, scale(canvas, map.triggers[0]), {
          fill: '#17B2E6',
        })

        drawPolygon(context, scale(canvas, shift(position, playerShape)), {
          fill: '#AB051E',
        })

        hit.forEach(function (el) {
          el.forEach(function (el) {
            drawPolygon(context, scale(canvas, [el[0], el[1]]), {
              stroke: '#AB051E',
              thickness: 2,
            })
          }) 
        })

        raf(tick)
      })

      return writer.obj(function (data, enc, callback) {
        position = [data.positionLateral, data.positionForward]
        hit = data.hit
        callback()
      })
    },
    updateTrial: function(newMap) {
      map = convertMap(newMap)
    }
  }
}
