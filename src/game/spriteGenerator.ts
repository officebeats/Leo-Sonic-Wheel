export const SPRITE_SIZE = 64;

export function generateSonicSpriteSheet(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  // 4 frames Idle (row 0), 8 frames Run (row 1), 4 frames Jump (row 2)
  canvas.width = SPRITE_SIZE * 8;
  canvas.height = SPRITE_SIZE * 3;
  const ctx = canvas.getContext("2d")!;

  // Helper to draw Sonic in a specific pose
  const drawSonic = (
    x: number,
    y: number,
    pose: string,
    frameIndex: number,
  ) => {
    ctx.save();
    ctx.translate(x + SPRITE_SIZE / 2, y + SPRITE_SIZE / 2);

    const BLUE = "#2651d6";
    const PEACH = "#F4A460";
    const RED = "#E22A2A";
    const WHITE = "#FFFFFF";

    if (pose === "spin") {
      ctx.rotate((frameIndex * Math.PI) / 2); // 4 frames = full rotation
      ctx.fillStyle = BLUE;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 4; i++) {
        const ang = (Math.PI / 2) * i;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 2, Math.sin(ang) * 2);
        ctx.lineTo(Math.cos(ang - 0.4) * 13, Math.sin(ang - 0.4) * 13);
        ctx.lineTo(Math.cos(ang + 0.4) * 13, Math.sin(ang + 0.4) * 13);
        ctx.fill();
      }
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    } else {
      // Idle / Run body
      const isRun = pose === "run";
      const bounce = isRun ? (frameIndex % 2 === 0 ? -1 : 1) : 0;

      ctx.translate(0, bounce);

      // Back Arm
      if (isRun) {
        const armRot = Math.sin((frameIndex * Math.PI) / 4) * 1.5;
        ctx.save();
        ctx.translate(-2, 2);
        ctx.rotate(armRot);
        ctx.fillStyle = PEACH;
        ctx.beginPath();
        ctx.ellipse(-1, 3, 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(-2, 7, 3, 0, Math.PI * 2);
        ctx.fill();
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
      ctx.ellipse(2, -6, 3, 5, Math.PI / 10, 0, Math.PI * 2);
      ctx.ellipse(6, -6, 3, 4, -Math.PI / 10, 0, Math.PI * 2);
      ctx.fill();

      // Pupils
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(3, -6, 1.2, 0, Math.PI * 2);
      ctx.arc(7, -6, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Nose
      ctx.beginPath();
      ctx.arc(9, -3, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Back Leg
      const legT2 = isRun ? (frameIndex * Math.PI) / 4 + Math.PI : 0;
      ctx.fillStyle = BLUE;
      ctx.beginPath();
      ctx.ellipse(
        1 + Math.cos(legT2) * 5,
        10 + Math.sin(legT2) * 2,
        2,
        4,
        Math.cos(legT2) * 0.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Shoe (Back)
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.ellipse(
        2 + Math.cos(legT2) * 6,
        14 + Math.sin(legT2) * 4,
        5,
        2.5,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Front Leg
      const legT1 = isRun ? (frameIndex * Math.PI) / 4 : 0;
      ctx.fillStyle = BLUE;
      ctx.beginPath();
      ctx.ellipse(
        3 + Math.cos(legT1) * 5,
        10 + Math.sin(legT1) * 2,
        2,
        4,
        Math.cos(legT1) * 0.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Shoe (Front)
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.ellipse(
        4 + Math.cos(legT1) * 6,
        14 + Math.sin(legT1) * 4,
        5,
        2.5,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Shoe Stripe (Front)
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.ellipse(
        4 + Math.cos(legT1) * 6,
        14 + Math.sin(legT1) * 4,
        1,
        2.5,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Front Arm
      if (isRun) {
        const armRot2 = Math.sin((frameIndex * Math.PI) / 4 + Math.PI) * 1.5;
        ctx.save();
        ctx.translate(2, 2);
        ctx.rotate(armRot2);
        ctx.fillStyle = PEACH;
        ctx.beginPath();
        ctx.ellipse(0, 3, 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(0, 7, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  };

  // Generate Idle (Row 0)
  for (let i = 0; i < 4; i++) {
    drawSonic(i * SPRITE_SIZE, 0, "idle", i);
  }

  // Generate Run (Row 1)
  for (let i = 0; i < 8; i++) {
    drawSonic(i * SPRITE_SIZE, SPRITE_SIZE, "run", i);
  }

  // Generate Spin/Jump (Row 2)
  for (let i = 0; i < 4; i++) {
    drawSonic(i * SPRITE_SIZE, SPRITE_SIZE * 2, "spin", i);
  }

  return canvas;
}
