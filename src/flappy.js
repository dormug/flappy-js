const STARTING_STATE = 0;
const RUNNING_STATE = 1;
const GAME_OVER_STATE = 2;

const SCREEN_WIDTH = 480;
const SCREEN_HEIGHT = 640;

const JUMP_VELOCITY = 11;
const GRAVITY = 0.65;
const MAX_VELOCITY = 15;

const BIRD_WIDTH = 52;
const BIRD_HEIGHT = 32;

const GROUND_HEIGHT = 80;
const SPEED = 3;

const TUBE_COUNT = 2;
const TUBE_WIDTH = 88;
const TUBE_GAP = 175;
const TUBE_MIN_HEIGHT = 150;
const TUBE_MAX_HEIGHT = 250;

const FONT_WIDTH = 32;
const FONT_HEIGHT = 48;
const FONT_SPACING = 5;

let state = STARTING_STATE;

let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

let bird = new Object();
const tubes = [new Object(), new Object()];
let font = new Object();
let textures = new Object();
let groundOffset = 0;
let score = 0;

let previousTime = new Date();
let currentTime;
let dt;

let input = false;

init();

function init() {
    update_screen_size();
    window.addEventListener('resize', (event) => {update_screen_size()});
    window.requestAnimationFrame(loop);

    bird.yPosition = SCREEN_HEIGHT / 2;
    bird.yVelocity = 0;
    bird.rotation = 0;

    generate_tubes();
    init_font();
    load_textures();

    window.addEventListener('keydown', (event) => {
        switch (event.key) {
            case " ":
                input = true;
            break;
        }
    });
    if (navigator.maxTouchPoints > 0) {
        canvas.addEventListener('touchstart', function(e) {
            input = true;
            e.preventDefault();
            console.log("clicked");
        });
    } else {
        canvas.addEventListener('mousedown', function(e) {
            input = true;
        });
    }
}

function update_screen_size() {
    let width = window.innerWidth - 16;
    let height = window.innerHeight - 16;
    if (width > height * .75) {
        canvas.style.width = (height * .75) + "px";
        canvas.style.height = height + "px";
        console.log(height * .75);
        console.log(height);
    } else {
        canvas.style.width = width + "px";
        canvas.style.height = width * 1.333 + "px";
        console.log(width);
        console.log(width * 1.333);
    }
}

function loop() {
    currentTime = new Date();
    dt = (currentTime - previousTime) / (1000 / 60);
    if (dt === undefined) {
        console.log(currentTime - previousTime);
        console.log(1000 / 60);
    }
    previousTime = currentTime;

    switch (state) {
        case STARTING_STATE:
            groundOffset = (groundOffset + (SPEED * dt)) % 24;
            draw();
            if (input) {
                update_bird(dt);
                state = RUNNING_STATE;
            }
            break;
        case RUNNING_STATE:
            groundOffset = (groundOffset + (SPEED * dt)) % 24;
            update_tubes(dt);
            update_bird(dt);
            check_collisions();
            draw();
            draw_score();
            break;
        case GAME_OVER_STATE:
            if (bird.yPosition < SCREEN_HEIGHT - BIRD_HEIGHT / 2 - GROUND_HEIGHT) {
                bird.yVelocity = MAX_VELOCITY;
                bird.yPosition += MAX_VELOCITY;
            } else if (input) {
                reset();
            }
            draw();
            draw_score();
            break;
    }
    input = false;
    window.requestAnimationFrame(loop);
}

function draw() {
    context.fillStyle = "#67BEC6";
    context.fillRect(0, 0, 480, 640);
    context.drawImage(textures.background, 0, 380);
    context.fillStyle = "#7ADE86";
    context.fillRect(0, 530, SCREEN_WIDTH, 45);
    draw_tubes();
    draw_bird();
    context.fillStyle = "#D9D18F";
    context.fillRect(0, SCREEN_HEIGHT - GROUND_HEIGHT, SCREEN_WIDTH, GROUND_HEIGHT);
    context.drawImage(textures.ground, -groundOffset, SCREEN_HEIGHT - GROUND_HEIGHT, SCREEN_WIDTH + 24, 28);
}

function draw_bird() {
    let x = SCREEN_WIDTH / 2;
    let y = bird.yPosition;
    let width = textures.bird1.width;
    let height = textures.bird1.height;

    bird.rotation = -20;
    if (bird.yVelocity > 9) {
        bird.rotation = (bird.yVelocity - 9) * 15;
    }
    if (state == STARTING_STATE) {
        bird.rotation = 0; 
    }
    context.translate(x, y);
    context.rotate(bird.rotation * Math.PI / 180);
    context.drawImage(textures.bird1, -width / 2, -height / 2, width, height);
    context.rotate(-(bird.rotation * Math.PI / 180));
    context.translate(-x, -y);
}

function draw_tubes() {
    for (let i = 0; i < TUBE_COUNT; i++) {
        context.drawImage(textures.tubeTop, tubes[i].position - 4, SCREEN_HEIGHT - tubes[i].height, 96, 40);
        context.scale(1, -1);
        context.drawImage(textures.tubeTop, tubes[i].position - 4, -(SCREEN_HEIGHT - tubes[i].height - TUBE_GAP), 96, 40);
        context.scale(1, -1);
        context.drawImage(textures.tubeBody, tubes[i].position, SCREEN_HEIGHT - tubes[i].height + 40, 88, tubes[i].height - GROUND_HEIGHT);
        context.drawImage(textures.tubeBody, tubes[i].position, 0, 88, SCREEN_HEIGHT - tubes[i].height - TUBE_GAP - 40);
    }
}

function update_bird(dt) {
    if (input) {
        bird.yVelocity = -1 * JUMP_VELOCITY;
    } else {
        bird.yVelocity += GRAVITY * dt;
        if (bird.yVelocity > MAX_VELOCITY) {
            bird.yVelocity = MAX_VELOCITY;
        }
    }
    bird.yPosition += bird.yVelocity * dt;
    return;
}

function check_collisions() {
    for (let i = 0; i < TUBE_COUNT; i++) {
        if ((
            tubes[i].position < SCREEN_WIDTH / 2 + BIRD_WIDTH / 2 &&
            tubes[i].position > SCREEN_WIDTH / 2 - TUBE_WIDTH - BIRD_WIDTH / 2
        ) && (
            bird.yPosition > SCREEN_HEIGHT - tubes[i].height - BIRD_HEIGHT / 2 ||
            bird.yPosition < SCREEN_HEIGHT - (tubes[i].height + TUBE_GAP) + BIRD_HEIGHT / 2
        )) {
            state = GAME_OVER_STATE;
        }
    }
    if (bird.yPosition > SCREEN_HEIGHT - BIRD_HEIGHT / 2 - GROUND_HEIGHT) {
        state = GAME_OVER_STATE;
    }
}

function update_tubes(dt) {
    for (let i = 0; i < TUBE_COUNT; i++) {
        tubes[i].position -= SPEED * dt;  
        if ((tubes[i].position + TUBE_WIDTH / 2 + SPEED * dt >= SCREEN_WIDTH / 2) && tubes[i].position + TUBE_WIDTH / 2 < SCREEN_WIDTH / 2) {
            score++;
        }
        if (tubes[i].position < -(TUBE_WIDTH + 8)) {
            tubes[i].position = SCREEN_WIDTH + 8 - ((-tubes[i].position - TUBE_WIDTH + 8) % (SCREEN_WIDTH + TUBE_WIDTH));
            tubes[i].height = TUBE_MIN_HEIGHT + Math.floor(Math.random() * TUBE_MAX_HEIGHT);
        }
    }
}

function reset() {
    state = STARTING_STATE;
    bird.yPosition = SCREEN_HEIGHT / 2;
    bird.yVelocity = 0;
    bird.rotation = 0;
    generate_tubes();
    score = 0;
}

function generate_tubes() {
    for (let i = 0; i < TUBE_COUNT; i++) {
        tubes[i].position = SCREEN_WIDTH * 2 + (SCREEN_WIDTH + TUBE_WIDTH + 8) / 2 * i;
        tubes[i].height = TUBE_MIN_HEIGHT + Math.floor(Math.random() * TUBE_MAX_HEIGHT);
    }
}

function init_font() {
    font.width = 8;
    font.height = 12;
    font.bitmap = new Image();
    font.bitmap.src = "res/font.png";
}

function draw_score() {
    const text = score.toString();
    let x = Math.floor(SCREEN_WIDTH / 2 - ((text.length * FONT_WIDTH + ((text.length - 1) * FONT_SPACING)) / 2));
    for (let i = 0; i < text.length; i++) {
        context.drawImage(font.bitmap, (text.charCodeAt(i) - 48) * FONT_WIDTH, 0, FONT_WIDTH, FONT_HEIGHT, x + i * (FONT_WIDTH + FONT_SPACING), 60, FONT_WIDTH, FONT_HEIGHT);
    }
}

function load_textures() {
    textures.bird1 = new Image() 
    textures.bird1.src = "res/flappy1.png" 
    textures.background = new Image() 
    textures.background.src = "res/background.png" 
    textures.ground = new Image() 
    textures.ground.src = "res/ground.png" 
    textures.tubeBody = new Image() 
    textures.tubeBody.src = "res/tubebody.png" 
    textures.tubeTop = new Image() 
    textures.tubeTop.src = "res/tubetop.png" 
}