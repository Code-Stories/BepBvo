'use strict';
/**
 * @ngdoc service
 * @name VCodeInterpreter.factory:VObjectFactory
 * @description
 *
 * factory for the Vobjects
 */

function Canvas(centered) {
"use strict";

  function reposition(p){
        if(centered){
            p.x += center.x;
            p.y += center.y;
        }
    return p;
  }

  var dom = document.createElement('div');
  var canvas = document.createElement('canvas');
  dom.width = width;
  dom.height = height;
  dom.appendChild(canvas);
  canvas.width = width;
  canvas.height = height;
  var center = {
      'x': width / 2,
      'y': height / 2
    }
  var ctx = canvas.getContext('2d');
  var TAU = Math.PI *2;
  
  
  function drawPoint(x,y,r,color){
      var p  = reposition({x:x,y:y});
      ctx.beginPath();
      ctx.arc(p.x,p.y,r || 3, 0,TAU);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
      
  }

  ctx.domEl = dom;
  ctx.drawPoint = drawPoint;
  ctx.center = center;
  
  return ctx;
}
function List(data) {
  var domEl = document.createElement('div');
  var svg = d3.select(domEl).append('svg');
  function update(newData) {
    var boxWidth = 100;
    var boxHeight = 25;
    svg.selectAll('rect').data(newData).enter().append('svg:rect').attr('width', boxWidth).attr('height', boxHeight).attr('stroke', 'black').attr('fill', 'rgba(0,0,0,0)').attr('y', function (d, i) {
      return boxHeight * i;
    });
    svg.selectAll('text').data(newData).enter().append('svg:text').attr('y', function (d, i) {
      return boxHeight * i + 15;
    }).attr('x', 15).attr('fill', 'black');
    svg.selectAll('text').data(newData).text(function (d) {
      return d;
    });
  }
  update(data);
  return {
    domEl: domEl,
    update: update
  };
}
function VArray(data, vertical) {
  var domEl = document.createElement('div');
  var svg = d3.select(domEl).append('svg');
  function update(newData) {
    var boxSize = 20;
    svg.selectAll('rect').data(newData).enter().append('svg:rect').attr('width', boxSize).attr('height', boxSize).attr('stroke', 'black').attr('fill', 'rgba(0,0,0,0)').attr('x', function (d, i) {
      return boxSize * i;
    });
    svg.selectAll('text').data(newData).enter().append('svg:text').attr('x', function (d, i) {
      return boxSize * i + 5;
    }).attr('y', 15).attr('fill', 'black');
    svg.selectAll('text').data(newData).text(function (d) {
      return d;
    });
  }
  update(data);
  return {
    domEl: domEl,
    update: function (data) {
      update(data);
    }
  };
}
function BarChart(data) {
  var domEl = document.createElement('div');
  var chart = d3.select(domEl).append('svg');
  var height = this.height, width = this.width;
  var barWidth = width / data.length;
  var yScale = d3.scale.linear().range([
    height,
    0
  ]);
  yScale.domain([
    0,
    d3.max(data)
  ]);
  var barGroup;
  function update(newData) {
    barGroup = chart.selectAll('g').data(newData);
    var barGroupEnter = barGroup.enter().append('g');
    barGroupEnter.attr('transform', function (d, i) {
      return 'translate(' + barWidth * i + ',0)';
    });
    barGroupEnter.append('rect').attr('fill', 'green').attr('y', height).attr('height', function (d) {
      return height - yScale(d);
    }).attr('width', barWidth - 1);
    barGroupEnter.append('text');
    barGroup.select('rect').transition().attr('height', function (d) {
      return height - yScale(d);
    }).attr('y', function (d) {
      return yScale(d);
    });
    barGroup.select('text').attr('y', function (d) {
      return yScale(d) + 3;
    }).attr('dy', '.75em').text(function (d) {
      return '' + d;
    });
  }
  update(data);
  function highlight(toHighlight, color) {
    barGroup.select('rect').attr('fill', function (d, i) {
      return toHighlight.indexOf(i) > -1 ? color : 'green';
    });
  }
  return {
    domEl: domEl,
    update: update,
    highlight: highlight
  };
}

angular.module('VCodeInterpreter').factory('VObjectFactory', function () {
  var VObjects = {};
  VObjects.VArray = VArray;
  VObjects.BarChart = BarChart;
  VObjects.List = List;
  VObjects.Canvas = Canvas;
  var height = 150, width = 300;
  function setSizeInfo(name) {
    VObjects[name].prototype.width = width;
    VObjects[name].prototype.height = height;
  }
  for (var vobj in VObjects) {
    setSizeInfo(vobj);
  }
  return {
    DomEl: function () {
      return document.createElement('div');
    },
    setVObject: function (name, func) {
      this.VObjects[name] = eval('(' + func + ')');
      setSizeInfo(name);
    },
    VObjects: VObjects
  };
});
