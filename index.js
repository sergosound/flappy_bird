document.addEventListener('DOMContentLoaded', () => {
    createCanvas()
});

function createCanvas() {
    const imgBackground = new Image();
    imgBackground.src = 'background.png';
    const imgBird = new Image();
    imgBird.src = 'bird.svg';
    const imgPipe = new Image();
    imgPipe.src = 'pipe.svg';
    const canvasXSize = 668;
    const canvasYSize = 500;
    const pipes = generatePipeArray(canvasXSize, 400);
    const pipesChords = {};
    const birdChords = {};
    const globalTimeout = 10;
    let ctx, imgW, imgH;
    let dx;
    let x;
    let y;
    let gravity;
    let timeInTheAir;
    let gameInterval, clickInterval, upInterval, downInterval, speedInterval;
    let lastYBirdPosition;
    let pause = true;

    init();

    function init() {
        addEvents();
        imgBackground.onload = function() {
            imgW = imgBackground.width;
            imgH = imgBackground.height;
            const canvas = document.getElementById('game');
            canvas.width = canvasXSize;
            canvas.height = canvasYSize;
            ctx = canvas.getContext('2d');
            ctx.font = '48px serif';
            ctx.fillStyle = 'red';
            ctx.textAlign = 'start';
        }
        startOnLoad();
    }

    function start() {
        setVariables();
        gameInterval = setInterval(draw, globalTimeout);
    }

    function startOnLoad() {
        const interval = setInterval(() => {
            setVariables();
            draw();
            bounce();
            clearInterval(interval);
        }, 100);
    }

    function setVariables() {
        dx = 1;
        x = 0;
        y = 0;
        gravity = 0.1;
        timeInTheAir = 0;
        lastYBirdPosition = 150;
    }

    function draw() {
        if (ctx) {
            createUI();
        }
    }

    function createBackground() {
        // console.log(pipesChords)
        if (Math.abs(Math.abs(x) - canvasXSize) <= dx) {
            // dx += 1;
            x = 0;
        }

        ctx.drawImage(imgBackground, x + canvasXSize - 1, y, imgW, imgH);
        ctx.drawImage(imgBackground, x, y, imgW, imgH);
        x -= dx;
    }

    function createBird() {
        const ix = 150;
        const iy = 150 + gravity;
        lastYBirdPosition = iy;

        if (iy <= 0) {
            drawBird(imgBird, ix, 0);
            stop();
        } else if (iy >= canvasYSize - imgBird.height) {
            const stopYPosition = canvasYSize - imgBird.height;
            drawBird(imgBird, ix, stopYPosition);
            stop();
        } else {
            drawBird(imgBird, ix, iy);
        }
    }

    function createPipe() {
        const ix = canvasXSize - 100 + x;
        const iy = canvasYSize - imgPipe.height;

        if (ix <= 0) {
            // remove Pipe
        }

        // const pip = [{x: 100, y: 300}, {x: 390, y: 250}, {x: 670, y: 400}];

        pipes.forEach((p, index) => {
            setPipeChords(imgPipe.width, imgPipe.height, p.x + x, p.y, index);
            ctx.drawImage(imgPipe, p.x + x, p.y, imgPipe.width, imgPipe.height);
        })

        // setPipeChords(imgPipe.width, imgPipe.height, ix, iy, _);
        // ctx.drawImage(imgPipe, ix, iy, imgPipe.width, imgPipe.height);
        // const emptySpace = 150;
        // setPipeChords(imgPipe.width, imgPipe.height, ix + 250, iy + emptySpace, _);
        // ctx.drawImage(imgPipe, ix + 250, iy + emptySpace, imgPipe.width, imgPipe.height - emptySpace);
    }

    function createUI() {
        ctx.clearRect(0,0,0,0);
        createBackground();
        createPipe();
        createBird();
        createScore();
        ctx.save();
        intersectionCheck();
    }

    function drawBird(img, x, y) {
        setBirdChords(img, x, y);
        ctx.drawImage(img, x, y, img.width, img.height);
    }

    function bounce() {
        timeInTheAir = 0;
        clearInterval(clickInterval);
        clickInterval = setInterval(() => {
            timeInTheAir += 0.1;
        }, globalTimeout)
        up(down);
    }

    function up(down) {
        clearInterval(upInterval);
        upInterval = setInterval(() => {
            if (timeInTheAir >= 3) {
                clearInterval(upInterval);
                down();
                return;
            }
            gravity -= 5 - timeInTheAir;
        }, globalTimeout);
    }

    function down() {
        clearInterval(downInterval);
        downInterval = setInterval(() => {
            gravity += 0.8 * timeInTheAir
        }, globalTimeout);
    }

    function addEvents() {
        document.addEventListener('keydown', (event) => {
            if (pause) {
                pause = false;
                start();
                return;
            }
            if (event.code === 'Space') {
                bounce();
            }
        });
    }

    function stop() {
        pause = true;
        [gameInterval, clickInterval, upInterval, downInterval].forEach((interval) => clearInterval(interval));
    }

    function intersectionCheck() {
        Object.entries(pipesChords).forEach(([name, pipe]) => {
            const xIntersection = pipe.x <= birdChords.x + birdChords.w;
            const yIntersection = pipe.y <= birdChords.y + birdChords.h;
            const birdAfterPipe = birdChords.x > pipe.x + pipe.w;
            const birdDownPipe = birdChords.y < pipe.y + pipe.h;

            if (xIntersection && yIntersection && !birdAfterPipe && birdDownPipe) {
                console.log('|| i', pipesChords, birdChords, pipes)
                stop();
            }
        })
    }

    function createScore() {
        ctx.fillText(dx, canvasXSize - 65, canvasYSize - 450);
    }

    function setPipeChords(w, h, x, y, index) {
        if (!pipesChords[index]) {
            pipesChords[index] = {}
        }
        const pipe = pipesChords[index];

        pipe.x = x;
        pipe.y = y;
        pipe.w = w;
        pipe.h = h;
        ctx.fillRect(x, y, w, h);

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2, true);
        ctx.moveTo(1102, 75);
        ctx.stroke();
    }

    function setBirdChords(img, x, y) {
        birdChords.x = x;
        birdChords.y = y;
        birdChords.w = img.width;
        birdChords.h = img.height;
        ctx.fillRect(x, y, img.width, img.height);

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2, true);
        ctx.moveTo(1102, 75);
        ctx.stroke()
    }

    function generatePipeArray(xMax, yMax) {
        const result = [];
        for (let i = 0; i < 3; i++) {
            const pipe = {x: Math.floor(Math.random() * xMax), y: Math.floor(Math.random() * yMax)};
            result.push(pipe);
        }
        return result;
    }
}
