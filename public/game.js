function setCookie(n,v){document.cookie=n+"="+v+";path=/";}
function getCookie(n){return document.cookie.split("; ").find(c=>c.startsWith(n+"="))?.split("=")[1];}

let playerName = getCookie("playerName");
if (!playerName) {
  playerName = prompt("Enter your name:");
  setCookie("playerName", playerName);
}

document.getElementById("welcome").textContent = "Welcome, " + playerName + "!";

function updateMoneyDisplay(amount) {
  document.getElementById("money").textContent = amount;
}


let playerData;

fetch(`/api/player/${playerName}`)
  .then(r => r.json())
  .then(data => {
    playerData = data;
    applyTheme();
    updateMoneyDisplay(data.money);   
    loadBuildings();
  });

function applyTheme(){
  document.body.classList.toggle("dark", playerData.theme==="dark");
}

function toggleTheme(){
  playerData.theme = playerData.theme==="light"?"dark":"light";
  fetch(`/api/player/${playerName}/theme`,{
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({theme:playerData.theme})
  }).then(applyTheme);
}

function updateMoney(){
  document.getElementById("money").textContent=playerData.money;
}

document.getElementById("earnBtn").onclick=()=>{
  playerData.money+=10;
  saveMoney();
};

function saveMoney(){
  fetch(`/api/player/${playerName}/money`,{
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({money:playerData.money})
  }).then(updateMoney);
}
  async function build(type) {
  const x = Math.floor(Math.random() * 700);
  const y = Math.floor(Math.random() * 400);

  const res = await fetch(`/api/player/${playerName}/buildings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, x, y })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  updateMoneyDisplay(data.money);   
  drawBuilding(data.building);      
}




  fetch(`/api/player/${playerName}/buildings`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({type,x,y})
  })
  .then(r=>r.json())
  .then(data=>{
    if(data.error) return alert(data.error);
    playerData.money=data.money;
    updateMoney();
    loadBuildings();
    if(type==="eiffel") alert("🎉 You built the Eiffel Tower! You win!");
  });


function loadBuildings(){
  fetch(`/api/player/${playerName}/buildings`)
    .then(r=>r.json())
    .then(buildings=>{
      const map=document.getElementById("map");
      map.innerHTML="";
      buildings.forEach(b=>{
        const img=document.createElement("img");
        img.src=`images/${b.type}${b.level===2?"_upgraded":""}.png`;
        img.className="building";
        img.style.left=b.x+"px";
        img.style.top=b.y+"px";
        img.onclick=()=>upgrade(b.id);
        map.appendChild(img);
      });
    });
}

async function upgradeBuilding(id) {
  const res = await fetch(`/api/player/${playerName}/buildings/${id}`, {
    method: "PUT"
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  updateMoneyDisplay(data.money);  
  reloadBuildings();               
}


function updateMoneyDisplay(amount) {
  document.getElementById("money").textContent = amount;
}


function drawBuilding(b) {
  const img = document.createElement("img");
  img.className = "building";
  img.style.left = b.x + "px";
  img.style.top = b.y + "px";

  
  img.src = `images/${b.type}${b.level === 2 ? "2" : ""}.png`;

  img.onclick = () => upgradeBuilding(b.id);

  document.getElementById("map").appendChild(img);
}

