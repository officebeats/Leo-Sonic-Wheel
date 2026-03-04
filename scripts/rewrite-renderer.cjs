const fs = require("fs");

let code = fs.readFileSync("src/game/renderer.ts", "utf8");
const start = code.indexOf("function drawPlayer");

const repl = `function drawPlayer(ctx: CanvasRenderingContext2D, gs: GameState) {
  const x = gs.px;
  const y = gs.py;
  const w = PLAYER_WIDTH;
  const h = PLAYER_HEIGHT;
  const mX = x + w / 2;
  const mY = y + h / 2;
  const speed = Math.abs(gs.vx);
  const isMoving = speed > 0.5;
  const isJumping = !gs.onGround;
  const faceDir = gs.facingRight ? 1 : -1;
  const t = gs.frameCount * 0.4;
  
  // -- BOOST GLOW --
  if (gs.boostTimer > 0) {
    ctx.save();
    ctx.shadowColor = BOOST_GLOW;
    ctx.shadowBlur = 16;
    ctx.fillStyle = BOOST_GLOW + "33";
    ctx.beginPath();
    ctx.ellipse(mX, mY, 20, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // -- HAMSTER WHEEL --
  const wheelRadius = 14;
  const wheelCy = y + h - wheelRadius - 1;
  ctx.save();
  ctx.translate(mX, wheelCy);
  ctx.rotate(gs.frameCount * gs.vx * 0.08);
  ctx.strokeStyle = "#BDC3C7"; // Metal edge
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, wheelRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw 4 spokes
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#95A5A6";
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI / 2) * i;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * wheelRadius, Math.sin(a) * wheelRadius);
    ctx.stroke();
  }
  ctx.restore();

  // -- SONIC DRAWING --
  ctx.save();
  ctx.translate(mX, y + 10);
  ctx.scale(faceDir, 1);

  const BLUE = "#2651d6";
  const PEACH = "#F4A460";
  const RED = "#E22A2A";
  const WHITE = "#FFFFFF";

  if (isJumping) {
    // Sonic Spin Jump Attack
    ctx.rotate(gs.frameCount * 0.4);
    
    // Main blue ball
    ctx.fillStyle = BLUE;
    ctx.beginPath();
    ctx.arc(0, 4, 10, 0, Math.PI * 2);
    ctx.fill();

    // Spiky edges
    for (let i = 0; i < 4; i++) {
      const ang = (Math.PI / 2) * i;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang)*2, Math.sin(ang)*2 + 4);
      ctx.lineTo(Math.cos(ang - 0.4)*13, Math.sin(ang - 0.4)*13 + 4);
      ctx.lineTo(Math.cos(ang + 0.4)*13, Math.sin(ang + 0.4)*13 + 4);
      ctx.fill();
    }
    
    // Blur highlight (white stripe)
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(0, 4, 6, 0, Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1.0;

  } else {
    // -- Running or Idle --

    // Back Arm
    if (isMoving) {
      const armRot = Math.sin(t) * 1.5;
      ctx.save();
      ctx.translate(-2, 2);
      ctx.rotate(armRot);
      ctx.fillStyle = PEACH;
      ctx.beginPath(); ctx.ellipse(-1, 3, 2, 4, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = WHITE;
      ctx.beginPath(); ctx.arc(-2, 7, 3, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }

    // Head
    ctx.fillStyle = BLUE;
    ctx.beginPath();
    ctx.arc(1, -5, 7, 0, Math.PI * 2);
    ctx.fill();
    // Spikes
    ctx.beginPath();
    ctx.moveTo(1, -12);
    ctx.lineTo(-8, -13); 
    ctx.lineTo(-4, -7);
    ctx.lineTo(-10, -5); 
    ctx.lineTo(-3, -2);
    ctx.lineTo(-9, 2);   
    ctx.lineTo(2, 0);
    ctx.fill();

    // Muzzle & Belly
    ctx.fillStyle = PEACH;
    ctx.beginPath();
    ctx.ellipse(5, -2, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3, 5, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.ellipse(2, -6, 3, 5, Math.PI/10, 0, Math.PI*2);
    ctx.ellipse(6, -6, 3, 4, -Math.PI/10, 0, Math.PI*2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(3, -6, 1.2, 0, Math.PI*2);
    ctx.arc(7, -6, 1.2, 0, Math.PI*2);
    ctx.fill();

    // Nose
    ctx.beginPath();
    ctx.arc(9, -3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Body backing
    ctx.fillStyle = BLUE;
    ctx.beginPath();
    ctx.ellipse(0, 4, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Front Arm
    if (isMoving) {
      const armRot = Math.sin(t + Math.PI) * 1.5;
      ctx.save();
      ctx.translate(2, 2);
      ctx.rotate(armRot);
      ctx.fillStyle = PEACH;
      ctx.beginPath(); ctx.ellipse(1, 3, 2, 4, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = WHITE;
      ctx.beginPath(); ctx.arc(2, 7, 3, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    } else {
      // Idle arm
      ctx.fillStyle = PEACH;
      ctx.beginPath(); ctx.ellipse(0, 6, 2, 3, -0.4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = WHITE;
      ctx.beginPath(); ctx.arc(-1, 9, 3, 0, Math.PI*2); ctx.fill();
    }

    // Legs / Super Peel-Out
    if (isMoving) {
      // Peel out motion blur
      ctx.fillStyle = RED;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.ellipse(-1, 13, 9, 5, 0, 0, Math.PI * 2); 
      ctx.fill();
      
      // Figure-8 white shoe stripes
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = WHITE;
      const legT1 = gs.frameCount * 0.8;
      const legT2 = legT1 + Math.PI;

      for (const lt of [legT1, legT2]) {
        const lx = -1 + Math.sin(lt) * 7;
        const ly = 13 + Math.sin(lt) * Math.cos(lt) * 4;
        ctx.beginPath();
        ctx.ellipse(lx, ly, 2.5, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Idle legs
      ctx.fillStyle = BLUE;
      ctx.fillRect(-3, 10, 2, 4);
      ctx.fillRect(2, 10, 2, 4);
      
      // Idle shoes
      ctx.fillStyle = RED;
      ctx.beginPath(); ctx.ellipse(-3, 15, 4, 3, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(3, 15, 3.5, 3, 0, 0, Math.PI*2); ctx.fill();
      
      // Shoe stripes
      ctx.fillStyle = WHITE;
      ctx.fillRect(-2, 13, 2, 3);
      ctx.fillRect(4, 13, 1.5, 3);
    }
  }

  ctx.restore();
}
`;

code = code.substring(0, start) + repl;
fs.writeFileSync("src/game/renderer.ts", code);
console.log("Renderer replaced!");
