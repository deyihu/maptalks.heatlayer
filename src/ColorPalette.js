class ColorPalette {
    getImageData(config) {
        const gradientConfig = config.gradient || config.defaultGradient;
        let paletteCanvas;
        if (typeof document === 'undefined') {
            // var Canvas = require('canvas');
            // paletteCanvas = new Canvas(256, 1);
        } else {
            paletteCanvas = document.createElement('canvas');
        }
        const paletteCtx = paletteCanvas.getContext('2d');

        paletteCanvas.width = 256;
        paletteCanvas.height = 1;

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
