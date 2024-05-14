# maptalks.heatlayer

A Simple HeatMap Layer Plugin Based on Maptalks.  

The HeatMap code from [Baidu mapv project](https://github.com/huiyan-fe/mapv/blob/master/src/canvas/draw/heatmap.js)

## Features

* Progressive rendering with large amounts of data

## Examples

## Install

```sh
npm i maptalks
npm i maptalks.heatlayer
```

or

```html
<script type="text/javascript" src="https://unpkg.com/maptalks/dist/maptalks.min.js"></script>
```

## Use

```js
import {
    HeatLayer
} from 'maptalks.heatlayer';

const data = [{
        coordinates: [0, 0, 0],
        count: 1
    },
    //other data item
]

const heatLayer = new HeatLayer('heat', {
    max: 10,
    size: 10,
    progressiveRender: false,
    progressiveRenderCount: 3000,
    //custom colors
    // gradient: {
    //     0.4: 'green',
    //     0.6: '#FDD59F',
    //     0.7: '#FC8E58',
    //     0.8: '#D82C19',
    //     1.0: '#800000'
    // }
}).addTo(map);
heatLayer.setData(data);
```

or

```html
 <script>
     var map = new maptalks.Map('map', {
         "center": [175.48021061, -37.851338],
         "zoom": 12.980308680504713,
         "pitch": 68.45000000000007,
         "bearing": -122.42347481389616,
         baseLayer: new maptalks.TileLayer('base', {
             urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
             subdomains: ["a", "b", "c", "d"],
             attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>'
         })
     });

     const data = [{
             coordinates: [0, 0, 0],
             count: 1
         },
         //other data item
     ]
     const heatLayer = new maptalks.HeatLayer('heat', {
         max: 1000,
         size: 10,
         progressiveRender: false,
         progressiveRenderCount: 3000,
         //custom colors
         // gradient: {
         //     0.4: 'green',
         //     0.6: '#FDD59F',
         //     0.7: '#FC8E58',
         //     0.8: '#D82C19',
         //     1.0: '#800000'
         // }
     }).addTo(map);
     heatLayer.setData(data);
 </script>
```

## API

### HeatLayer

It is maptalks Subclass of Layer

#### constructor(id, options)

* id:the layer id
* options
  + max: the data item count max value
  + size:the heatmap point size(pixel)
  + progressiveRender: Is it progressive rendering
  + progressiveRenderCount: The amount of data per frame during progressive rendering
  + gradient: Color bar, equivalent to Canvas's CanvasGradient

#### methods

* setData(data)

the data support Array Object or GeoJSON

```js
  const data = [{
          coordinates: [0, 0, 0],
          count: 1
      },
      //other data item
  ];
  // or

  const data = {
      type: 'FeatureCollection',
      features: [
          //geojson features
      ]
  }
```

* getData()

* config(options) 

update layer.options, This is maptalks. Layer method,It can apply on all Layers

* other methods

Because it is maptalks Subclass of Layer, so you can use maptalks Layer's method  

  + show()
  + hide(); 
  + setZIndex(zindex); 
  + addTo(map); 
  + remove()
  + setId(id)
  + getId()
  + setOpacity(opacity)
  + ...
