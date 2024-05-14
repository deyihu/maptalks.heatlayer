import CanvasHeat from './CanvasHeat';
import { Util, renderer, Coordinate, Point, Layer, Canvas } from 'maptalks';
import { DEFAULT_MAX, DEFAULT_SIZE } from './Constant';

const options = {
    'max': DEFAULT_MAX,
    'gradient': {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red'
    },
    // 'radius': 15,
    // 'blur': 15,
    // 'minOpacity': 0.05,
    'size': DEFAULT_SIZE,
    'hitDetect': false,
    forceRenderOnMoving: true,
    forceRenderOnZooming: true,
    forceRenderOnRotating: true,
    progressiveRenderCount: 5000,
    progressiveRender: false
};

function isGeoJSONFeatureCollection(data) {
    return data.features;
}

function isGeoJSONFeature(data) {
    return data.geometry;
}

function isGeoJSONGeometry(data) {
    return data.coordinates && data.type;
}

function getGeoJSONFeatureCoordinates(feature) {
    const { type, coordinates } = feature.geometry || feature || {};
    if (type === 'Point' && coordinates) {
        return coordinates;
    }
}

function getDataItem(item) {
    if (Array.isArray(item)) {
        const len = item.length;
        if (len === 4) {
            const [x, y, z, count] = item;
            return {
                coordinates: [x, y, z],
                count: count || 1
            };
        }
        if (len === 3) {
            const [x, y, count] = item;
            return {
                coordinates: [x, y],
                count: count || 1
            };
        }
        return {
            coordinates: item,
            count: 1
        };
    }
    if (item.coordinates) {
        item.count = item.count || 1;
        return item;
    }
    if (item instanceof Coordinate) {
        return {
            coordinates: item.toArray(),
            count: 1
        };
    }
    console.error('not support coordinates format', item);
    return null;
}

function checkData(data) {
    const result = [];
    if (!data) {
        return result;
    }
    if (isGeoJSONFeatureCollection(data)) {
        const features = data.features || [];
        for (let i = 0, len = features.length; i < len; i++) {
            const feature = features[i];
            if (!feature) {
                continue;
            }
            if (isGeoJSONFeature(feature)) {
                const coordinates = getGeoJSONFeatureCoordinates(feature);
                if (coordinates) {
                    result.push({ coordinates, count: 1 });
                }
            }
        }
    } else if (Array.isArray(data) && typeof data[0] !== 'number') {
        for (let i = 0, len = data.length; i < len; i++) {
            const d = data[i];
            if (!d) {
                continue;
            }
            if (isGeoJSONFeature(d) || isGeoJSONGeometry(d)) {
                const coordinates = getGeoJSONFeatureCoordinates(d);
                if (coordinates) {
                    result.push({ coordinates, count: 1 });
                }
            }
            const item = getDataItem(d);
            if (item) {
                result.push(item);
            }
        }
    } else if (Array.isArray(data)) {
        result.push({
            coordiantes: data,
            count: 1
        });
    } else if (isGeoJSONFeature(data) || isGeoJSONGeometry(data)) {
        const coordinates = getGeoJSONFeatureCoordinates(data);
        if (coordinates) {
            result.push({ coordinates, count: 1 });
        }
    } else {
        console.error('not support data format', data);
    }
    return result;
}

export class HeatLayer extends Layer {

    constructor(id, options) {
        super(id, options);
        this._heats = [];
    }

    getData() {
        return this._heats;
    }

    setData(data) {
        const heats = checkData(data);
        this._heats = heats || [];
        return this.redraw();
    }

    addData(data) {
        if (!data) {
            return this;
        }
        const heat = checkData(data);
        Util.pushIn(this._heats, heat);
        return this.redraw();
    }

    onConfig(conf) {
        for (const p in conf) {
            if (options[p]) {
                return this.redraw();
            }
        }
        return this;
    }

    setOpacity(opacity) {

        super.setOpacity(opacity);
        this.redraw();
        return this;

    }

    redraw() {
        const renderer = this._getRenderer();
        if (renderer) {
            // renderer.clearHeatCache();
            renderer.setToRedraw();
        }
        return this;
    }

    isEmpty() {
        return this._heats.length === 0;
    }

    clear() {
        this._heats = [];
        this.redraw();
        this.fire('clear');
        return this;
    }

    /**
     * Export the HeatLayer's JSON.
     * @return {Object} layer's JSON
     */
    toJSON(options) {
        // if (!options) {
        //     options = {};
        // }
        // const json = {
        //     'type': this.getJSONType(),
        //     'id': this.getId(),
        //     'options': this.config()
        // };
        // const data = this.getData();
        // if (options['clipExtent']) {
        //     let clipExtent = new MTK.Extent(options['clipExtent']);
        //     const r = this._getHeatRadius();
        //     if (r) {
        //         clipExtent = clipExtent._expand(r);
        //     }
        //     const clipped = [];
        //     for (let i = 0, len = data.length; i < len; i++) {
        //         if (clipExtent.contains(new MTK.Coordinate(data[i][0], data[i][1]))) {
        //             clipped.push(data[i]);
        //         }
        //     }
        //     json['data'] = clipped;
        // } else {
        //     json['data'] = data;
        // }

        // return json;
    }

    /**
     * Reproduce a HeatLayer from layer's JSON.
     * @param  {Object} json - layer's JSON
     * @return {maptalks.HeatLayer}
     * @static
     * @private
     * @function
     */
    static fromJSON(json) {
        // if (!json || json['type'] !== 'HeatLayer') { return null; }
        // return new HeatLayer(json['id'], json['data'], json['options']);
    }
}

HeatLayer.mergeOptions(options);

HeatLayer.registerJSONType('HeatLayer');

function clearCanvas(canvas) {
    if (!canvas) {
        return null;
    }
    const ctx = Canvas.getCanvas2DContext(canvas);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return ctx;
}

HeatLayer.registerRenderer('canvas', class extends renderer.CanvasRenderer {

    setToRedraw() {
        super.setToRedraw();
        this._resetProgressiveRender();
        return this;
    }

    needToRedraw() {
        if (this.isProgressiveRender() && !this.renderEnd) {
            return true;
        }
        return super.needToRedraw();
    }

    isProgressiveRender() {
        const layer = this.layer;
        if (!layer) {
            return false;
        }
        const { progressiveRender } = layer.options || {};
        return progressiveRender;
    }

    _checkSnapshotCanvas() {
        if (!this.isProgressiveRender()) {
            delete this.snapshotCanvas;
            delete this.snapshotCanvasCtx;
            return null;
        }
        const canvas = this.canvas;
        if (!canvas) {
            delete this.snapshotCanvas;
            delete this.snapshotCanvasCtx;
            return null;
        }
        if (!this.snapshotCanvas) {
            this.snapshotCanvas = Canvas.createCanvas(1, 1);
        }
        const snapshotCanvas = this.snapshotCanvas;
        const { width, height, style } = canvas;
        if (snapshotCanvas.width !== width || snapshotCanvas.height !== height) {
            snapshotCanvas.width = width;
            snapshotCanvas.height = height;
        }
        if (snapshotCanvas.style.width !== style.width || snapshotCanvas.style.height !== style.height) {
            snapshotCanvas.style.width = style.width;
            snapshotCanvas.style.height = style.height;
        }
        if (!this.snapshotCanvasCtx) {
            this.snapshotCanvasCtx = clearCanvas(this.snapshotCanvas);
        }
        return snapshotCanvas;

    }

    _getCurrentNeedRenderGeos() {
        const geos = this.layer._heats || [];
        if (!this.isProgressiveRender()) {
            return geos;
        }
        const layer = this.layer;
        const { progressiveRenderCount } = layer.options;
        const pageSize = progressiveRenderCount;
        const page = this.page;
        const start = (page - 1) * pageSize, end = page * pageSize;
        const pageGeos = geos.slice(start, end);
        return pageGeos;
    }

    _resetProgressiveRender() {
        this.renderEnd = false;
        this.page = 1;
        this._clearSnapshotCanvas();
    }

    _clearSnapshotCanvas() {
        const snapshotCanvas = this._checkSnapshotCanvas();
        if (snapshotCanvas) {
            this.snapshotCanvasCtx = clearCanvas(snapshotCanvas);
        }
    }

    _snapshot() {
        const progressiveRender = this.isProgressiveRender();
        if (!progressiveRender) {
            return this;
        }
        const layer = this.layer;
        const { progressiveRenderCount } = layer.options;
        const geos = layer._heats || [];
        const pages = Math.ceil(geos.length / progressiveRenderCount);
        this.renderEnd = this.page >= pages;
        if (!this.renderEnd) {
            this.page++;
        }
        return this;
    }

    _draw() {
        const map = this.getMap(),
            layer = this.layer;
        if (!map || !layer) {
            return;
        }
        this.prepareCanvas();
        this._checkSnapshotCanvas();
        if (!this._heater) {
            this._heater = new CanvasHeat();
        }
        const heats = this._getCurrentNeedRenderGeos();

        let { xmin, ymin, xmax, ymax } = map.getExtent();

        let isValidate = xmin < xmax && ymin < ymax;
        if (isValidate) {
            const { width, height } = map.getSize();
            const size = this.layer.options.size || 8;
            const p1 = new Point(width / 2 + size * 2, height / 2);
            const p2 = new Point(width / 2, height / 2 + size * 2);
            const c1 = map.containerPointToCoord(p1);
            const c2 = map.containerPointToCoord(p2);
            const center = map.getCenter();
            const dx = Math.max(Math.abs(c1.x - center.x), Math.abs(c2.x - center.x));
            const dy = Math.max(Math.abs(c1.y - center.y), Math.abs(c2.y - center.y));
            xmin -= dx;
            ymin -= dy;
            xmax += dx;
            ymax += dy;
            isValidate = xmin < xmax && ymin < ymax;
        }

        const pixels = [];
        const coordTransformSupportBatch = map.coordinatesToContainerPoints;
        const coords = [], filterHeats = [];
        for (let i = 0, len = heats.length; i < len; i++) {
            const item = heats[i];
            const { coordinates, count } = item;
            const [x, y] = coordinates;
            if (isValidate) {
                if (x < xmin || x > xmax || y < ymin || y > ymax) {
                    continue;
                }
            }
            if (!item._c) {
                const c = new Coordinate(coordinates);
                item._c = c;
                c.z = c.z || 0;
            }
            if (!coordTransformSupportBatch) {
                const pt = map.coordToContainerPoint(item._c);
                pixels.push({
                    xy: [pt.x, pt.y],
                    count: count || 1
                    // type: 'Point'
                });
            } else {
                coords.push(item._c);
                filterHeats.push(item);
            }
        }
        if (coordTransformSupportBatch) {
            const pts = map.coordinatesToContainerPoints(coords);
            for (let i = 0, len = pts.length; i < len; i++) {
                const pt = pts[i];
                pixels.push({
                    xy: [pt.x, pt.y],
                    count: filterHeats[i].count || 1
                    // type: 'Point'
                });
            }
        }
        // const time = 'time';
        // console.time(time);
        const dpr = map.getDevicePixelRatio() || 1;
        const needScale = dpr !== 1 && this.snapshotCanvas && this.snapshotCanvasCtx;
        if (needScale) {
            this.snapshotCanvasCtx.scale(dpr, dpr);
        }
        this._heater.draw(this.snapshotCanvasCtx || this.context, pixels, this.layer.options, this.context);
        if (needScale) {
            const rScale = 1 / dpr;
            this.snapshotCanvasCtx.scale(rScale, rScale);
        }
        // console.timeEnd(time);
        this.completeRender();
    }

    draw() {
        this._draw();
        this._snapshot();
    }

    drawOnInteracting() {
        this._clearSnapshotCanvas();
        this.page = 1;
        this._draw();
    }

    onZoomEnd() {
        delete this._heatViews;
        super.onZoomEnd.apply(this, arguments);
    }

    onResize() {
        if (this.canvas) {
            // const size = this.getMap().getSize();
            // const width = size.width, height = size.height;
            // this._heater._canvas.width = width;
            // this._heater._canvas.height = height;
            // // this._heater._width = width;
            // // this._heater._height = height;
            // this._heater.resize();
        }
        // console.log(this._heater)
        super.onResize.apply(this, arguments);
    }

    onRemove() {
        delete this._heater;
        delete this.snapshotCanvas;
        delete this.snapshotCanvasCtx;
    }
});
