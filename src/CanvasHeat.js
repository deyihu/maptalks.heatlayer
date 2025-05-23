// import Intensity from './Intensity';
import { Browser } from 'maptalks';
import ColorPalette from './ColorPalette';
import { DEFAULT_MAX, DEFAULT_SIZE } from './Constant';
const circleCache = {};
// const IntensityCache = {};
const ALPHACache = new Map();

function roundFun(value, n) {
    const tempValue = Math.pow(10, n);
    return Math.round(value * tempValue) / tempValue;
}

class CanvasHeat {

    createCircle(size) {
        if (circleCache[size]) {
            return circleCache[size];
        }
        let circle;
        if (typeof document === 'undefined') {
            // circle = new Canvas();
        } else {
            circle = document.createElement('canvas');
        }
        const context = circle.getContext('2d');

        const shadowBlur = size / 2;
        const r2 = size + shadowBlur;
        const offsetDistance = 10000;

        circle.width = circle.height = r2 * 2;

        context.shadowBlur = shadowBlur;
        context.shadowColor = 'black';
        context.shadowOffsetX = context.shadowOffsetY = offsetDistance;

        context.beginPath();
        context.arc(r2 - offsetDistance, r2 - offsetDistance, size, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
        circleCache[size] = circle;
        if (Browser.decodeImageInWorker) {
            createImageBitmap(circle).then(imgbitMap => {
                circleCache[size] = imgbitMap;
            });
        }
        return circle;
    }

    colorize(pixels, gradient, options) {
        const maxOpacity = options.maxOpacity || 0.8;
        const opacity = 256 * maxOpacity;
        for (let i = 3, len = pixels.length, j; i < len; i += 4) {
            const alpha = pixels[i];
            if (alpha === 0) {
                continue;
            }
            j = alpha * 4; // get gradient color from opacity value

            if (alpha / 256 > maxOpacity) {
                pixels[i] = opacity;
            }

            pixels[i - 3] = gradient[j];
            pixels[i - 2] = gradient[j + 1];
            pixels[i - 1] = gradient[j + 2];
        }
    }

    drawGray(context, data, options) {
        const max = options.max || DEFAULT_MAX;
        const size = options.size || DEFAULT_SIZE;
        for (const key in options) {
            context[key] = options[key];
        }
        // const key = JSON.stringify({
        //     gradient: options.gradient,
        //     max: max
        // });
        // let color;
        // if (IntensityCache[key]) {
        //     color = IntensityCache[key];
        // } else {
        //     color = new Intensity({
        //         gradient: options.gradient,
        //         max: max
        //     });
        //     IntensityCache[key] = color;
        // }
        const circle = this.createCircle(size);
        const dataOrderByAlpha = {};
        const temp = ALPHACache;
        temp.clear();
        for (let i = 0, len = data.length; i < len; i++) {
            const item = data[i];
            const count = item.count || 1;
            let alpha = temp.get(count);
            if (alpha === undefined) {
                alpha = Math.min(1, roundFun(count / max, 2));
                temp.set(count, alpha);
            }
            dataOrderByAlpha[alpha] = dataOrderByAlpha[alpha] || [];
            const len = dataOrderByAlpha[alpha].length;
            dataOrderByAlpha[alpha][len] = item;
        }
        temp.clear();
        const w = circle.width / 2, h = circle.height / 2;
        let globalAlpha = context.globalAlpha;
        for (const i in dataOrderByAlpha) {
            if (isNaN(i)) { continue; }
            const data = dataOrderByAlpha[i];
            // context.beginPath();
            // if (!options.withoutAlpha) {
            if (globalAlpha !== i) {
                context.globalAlpha = globalAlpha = i;
            }
            // }
            for (let j = 0, len = data.length; j < len; j++) {
                const item = data[j];
                const xy = item.xy;
                // const count = item.count || 1;
                // const alpha = count / max;
                // if (context.globalAlpha !== alpha) {
                //     context.globalAlpha = alpha;
                // }
                context.drawImage(circle, xy[0] - w, xy[1] - h);
            }
        }
    }

    draw(context, data, options, resultContext, gradientImageData) {
        const { canvas } = context;
        if (!canvas) {
            return;
        }
        const { width, height } = canvas;
        if (width === 0 || height === 0) {
            return;
        }
        options = options || {};
        // context.save();
        this.drawGray(context, data, options);
        const colored = context.getImageData(0, 0, width, height);
        gradientImageData = gradientImageData || ColorPalette.getImageData({
            defaultGradient: options.gradient || {
                0.4: 'blue',
                0.6: 'cyan',
                0.7: 'lime',
                0.8: 'yellow',
                1.0: 'red'
            }
        });
        this.colorize(colored.data, gradientImageData, options);
        resultContext.putImageData(colored, 0, 0);
        // context.restore();

    }
}

export default CanvasHeat;
