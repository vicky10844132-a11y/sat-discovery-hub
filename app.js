// 路径 B：简易的半动态网格（Canvas）叠加在地图框架上
(function(){
  const map = document.getElementById('mapFrame');
  // 创建一个画布覆盖在 mapFrame 上
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  map.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize(){
    canvas.width = map.clientWidth;
    canvas.height = map.clientHeight;
  }
  window.addEventListener('resize', resize, {passive:true});
  resize();

  // 初始化粒子
  const DOTS = 100;
  const dots = Array.from({length:DOTS}).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    r: Math.random() * 1.6 + 0.4
  }));

  function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

// 更新并绘制点
for(const d of dots){
  d.x += d.vx; d.y += d.vy;
  if(d.x < 0 || d.x > canvas.width) d.vx *= -1;
  if(d.y < 0 || d.y > canvas.height) d.vy *= -1;
  ctx.beginPath();
  ctx.fillStyle = 'rgba(177, 245, 255, 0.95)';
  ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
  ctx.fill();
}

// 点之间连线（距离阈值）
ctx.strokeStyle = 'rgba(110,210,255,.25)';
for(let i = 0; i < dots.length; i++){
  for(let j = i + 1; j < dots.length; j++){
    const dx = dots[i].x - dots[j].x;
    const dy = dots[i].y - dots[j].y;
    const dist = Math.hypot(dx, dy);
    if(dist < 120){
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(dots[i].x, dots[i].y);
      ctx.lineTo(dots[j].x, dots[j].y);
      ctx.stroke();
    }
  }
}
requestAnimationFrame(draw);
  }
  draw();
})();