document.addEventListener('DOMContentLoaded', function() {
    // COLOR DISPLAY
    const canvas1 = document.getElementById('color-display');
    const ctx1 = canvas1.getContext('2d');
    const colorText = document.getElementById('color-text');
    let bgColor = RGBAColor.FromHex('#3c60deff');
    drawColor();

    function drawColor(){
        colorText.innerText = `${bgColor} rgba(${bgColor.red},${bgColor.green},${bgColor.blue},${bgColor.alpha})`;
        ctx1.clearRect(0,0, canvas1.width, canvas1.height);
        ctx1.beginPath();
        ctx1.fillStyle = bgColor;
        ctx1.rect(0, 0, canvas1.width, canvas1.height);
        ctx1.fill();
        ctx1.closePath();
    }

    bgColor.OnUpdated = () => drawColor();

    const setListener = (id, handler) => {
        const elem = document.getElementById(id);
        if(!elem) {
            console.error(id, 'not found');
            return;
        }
        elem.value = '' + bgColor[id];
        elem.addEventListener('change', e => handler(+e.target.value));
    }

    setListener('red', val => {
        bgColor.Red = val;
    });

    setListener('green', val => {
        bgColor.Green = val;
    });

    setListener('blue', val => {
        bgColor.Blue = val;
    });

    setListener('alpha', val => {
        bgColor.Alpha = val;
    });

    // RAINBOW DISPLAY
    function drawColorSection(begin, end, color){
        ctx2.beginPath();
        ctx2.fillStyle = color;
        ctx2.rect(begin, 0, end, canvas1.height);
        ctx2.fill();
        ctx2.closePath();
    }
    const canvas2 = document.getElementById('rainbow-display');
    const ctx2 = canvas2.getContext('2d');
    const red = '#e92600ff';
    const orange = '#e99700ff';
    const yellow = '#ecd400ff';
    const green = '#00d33fff';
    const lightBlue = '#38adffff';
    const blue = '#194dffff';
    const violet = '#8f4dffff';

    const array = [red, orange, yellow, green, lightBlue, blue, violet];
    const sectionSize = canvas2.width / 7;
    const GRADIENT_RESOLUTION = 20;
    const subSectionSize = sectionSize / GRADIENT_RESOLUTION;
    for(let i = 0; i < 6; i++) {
        const color = RGBAColor.FromHex(array[i]);
        const nextColor = RGBAColor.FromHex(array[i+1]);
        for(let j = 0; j < GRADIENT_RESOLUTION; j++) {
            const startOfSection = sectionSize * i + subSectionSize * j;
            const endOfSection = startOfSection + subSectionSize;
            drawColorSection(startOfSection, endOfSection, color.LerpTo(nextColor, j / GRADIENT_RESOLUTION).colorHex);
        }
    }


    // GLORY TO UKRAINE

    function drawColorSectionVertical(begin, end, color){
        ctx3.beginPath();
        ctx3.fillStyle = color;
        ctx3.rect(0, begin, canvas3.width, end);
        ctx3.fill();
        ctx3.closePath();
    }
    const canvas3 = document.getElementById('ukraine-flag-display');
    const ctx3 = canvas3.getContext('2d');
    const color1 = RGBAColor.FromHex(blue);
    const color2 = RGBAColor.FromHex(yellow);
    const FLAG_RESOLUTION = 200;
    const subSectionSize2 = canvas3.height / FLAG_RESOLUTION;

    for(let j = 0; j < FLAG_RESOLUTION; j++) {
        const startOfSection = subSectionSize2 * j;
        const endOfSection = startOfSection + subSectionSize2;
        let factor;
        if(j < FLAG_RESOLUTION / 2 - 5) factor = 0;
        else if(j > FLAG_RESOLUTION / 2 + 5) factor = 1;
        else factor = (j - (FLAG_RESOLUTION / 2 - 5)) / 10;
        console.log(factor);
        drawColorSectionVertical(
            startOfSection,
            endOfSection,
            color1.LerpTo(
                color2,
                factor
            ).colorHex
        );
    }
});

