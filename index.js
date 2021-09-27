document.addEventListener('DOMContentLoaded', () => {
    createCanvas()
});

const settings = {
    top: {
        x: { min: 330, max: 550 },
        y: { min: -100, max: -500 },
    },
    bottom: {
        x: { min: 200, max: 420 },
        y: { min: 250, max: 400 },
    }
};

function createCanvas() {
    let lastXPipe = 0;
    const pipesTopArray =    generatePipeChordsObject('top', 5);
    // const pipesTopArray =    [{x: 330, y: -100}, {x:650, y:-200}, {x:990, y:-120},  {x:1300, y:-190}];
    const pipesBottomArray = generatePipeChordsObject('bottom', 5);
    // const pipesBottomArray = [{x: 200, y: 400},  {x:650, y:250},  {x:990, y:320}, {x:1300, y:390}];
    const imgBackground = new Image();
    imgBackground.src = 'background.png';
    const imgBird = new Image();
    imgBird.src = 'bird.svg';
    const imgPipe = new Image();
    imgPipe.src = 'pipe.svg';
    const imgPipeTop = new Image();
    imgPipeTop.src = 'pipeTop.svg';
    const canvasXSize = 668;
    const canvasYSize = 500;
    const pipesBottom = generatePipeArray(pipesBottomArray);
    const pipesTop = generatePipeArray(pipesTopArray);
    const pipesChords = { top: [], bottom: [] };
    const birdChords = {};
    const globalTimeout = 10;
    let ctx, imgW, imgH;
    let dx;
    let x, xp;
    let y;
    let gravity;
    let timeInTheAir;
    let gameInterval, clickInterval, upInterval, downInterval;
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
        console.log('|||', pipesTopArray)
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
        xp = 0;
        y = 0;
        lastXPipe = 0;
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
        if (Math.abs(Math.abs(x) - canvasXSize) <= dx) {
            dx += 1;
            x = 0;
        }

        ctx.drawImage(imgBackground, x + canvasXSize - 1, y, imgW, imgH);
        ctx.drawImage(imgBackground, x, y, imgW, imgH);
        x -= dx;
        xp -= dx;
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
        console.log('||')
        const ix = canvasXSize - 100 + xp;
        const iy = canvasYSize - imgPipe.height;

        if (ix <= 0) {
            // remove Pipe
        }

        pipesBottom.forEach((p, index) => {
            setPipeChords(imgPipe.width, imgPipe.height, p.x + xp, p.y, index, 'bottom');
            ctx.drawImage(imgPipe, p.x + xp, p.y, imgPipe.width, imgPipe.height);
        });

        pipesTop.forEach((p, index) => {
            setPipeChords(imgPipeTop.width, imgPipeTop.height, p.x + xp, p.y, index, 'top');
            ctx.drawImage(imgPipeTop, p.x + xp, p.y, imgPipeTop.width, imgPipeTop.height);
        });
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
        const pTop = pipesChords.top;
        const pBottom = pipesChords.bottom;

        check(pTop);
        check(pBottom);

        function check(pipes) {
            Object.entries(pipes).forEach(([name, pipe]) => {
                const xIntersection = pipe.x <= birdChords.x + birdChords.w;
                const yIntersection = pipe.y <= birdChords.y + birdChords.h;
                const birdAfterPipe = birdChords.x > pipe.x + pipe.w;
                const birdDownPipe = birdChords.y < pipe.y + pipe.h;

                if (xIntersection && yIntersection && !birdAfterPipe && birdDownPipe) {
                    stop();
                }
            });
        }
    }

    function createScore() {
        ctx.fillText(dx, canvasXSize - 65, canvasYSize - 450);
    }

    function setPipeChords(w, h, x, y, index, chordsKey) {
        if (!pipesChords[chordsKey][index]) {
            pipesChords[chordsKey][index] = {}
        }
        const pipe = pipesChords[chordsKey][index];

        pipe.x = x;
        pipe.y = y;
        pipe.w = w;
        pipe.h = h;

        // ctx.fillRect(x, y, w, h);
        // ctx.beginPath();
        // ctx.arc(x, y, 5, 0, Math.PI * 2, true);
        // ctx.moveTo(1102, 75);
        // ctx.stroke();
    }

    function setBirdChords(img, x, y) {
        birdChords.x = x;
        birdChords.y = y;
        birdChords.w = img.width;
        birdChords.h = img.height;

        // ctx.fillRect(x, y, img.width, img.height);
        // ctx.beginPath();
        // ctx.arc(x, y, 5, 0, Math.PI * 2, true);
        // ctx.moveTo(1102, 75);
        // ctx.stroke()
    }

    function generatePipeArray(array) {
        const result = [];
        for (let i = 0; i <array.length; i++) {
            result.push(array[i]);
        }
        return result;
    }

    function generatePipeChords({ min, max }, isX = false) {
        let n = 0;
        while (n < min) {
            n = getBetweenNumber(min, max);
        }
        console.log('|||mm', n)
        if (isX) {
            const spaceBetweenPipes = getBetweenNumber(10, 30);
            lastXPipe += n + spaceBetweenPipes - lastXPipe / 3;
            console.log('|||c', spaceBetweenPipes, n + spaceBetweenPipes);
            return lastXPipe;
        }
        return n;
    }

    function generatePipeChordsObject(placement, length) {
        const result = [];
        for (let i = 0; i < length; i++) {
            const chords = {
                x: generatePipeChords(settings[placement].x, true),
                y: generatePipeChords(settings[placement].y),
            };
            result.push(chords);
        }
        return result;
    }

    function getBetweenNumber(min, max) {
        return Math.floor(min + Math.random() * (max + 1 - min));
    }
}
