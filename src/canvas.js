let tempCanvas;

export function getTempCanvas() {
    if (!tempCanvas) {
        tempCanvas = document.createElement('canvas');
        tempCanvas.width = 1;
        tempCanvas.height = 1;
    }
    return tempCanvas;
}

export function clearCanvas(ctx) {
    const { width, height } = ctx.canvas;
    ctx.clearRect(0, 0, width, height);
}

export function getCanvasContext(canvas) {
    return canvas.getContext('2d', { willReadFrequently: true });
}
