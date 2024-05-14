// import Intensity from './Intensity';
import ColorPalette from './ColorPalette';
import { DEFAULT_MAX, DEFAULT_SIZE } from './Constant';
const circleCache = {};
// const IntensityCache = {};

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
        return circle;
    }

    colorize(pixels, gradient, options) {
        const maxOpacity = options.maxOpacity || 0.8;
        for (let i = 3, len = pixels.length, j; i < len; i += 4) {
            j = pixels[i] * 4; // get gradient color from opacity value

            if (pixels[i] / 256 > maxOpacity) {
                pixels[i] = 256 * maxOpacity;
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
        for (let i = 0, len = data.length; i < len; i++) {
            const item = data[i];
            const count = item.count || 1;
            const alpha = Math.min(1, roundFun(count / max, 2));
            dataOrderByAlpha[alpha] = dataOrderByAlpha[alpha] || [];
            dataOrderByAlpha[alpha].push(item);
        }
        const w = circle.width / 2, h = circle.height / 2;
        for (const i in dataOrderByAlpha) {
            if (isNaN(i)) { continue; }
            const _data = dataOrderByAlpha[i];
            // context.beginPath();
            if (!options.withoutAlpha) {
                if (context.globalAlpha !== i) {
                    context.globalAlpha = i;
                }
            }
            for (let j = 0, len = _data.length; j < len; j++) {
                const item = _data[j];
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

    draw(context, data, options, resultContext) {
        const { canvas } = context;
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
            return;
        }
        options = options || {};
        // context.save();
        this.drawGray(context, data, options);
        if (!options.absolute) {
            const colored = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
            this.colorize(colored.data, ColorPalette.getImageData({
                defaultGradient: options.gradient || {
                    0.25: 'rgba(0, 0, 255, 1)',
                    0.55: 'rgba(0, 255, 0, 1)',
                    0.85: 'rgba(255, 255, 0, 1)',
                    1.0: 'rgba(255, 0, 0, 1)'
                }
            }), options);
            resultContext.putImageData(colored, 0, 0);
            // context.restore();
            // return colored;
        }
    }
}

export default CanvasHeat;
