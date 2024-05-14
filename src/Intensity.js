class Intensity {
    constructor(options) {
        options = options || {};
        this.gradient = options.gradient || {
            0.25: 'rgba(0, 0, 255, 1)',
            0.55: 'rgba(0, 255, 0, 1)',
            0.85: 'rgba(255, 255, 0, 1)',
            1.0: 'rgba(255, 0, 0, 1)'
        };
        this.maxSize = options.maxSize || 35;
        this.max = options.max || 100;
        this.initPalette();
    }

    initPalette() {
        const gradient = this.gradient;
        let paletteCanvas;
        if (typeof document === 'undefined') {
            // var Canvas = require('canvas');
            // paletteCanvas = new Canvas(256, 1);
        } else {
            paletteCanvas = document.createElement('canvas');
        }

        paletteCanvas.width = 256;
        paletteCanvas.height = 1;

        const paletteCtx = this.paletteCtx = paletteCanvas.getContext('2d');

        const lineGradient = paletteCtx.createLinearGradient(0, 0, 256, 1);

        for (const key in gradient) {
            lineGradient.addColorStop(parseFloat(key), gradient[key]);
        }

        paletteCtx.fillStyle = lineGradient;
        paletteCtx.fillRect(0, 0, 256, 1);
    }

    getColor(value) {
        const max = this.max;

        if (value > max) {
            value = max;
        }

        const index = Math.floor(value / max * (256 - 1)) * 4;

        const imageData = this.paletteCtx.getImageData(0, 0, 256, 1).data;

        return 'rgba(' + imageData[index] + ', ' + imageData[index + 1] + ', ' + imageData[index + 2] + ', ' + imageData[index + 3] / 256 + ')';
    }

    getSize(value) {
        let size = 0;
        const max = this.max;
        const maxSize = this.maxSize;

        if (value > max) {
            value = max;
        }

        size = value / max * maxSize;

        return size;
    }
}

export default Intensity;
