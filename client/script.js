// -------------------- CONFIG --------------------
// Detect environment: if running on localhost, use local API (3006); otherwise use Render deployed API
const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:3006"   // <-- local backend
  : "https://it-10.onrender.com"; // <-- Render backend URL

let currentStudent = null;

// -------------------- UI --------------------
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(sectionId)?.classList.remove("hidden");
}

// -------------------- Dropdowns --------------------
async function populateSchoolDropdown() {
  try {
    const res = await fetch(`${API_BASE}/analysis/schools`);
    const schools = await res.json();
    ["schoolSelect","userSchoolSelect"].forEach(id => {
      const select = document.getElementById(id);
      if (!select) return;
      select.innerHTML = '<option value="">Select a school</option>';
      schools.forEach(s => select.appendChild(new Option(s.name, s.id || s._id)));
    });
  } catch(err){console.error(err);}
}

async function populateUserDropdown() {
  try {
    const res = await fetch(`${API_BASE}/gamification/users`);
    const users = await res.json();
    const select = document.getElementById("loginUserSelect");
    select.innerHTML = '<option value="">Select a user</option>';
    users.forEach(u => select.appendChild(new Option(`${u.name} (${u.school?.name})`, u.id || u._id)));
  } catch(err){console.error(err);}
}

// -------------------- Register --------------------
async function registerSchool() {
  const name = document.getElementById("schoolName").value.trim();
  const area = parseFloat(document.getElementById("schoolArea").value);
  const students = parseInt(document.getElementById("schoolStudents").value);
  const district = document.getElementById("schoolDistrict").value.trim();
  const state = document.getElementById("schoolState").value.trim();
  if(!name||!area||!students) return alert("Fill all fields");

  try {
    const res = await fetch(`${API_BASE}/analysis/schools`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name,area,students,district,state})
    });
    if(res.ok) { 
      alert("School registered"); 
      document.getElementById("schoolForm").reset(); 
      await populateSchoolDropdown(); 
    } else { 
      const data=await res.json(); 
      alert(data.error||"Failed"); 
    }
  } catch(err){console.error(err);}
}

async function registerUser() {
  const name = document.getElementById("userName").value.trim();
  const schoolId = document.getElementById("userSchoolSelect").value;
  const className = document.getElementById("userClass").value.trim();
  if(!name||!schoolId) return alert("Fill all fields");

  try {
    const res = await fetch(`${API_BASE}/gamification/users`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name,schoolId,class:className})
    });
    if(res.ok) { 
      alert("User registered"); 
      document.getElementById("userForm").reset(); 
      await populateUserDropdown(); 
    } else { 
      const data=await res.json(); 
      alert(data.error||"Failed"); 
    }
  } catch(err){console.error(err);}
}

async function loginUser() {
  const userId = document.getElementById("loginUserSelect").value;
  if(!userId) return alert("Select a user");
  try {
    const res = await fetch(`${API_BASE}/gamification/users/${userId}`);
    currentStudent = await res.json();
    alert(`Welcome, ${currentStudent.name}`);
    showSection("competitions");
    updateEcoPoints();
  } catch(err){console.error(err);}
}

// -------------------- Bill Analysis --------------------
async function submitBillAnalysis() {
  const schoolId = document.getElementById("schoolSelect").value;
  const kwh = parseFloat(document.getElementById("kwh").value);
  const elecCost = parseFloat(document.getElementById("elecCost").value);
  const liters = parseFloat(document.getElementById("liters").value);
  const waterCost = parseFloat(document.getElementById("waterCost").value);
  if(!schoolId||isNaN(kwh)||isNaN(liters)) return alert("Fill fields");

  const month = new Date().toISOString().slice(0,7);
  try {
    const res = await fetch(`${API_BASE}/analysis`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({schoolId,kwh,elecCost,liters,waterCost,month})
    });
    const data = await res.json();

    ["perStudentKwh","perAreaKwh","elecScore","perStudentLiters","perAreaLiters","waterScore"].forEach(
      id=>document.getElementById(id).innerText=data[id]??'N/A'
    );

    // ---------------- ML Predictions ----------------
    document.getElementById("predictedKwh").innerText = data.kwhPrediction ?? "-";
    document.getElementById("predictedLiters").innerText = data.waterPrediction ?? "-";

    // ---------------- Anomaly ----------------
    if(data.anomaly) alert(data.anomaly);

    alert("Analysis success");
  } catch(err){console.error(err);}
}

// -------------------- Eco Points --------------------
async function updateEcoPoints() {
  if(!currentStudent) return;
  try {
    const res = await fetch(`${API_BASE}/gamification/users/${currentStudent._id}`);
    currentStudent = await res.json();
    document.getElementById("totalPoints").innerText = currentStudent.points||0;
    document.getElementById("streakCount").innerText = currentStudent.streak||0;
    document.getElementById("badges").innerText = currentStudent.badge||'-';
    updateLeaderboard();
  } catch(err){console.error(err);}
}

// -------------------- Activity --------------------
async function assignActivity() {
  document.getElementById("randomActivity").innerText = [
    "Plant a tree","Recycle","Switch off lights","Use a reusable bottle"
  ][Math.floor(Math.random()*4)];
}
async function completeActivity() {
  if(!currentStudent) return alert("Login first");
  await fetch(`${API_BASE}/gamification/activity`, {
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({userId:currentStudent._id,activity:"Completed Activity",points:20})
  });
  alert("Activity +20 points"); updateEcoPoints(); assignActivity();
}

// -------------------- Leaderboard --------------------
async function updateLeaderboard() {
  const type = document.getElementById("leaderboardType").value||"school";
  ["schoolLeaderboard","classLeaderboard","studentLeaderboard","districtLeaderboard","stateLeaderboard"]
    .forEach(id=>document.getElementById(id).classList.add("hidden"));
  const activeDiv = document.getElementById(type+"Leaderboard");
  if(activeDiv) activeDiv.classList.remove("hidden");

  try {
    const res = await fetch(`${API_BASE}/leaderboards/${type}`);
    const data = await res.json();
    const tbody = document.getElementById(type+"TableBody");
    if(!tbody) return;
    tbody.innerHTML = "";
    data.forEach((e)=> {
      tbody.innerHTML += `<tr>
        <td>${e.rank || '-'}</td>
        <td>${e.name}</td>
        <td>${e.points ?? e.score ?? e.efficiencyScore ?? 0}</td>
        <td>${e.badge || '-'}</td>
      </tr>`;
    });
  } catch(err){console.error(err);}
}

// -------------------- AI QUIZ --------------------
async function generateQuiz() {
  const topic = document.getElementById("quizTopic").value?.trim();
  if(!topic) return alert("Enter a topic");
  try {
    const res = await fetch(`${API_BASE}/ai/quiz`, {
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({topic})
    });
    const quiz = await res.json();
    const quizContainer = document.getElementById("quizContainer");
    quizContainer.innerHTML = "";
    quiz.questions.forEach((q,i)=>{
      quizContainer.innerHTML += `
        <div class="quiz-question">
          <p><b>Q${i+1}:</b> ${q.question}</p>
          ${q.options.map(opt=>
            `<label>
              <input type="radio" name="q${i}" value="${opt}" ${opt===q.answer ? "data-correct='true'" : ""}>
              ${opt}
            </label><br>`
          ).join("")}
        </div>
      `;
    });
  } catch(err){console.error(err);}
}

async function submitQuiz() {
  const quizContainer = document.getElementById("quizContainer");
  const questions = quizContainer.querySelectorAll(".quiz-question");
  let score = 0;
  questions.forEach((q,i)=>{
    const selected = q.querySelector(`input[name="q${i}"]:checked`);
    if(selected && selected.hasAttribute("data-correct")) score++;
  });
  alert(`You scored ${score} / ${questions.length}`);
}

// -------------------- INIT --------------------
document.addEventListener("DOMContentLoaded",async()=>{
  showSection("login");
  await populateSchoolDropdown();
  await populateUserDropdown();
  document.getElementById("schoolForm")?.addEventListener("submit",e=>{e.preventDefault();registerSchool();});
  document.getElementById("userForm")?.addEventListener("submit",e=>{e.preventDefault();registerUser();});
  document.getElementById("loginForm")?.addEventListener("submit",e=>{e.preventDefault();loginUser();});
  document.getElementById("billForm")?.addEventListener("submit",e=>{e.preventDefault();submitBillAnalysis();});
  document.getElementById("leaderboardType")?.addEventListener("change",updateLeaderboard);
  document.getElementById("quizForm")?.addEventListener("submit",e=>{e.preventDefault();generateQuiz();});
  document.getElementById("submitQuizBtn")?.addEventListener("click",submitQuiz);

  // -------------------- Insights --------------------
  await populateInsightSchools();
  document.getElementById("loadInsightsBtn")?.addEventListener("click", loadInsights);
});

// -------------------- Insights Functions --------------------
async function populateInsightSchools() {
  try {
    const res = await fetch(`${API_BASE}/analysis/schools`);
    const schools = await res.json();
    const select = document.getElementById("insightSchoolSelect");
    select.innerHTML = '<option value="">Select a school</option>';
    schools.forEach(s => select.appendChild(new Option(s.name, s._id)));
  } catch(err){ console.error(err); }
}

async function loadInsights() {
  const schoolId = document.getElementById("insightSchoolSelect").value;
  if(!schoolId) return alert("Select a school");

  try {
    const res = await fetch(`${API_BASE}/analysis/${schoolId}`);
    if(!res.ok) throw new Error("Failed to fetch insights");
    const data = await res.json();

    if(!data.trends || data.trends.length === 0){
      alert("No bill data for this school yet.");
      return;
    }

    document.getElementById("insightsData").style.display = "block";
    document.getElementById("insightPredictedKwh").innerText = data.predictions?.elecPred ?? "-";
    document.getElementById("insightPredictedLiters").innerText = data.predictions?.waterPred ?? "-";
    document.getElementById("insightAnomalyAlert").innerText = data.anomaly ?? "";

    // ---------------- Trend chart ----------------
    const months = data.trends.map(t=>t.month);
    const kwhData = data.trends.map(t=>t.kwh);
    const waterData = data.trends.map(t=>t.liters);

    const ctx = document.getElementById("insightTrendChart").getContext("2d");
    if(window.insightChart) window.insightChart.destroy();
    window.insightChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          { label: 'Electricity (kWh)', data: kwhData, borderColor: 'orange', fill: false, tension: 0.3 },
          { label: 'Water (Liters)', data: waterData, borderColor: 'blue', fill: false, tension: 0.3 }
        ]
      },
      options: { 
        responsive: true, 
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true } }
      }
    });

  } catch(err){ console.error(err); alert("Error loading insights"); }
}

