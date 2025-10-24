import { clearCanvas, getCanvasContext, getTempCanvas } from './canvas';

class ColorPalette {
    getImageData(config) {
        const gradientConfig = config.gradient || config.defaultGradient;
        const paletteCanvas = getTempCanvas();
        // if (typeof document === 'undefined') {
        //     // var Canvas = require('canvas');
        //     // paletteCanvas = new Canvas(256, 1);
        // } else {
        //     paletteCanvas = document.createElement('canvas');
        // }

        paletteCanvas.width = 256;
        paletteCanvas.height = 1;
        const paletteCtx = getCanvasContext(paletteCanvas);
        clearCanvas(paletteCtx);

        const gradient = paletteCtx.createLinearGradient(0, 0, 256, 1);
        for (const key in gradientConfig) {
            gradient.addColorStop(parseFloat(key), gradientConfig[key]);
        }

        paletteCtx.fillStyle = gradient;
        paletteCtx.fillRect(0, 0, 256, 1);
        return paletteCtx.getImageData(0, 0, 256, 1).data;
    }
}
export default new ColorPalette();
