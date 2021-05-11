const rulesBtn = document.getElementById("rules-btn")
const closeBtn = document.getElementById("close-btn")
const rules = document.getElementById("rules")
const startGameBtn = document.getElementById("start-game")

// 获得2d绘图对象
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext('2d')

// 音效
const bgm = document.getElementById("game-bgm")
const btnClickSound = document.getElementById("btn-click-sound")
const getScoreSound = document.getElementById("get-score-sound")
const raketSound = document.getElementById("raket-sound")
const wallNock = document.getElementById("wall-nock")
const raketMove = document.getElementById("raket-move")
const failSound = document.getElementById("fail-sound")
const winSound = document.getElementById("win-sound")

// -------------------------------参数--------------------------------------------
let score = 0; //得分
const elementColor = '#0095dd' // 游戏元素颜色
const brickRowCount = 9; // 方块列数
const brickColumnCount = 5; // 方块行数
const delay = 6000 // 重置游戏时间
// 小球参数
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: 10,
    speed: 4,
    dx: 4,
    dy: -4,
    visible: true
};
// 球拍参数
const racket = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 20,
    w: 80,
    h: 10,
    speed: 8,
    dx: 0,
    visible: true
}
// 个体方块参数
const brickInfo = {
    w: 70,
    h: 20,
    padding: 10,
    // 首个方块坐标
    offsetX: 45,
    offsetY: 60,

    visible: true
}
// 创建所有方块的坐标参数
const bricks = []
for (let i = 0; i < brickRowCount; i++) {
    bricks[i] = [];
    // 按顺序给每一列创建方块
    for (let j = 0; j < brickColumnCount; j++) {
        const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX
        const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY
        bricks[i][j] = {
            x,
            y,
            ...brickInfo //传入 w,h,padding,offsetX,offsetY,visible属性
        }
    }
}

// ---------------------------------绘制图形---------------------------------------
// 球
function drawBall() {
    ctx.beginPath()
    // arc(x, y, r, startDeg, endDeg) x,y:圆心坐标;r:圆心半径
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
    // 背景颜色
    ctx.fillStyle = ball.visible ? elementColor : 'transparent';
    // 填充当前绘图
    ctx.fill()
    ctx.closePath()
}
// 球拍
function drawRacket() {
    ctx.beginPath()
    // rect(x,y,w,h)  x,y坐标 w,h方形宽高
    ctx.rect(racket.x, racket.y, racket.w, racket.h)
    ctx.fillStyle = racket.visible ? elementColor : 'transparent'
    ctx.fill()
    ctx.closePath()
}
// 方块
function drawBricks() {
    bricks.forEach(row => {
        // 列
        row.forEach(brick => {
            ctx.beginPath();
            ctx.rect(brick.x, brick.y, brick.w, brick.h);
            ctx.fillStyle = brick.visible ? elementColor : 'transparent';
            ctx.fill()
            ctx.closePath();
        })
    })
}
// 得分
function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillText(`得分:${score}`, canvas.width - 100, 30)
}

// -----------------------------------运动--------------------------------------------
// 球拍
function moveRacket() {
    racket.x += racket.dx
    // 碰左壁
    if (racket.x + racket.w > canvas.width) {
        // 停止不动
        racket.x = canvas.width - racket.w
    }
    // 碰右壁
    if (racket.x < 0) {
        //停止不动
        racket.x = 0
    }
}
// 重置方块
function showAllBricks() {
    bricks.forEach(column => {
        column.forEach(brick => (brick.visible = true))
    })
}
// 球
function moveBall() {
    ball.x += ball.dx
    ball.y += ball.dy
    var ball_right = ball.x + ball.r;
    var ball_left = ball.x - ball.r;
    var ball_top = ball.y - ball.r;
    var ball_bottom = ball.y + ball.r;
    // 碰壁
    if (ball_right > canvas.width || ball_left < 0) {
        wallNock.play()
        ball.dx *= -1
    }
    if (ball_bottom > canvas.height || ball_top < 0) {
        wallNock.play()
        ball.dy *= -1
    }
    // 碰球拍
    if (ball_left > racket.x && ball_right < racket.x + racket.w && ball_bottom > racket.y) {
        raketSound.play()
        ball.dy = -ball.speed // 这里不能为-dy
    }
    // 碰方块
    bricks.forEach(row => {
        row.forEach(brick => {
            if (brick.visible) {
                if (
                    ball_left > brick.x &&
                    ball_right < brick.x + brick.w &&
                    ball_top < brick.y + brick.h &&
                    ball_bottom > brick.y
                ) {

                    ball.dy *= -1;
                    brick.visible = false
                    // 加分
                    increaseScore()
                }
            }
        })
    })
    // 越界
    if (ball_bottom > canvas.height) {
        failSound.play()

        // 重置
        showAllBricks(),
            score = 0
    }
}
// 加分
function increaseScore() {
    score++;
    getScoreSound.play();
    if (score % (brickColumnCount * brickRowCount) === 0) {
        ball.visible = false;
        racket.visible = false;
        // 5.5s之后重置比赛
        winSound.play()
        setTimeout(function () {
            alert("小伙子整挺好！")
            showAllBricks();
            // 重置
            // bgm.play()
            score = 0;
            racket.x = canvas.width / 2 - 40;
            racket.y = canvas.height - 20;
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.visible = true;
            racket.visible = true;
        }, delay)
    }
}

// --------------------------------运行游戏------------------------------------------
// 加载所有东西
function draw() {
    // 清除
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 加载
    drawBall()
    drawRacket()
    drawScore()
    drawBricks()
}
// 运行游戏
function update() {
    moveRacket()
    moveBall()

    draw()
    // 要求浏览器在下次重绘之前调用指定的回调函数更新动画
    bgm.play()
}

function start() {
    runningLocker = false
    if (isRunning) {
        update()
    }
    requestAnimationFrame(arguments.callee)
}

// ---------------------------------控制部分---------------------------------------
// 开始游戏
var runningLocker = true // 防止重复加载导致游戏加快
var isRunning = false // 暂停控制
startGameBtn.onclick = () => {
    isRunning = !isRunning
    if (isRunning) {
        startGameBtn.innerText = " 暂 停 "
    } else {
        bgm.pause()
        startGameBtn.innerText = "开始游戏"
    }
    if (runningLocker) {
        start()
    }
    btnClickSound.play()
}
// 球拍移动
function keyDown(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        racket.dx = racket.speed
        raketMove.play()
    } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        racket.dx = -racket.speed
        raketMove.play()
    }
}
// 球拍停止
function keyUp(e) {
    if (
        e.key === 'Right' ||
        e.key === 'ArrowRight' ||
        e.key === 'd' ||
        e.key === 'Left' ||
        e.key === 'ArrowLeft' ||
        e.key === 'a'
    ) {
        racket.dx = 0;
        // raketMove.pause()
    }
}
document.onkeydown = keyDown
document.onkeyup = keyUp
// -----------------------------------规则-----------------------------------------
rulesBtn.onclick = () => {
    btnClickSound.play()
    rules.classList.add('show')
}
closeBtn.onclick = () => {
    btnClickSound.play()
    rules.classList.remove('show')
}