/* CANVAS */
const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* STARS */
const stars = [];
for (let i=0;i<300;i++){
    stars.push({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height,
        size: Math.random()*2,
        alpha: Math.random(),
        twinkle: Math.random()>0.5,
        color:["#fff","#cbd5ff","#fde68a","#a7f3d0","#fbcfe8"][Math.floor(Math.random()*5)]
    });
}

/* COMETS */
const comets = [];

function spawnComet(){
    const depth = Math.random();

    comets.push({
        x: Math.random()*canvas.width,
        y: Math.random()*150,
        vx: 3 + depth*3,
        vy: 2 + depth*2,
        gravity: 0.05,
        drag: 0.998,
        life: 0,
        maxLife: 120,
        trail: [],
        size: 2 + depth*2
    });
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    stars.forEach(s=>{
        if(s.twinkle){
            s.alpha += (Math.random()-0.5)*0.03;
            s.alpha = Math.max(0.2, Math.min(1, s.alpha));
        }
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x,s.y,s.size,s.size);
    });

    ctx.globalAlpha = 1;

    for(let i=comets.length-1;i>=0;i--){
        let c=comets[i];

        c.vy += c.gravity;
        let dx = canvas.width/2 - c.x;
        c.vx += dx * 0.00003;

        c.vx *= c.drag;
        c.vy *= c.drag;

        c.x += c.vx;
        c.y += c.vy;

        c.life++;

        c.trail.push({x:c.x,y:c.y});
        if(c.trail.length>20) c.trail.shift();

        let t = c.life / c.maxLife;
        let color = `rgb(255,${255 - t*150},${255 - t*255})`;

        for(let j=0;j<c.trail.length-1;j++){
            let p1=c.trail[j];
            let p2=c.trail[j+1];

            let alpha=j/c.trail.length;

            ctx.strokeStyle=color;
            ctx.globalAlpha=alpha*(0.4+Math.random()*0.2);
            ctx.lineWidth=c.size*alpha;

            ctx.beginPath();
            ctx.moveTo(p1.x,p1.y);
            ctx.lineTo(p2.x,p2.y);
            ctx.stroke();
        }

        ctx.globalAlpha=1;

        ctx.fillStyle=color;
        ctx.beginPath();
        ctx.arc(c.x,c.y,c.size,0,Math.PI*2);
        ctx.fill();

        if(c.life > c.maxLife){
            comets.splice(i,1);
        }
    }

    requestAnimationFrame(draw);
}

draw();

setInterval(()=>{
    if(Math.random()<0.6) spawnComet();
},2000);

/* BUTTONS */
function openLink(url){
    window.open(url,"_blank");
}

document.getElementById("joinBtn").onclick=()=>{
    window.location.href="minecraft://?addExternalServer=Torch%20SMP|include-suspension.gl.at.ply.gg:13294";
};

document.getElementById("downloadBtn").onclick=()=>{
    window.open("/minecraft.apk","_blank");
};