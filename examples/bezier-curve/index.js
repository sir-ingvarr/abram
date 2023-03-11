document.addEventListener('DOMContentLoaded', function() {

    const { Classes: { RGBAColor, BezierCurve, Point } } = window.Abram;

    const canvas = document.getElementById('display-test');
    const ctx = canvas.getContext('2d');
    const dotsColor = new RGBAColor(230, 0, 0, 255);
    const lineColor1 = new RGBAColor(0, 204, 0, 255);
    const lineColor2 = new RGBAColor(150, 0, 200, 255);

    const p1 = new Point(40, 40);
    const p2 = new Point(500, 400);
    const p3 = new Point(500, 30);

    const curve = new BezierCurve(p1, p2, p3);
    ctx.beginPath();
    ctx.fillStyle = dotsColor.toString();
    ctx.arc(p1.x, p1.y, 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(p2.x, p2.y, 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(p3.x, p3.y, 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();



    for(let i=0; i<1; i+=0.05) {
        ctx.beginPath();
        ctx.fillStyle = lineColor1.LerpTo(lineColor2, i).toString();
        const point = curve.Eval(i);
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

});

