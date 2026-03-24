// -------- Auth ----------
const authMsg=document.getElementById('auth-msg');

function signup(){
  const email=document.getElementById('email').value;
  const pass=document.getElementById('password').value;
  auth.createUserWithEmailAndPassword(email, pass)
      .then(()=>authMsg.innerText="Signup successful!")
      .catch(err=>authMsg.innerText=err.message);
}

function login(){
  const email=document.getElementById('email').value;
  const pass=document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, pass)
      .then(()=> {
        document.getElementById('auth-section').style.display='none';
        document.getElementById('main-section').style.display='block';
        document.getElementById('user-name').innerText=email;
      })
      .catch(err=>authMsg.innerText=err.message);
}

function logout(){auth.signOut().then(()=>location.reload());}

// -------- Lessons ----------
async function startLesson(){
  const subject=document.getElementById('subject').value;
  const grade=document.getElementById('grade').value;
  const response=await fetch(`subjects/${subject}.json`);
  const data=await response.json();
  const lesson=data[grade].lessons[0];
  localStorage.setItem('currentLesson', JSON.stringify(lesson));
  localStorage.setItem('currentSubject', subject);
  localStorage.setItem('currentGrade', grade);
  window.location.href='lesson.html';
}

// -------- Lesson Page Load --------
let lesson=JSON.parse(localStorage.getItem('currentLesson'));
if(lesson && document.getElementById('lesson-title')){
  document.getElementById('lesson-title').innerText=lesson.title;
  document.getElementById('lesson-content').innerText=lesson.content;

  const quizDiv=document.getElementById('quiz');
  lesson.quiz.forEach((q,i)=>{
    quizDiv.innerHTML+=`<p>${q.question}</p>`;
    q.options.forEach(opt=>{
      quizDiv.innerHTML+=`<input type="radio" name="q${i}" value="${opt}"> ${opt}<br>`;
    });
  });
}

function submitQuiz(){
  let score=0;
  lesson.quiz.forEach((q,i)=>{
    const sel=document.querySelector(`input[name=q${i}]:checked`);
    if(sel && sel.value===q.answer) score++;
  });
  alert(`Score: ${score}/${lesson.quiz.length}`);
  const user=auth.currentUser;
  if(user){
    db.collection('progress').doc(user.uid)
      .set({
        subject: localStorage.getItem('currentSubject'),
        grade: localStorage.getItem('currentGrade'),
        lesson: lesson.title,
        score: score,
        timestamp: Date.now()
      },{merge:true});
  }
}

// -------- AI Tutor with OpenAI --------
async function askAI(){
  const input=document.getElementById('userInput').value;
  const aiResponse=document.getElementById('aiResponse');
  try{
    const res=await fetch('http://localhost:5000/ask-ai',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({question: input, lesson: lesson})
    });
    const data=await res.json();
    aiResponse.innerText=data.answer;
  } catch(err){
    aiResponse.innerText="AI is unavailable";
  }
}

// -------- Dashboard --------
function goToDashboard(){window.location.href='dashboard.html';}
function goHome(){window.location.href='index.html';}

window.onload=()=>{
  const dash=document.getElementById('dashboard-content');
  const user=auth.currentUser;
  if(dash && user){
    db.collection('progress').doc(user.uid).get().then(doc=>{
      if(doc.exists){
        dash.innerText=`Last lesson: ${doc.data().lesson}, Score: ${doc.data().score}`;
      } else dash.innerText="No progress yet.";
    });
  }
}
