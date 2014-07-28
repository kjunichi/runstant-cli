window.addEventListener("load",function(){
  var cs = document.getElementById("world");
  var ctx = cs.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(Math.random()*100,Math.random()*100);
  ctx.lineTo(Math.random()*100,Math.random()*100);
  ctx.stroke();
})
