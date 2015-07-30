
var ColorManager = function(){

  function rgbString(r,g,b,a){
    r = clamped(r, 0, 255);
    g = clamped(g, 0, 255);
    b = clamped(b, 0, 255);
    a = clamped(a, 0, 255);
    return 'rgba('+Math.floor(r)+','+Math.floor(g)+','+Math.floor(b)+','+a+')';
  }

  function clamped(n, min, max){
    return Math.max(min, Math.min(n, max));
  }

  function interp(v1,v2,x){
    return v2*x+v1*(1-x);
  }

  function getGradientColor(colors, i, scaleFactor){
    var fIndex = i*scaleFactor;
    var iIndex = Math.floor(fIndex);
    var iv = fIndex - iIndex;
    var iIndex1 = iIndex+1;
    if (iIndex1 > colors.length - 1){ iIndex1 = iIndex; }

    return {
      r:  interp(colors[iIndex][0], colors[iIndex1][0], iv),
      g:  interp(colors[iIndex][1], colors[iIndex1][1], iv),
      b:  interp(colors[iIndex][2], colors[iIndex1][2], iv),
      a:  interp(colors[iIndex][3], colors[iIndex1][3], iv)
    };
  }

  function getIndexedColor(colors, i, scaleFactor){
    var index = Math.floor(i*scaleFactor);
    return {
      r: colors[index][0],
      g: colors[index][1],
      b: colors[index][2],
      a: colors[index][3],
    };
  }

  function getScaledColor(val, scale){
    val *= scale;
    return val > 255 ? 255 : val;
  }

  function getHighlightColor(color, options){
    return {
      r: getScaledColor(color.r, options.colorHighlightMultiplier),
      g: getScaledColor(color.g, options.colorHighlightMultiplier),
      b: getScaledColor(color.b, options.colorHighlightMultiplier),
      a: color.a
    };
  }

  function cssColorToArray(color){
    return cssColorParser(color);
  }
 
  function getDataRange(data){
    var max = -Infinity, min = Infinity;
    data.datasets.forEach(function(dataset){
      var datasetMax = Math.max.apply(null, dataset.data);
      var datasetMin = Math.min.apply(null, dataset.data);
      if (datasetMax > max) { max = datasetMax; }
      if (datasetMin < min) { min = datasetMin; }
    });
    return max-min;
  };


  this.getColor = function(){
    console.error('ColorManager: colors have not been setup');
  };

  this.colors = [];

  this.setup = function(data, colors, options){
    var colorFunction, scaleFactor;
    var dataLength = getDataRange(data);

    if (options.colorInterpolation === 'gradient'){
      colorFunction = getGradientColor;
      scaleFactor = (colors.length-1)/(dataLength -1);
    } else {
      colorFunction = getIndexedColor;
      scaleFactor = colors.length/datalLength;
    } 

    this.colors = colors.map(function(clr){
      return cssColorToArray(clr);
    });
    
    this.getColor = function(dataValue){
      var clr = colorFunction(this.colors, dataValue, scaleFactor);
      var hclr = getHighlightColor(clr, options);

      return { 
        color: rgbString(clr.r, clr.g, clr.b, clr.a),
        highlight: rgbString(hclr.r, hclr.g, hclr.b, hclr.a)
      };
    } 
  };


  function applyColors(colors, layers, options){
    var results = [];
    var scaleFactor;
    var colorFunction;

    if (options.colorInterpolation === 'gradient'){
      colorFunction = getGradientColor;
      scaleFactor = (colors.length-1)/(layers.length-1);
    } else {
      colorFunction = getIndexedColor;
      scaleFactor = colors.length/layers.length;
    }

    // this function returns a copy of the layers
    var orderedLayers = getLayersInColorOrder(layers, options);
    var clr, hclr;

    for (var i = 0; i < orderedLayers.length; i++){
      if (orderedLayers[i].fillColor){
        if (orderedLayers[i].highlightColor){
          orderedLayers[i].color = orderedLayers[i].fillColor;
          orderedLayers[i].hoverColor = orderedLayers[i].highlightColor;
        } else {
          clr = cssColorToObject(orderedLayers[i].fillColor);
          hclr = getHighlightColor(clr, options);
          orderedLayers[i].color = rgbString(clr.r, clr.g, clr.b, clr.a);
          orderedLayers[i].hoverColor = rgbString(hclr.r, hclr.g, hclr.b, hclr.a);
        }
      } else {
        clr = colorFunction(colors, i, scaleFactor);
        hclr = getHighlightColor(clr, options);
        orderedLayers[i].color = rgbString(clr.r, clr.g, clr.b, clr.a);
        orderedLayers[i].hoverColor = rgbString(hclr.r, hclr.g, hclr.b, hclr.a);
      }

    }

    return layers;
  }

};
