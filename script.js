'use strict';
(function(){
  const SCALE=[
    {grade:'A+',point:4.00,status:'EXCELLENT'},
    {grade:'A', point:4.00,status:'EXCELLENT'},
    {grade:'A-',point:3.67,status:'EXCELLENT'},
    {grade:'B+',point:3.33,status:'CREDIT'},
    {grade:'B', point:3.00,status:'CREDIT'},
    {grade:'B-',point:2.67,status:'CREDIT'},
    {grade:'C+',point:2.33,status:'PASS'},
    {grade:'C', point:2.00,status:'PASS'},
    {grade:'F', point:0.00,status:'FAIL'}
  ];
  const c=(id,name,credits)=>({id,name,credits});
  const PLANS={
    FIA:{name:'Foundation in Arts',semesters:[
      {credits:20,core:[c('fia_s1_business','Introduction to Business',3),c('fia_s1_marketing','Principles of Marketing',3),c('fia_s1_economics','Principles of Economics',3),c('fia_s1_math','Introductory Mathematical Analysis',4),c('fia_s1_accounting','Principles of Accounting',4),c('fia_s1_english','English I',3)],electives:[]},
      {credits:20,core:[c('fia_s2_computer','Introduction to Computer Systems and Applications',3),c('fia_s2_presentation','Presentation Skills',3),c('fia_s2_communication','Business Communication',3),c('fia_s2_finance','Introduction to Finance',3),c('fia_s2_english','English II',3),c('fia_s2_event','Event Management',2)],electives:[c('fia_e_construction','Introduction to Construction',3),c('fia_e_development','Introduction to Development',3),c('fia_e_propertydevelopment','Introduction to Property Development',3),c('fia_e_surveying','Introduction to Quantity Surveying',3),c('fia_e_environmental','Introduction to Environmental Design',3),c('fia_e_multimedia','Introduction to Multimedia',3),c('fia_e_businesslaw','Introduction to Business Law',3),c('fia_e_appliedmath','Applied Mathematics I',3)]},
      {credits:10,core:[c('fia_s3_writing','Professional Writing',3),c('fia_s3_stats','Introduction to Statistics',4),c('fia_s3_thinking','Introduction to Critical Thinking',3)],electives:[]}
    ]},
    FIS:{name:'Foundation in Science',semesters:[
      {credits:20,core:[c('fis_s1_math','Mathematics I',4),c('fis_s1_physics','Physics I',4),c('fis_s1_chemistry','Chemistry I',4),c('fis_s1_english','English I',3),c('fis_s1_thinking','Introduction to Critical Thinking',3),c('fis_s1_event','Event Management',2)],electives:[]},
      {credits:20,core:[c('fis_s2_math','Mathematics II',4),c('fis_s2_physics','Physics II',4),c('fis_s2_chemistry','Chemistry II',4),c('fis_s2_english','English II',3),c('fis_s2_chemlab','Chemistry Laboratory',1),c('fis_s2_physicslab','Physics Laboratory',1)],electives:[c('fis_e_statics','Statics',3),c('fis_e_dynamics','Dynamics',3),c('fis_e_biology','Biology',3)]},
      {credits:10,core:[c('fis_s3_math','Mathematics III',4),c('fis_s3_physics','Physics III',4),c('fis_s3_computing','Computing',2)],electives:[]}
    ]}
  };
  const KEY='foundation-gpa-calculator-v1';
  const $=id=>document.getElementById(id);
  const totalCredits=50;
  const defaultState=()=>({programme:'FIA',semester:1,studentName:'',studentId:'',data:{FIA:{elective:'',entries:{}},FIS:{elective:'',entries:{}}}});
  let state=defaultState();
  try{const stored=JSON.parse(localStorage.getItem(KEY)||'null');if(stored&&typeof stored==='object'){
    if(stored.programme==='FIA'||stored.programme==='FIS')state.programme=stored.programme;
    if([1,2,3].includes(stored.semester))state.semester=stored.semester;
    if(typeof stored.studentName==='string')state.studentName=stored.studentName.slice(0,100);
    if(typeof stored.studentId==='string')state.studentId=stored.studentId.slice(0,40);
    for(const p of ['FIA','FIS']){
      const d=stored.data?.[p]; if(!d||typeof d!=='object')continue;
      if(typeof d.elective==='string'&&PLANS[p].semesters[1].electives.some(x=>x.id===d.elective))state.data[p].elective=d.elective;
      if(d.entries&&typeof d.entries==='object')for(const [id,r] of Object.entries(d.entries)){
        const validCourses=PLANS[p].semesters.flatMap(s=>s.core.concat(s.electives));
        if(!validCourses.some(x=>x.id===id)||!r||typeof r!=='object')continue;
        if(SCALE.some(s=>s.grade===r.grade)){state.data[p].entries[id]={grade:r.grade};}
      }
    }
  }}catch(e){ /* Storage may be blocked; calculator still functions */ }
  const format=n=>n==null?'—':n.toFixed(2);
  function itemForGrade(grade){return SCALE.find(x=>x.grade===grade)||null;}
  function activeCourses(programme,semester){const plan=PLANS[programme].semesters[semester-1],d=state.data[programme];let courses=plan.core.slice();if(semester===2){const elective=plan.electives.find(x=>x.id===d.elective);if(elective)courses.push({...elective,isElective:true});}return courses;}
  function semesterStats(programme,semester){const courses=activeCourses(programme,semester),entries=state.data[programme].entries;let points=0,credits=0,gradedCourses=0;for(const course of courses){const g=itemForGrade(entries[course.id]?.grade);if(g){points+=g.point*course.credits;credits+=course.credits;gradedCourses++;}}
    return {points,credits,gradedCourses,courseCount:courses.length,target:PLANS[programme].semesters[semester-1].credits,gpa:credits?points/credits:null};}
  function cumulativeStats(programme,through){let credits=0,points=0;for(let s=1;s<=through;s++){const x=semesterStats(programme,s);credits+=x.credits;points+=x.points;}return {credits,points,cgpa:credits?points/credits:null};}
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){/* Calculator remains usable if storage is unavailable. */}}
  function escapeHtml(x){return String(x).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));}
  function renderTabs(){const wrap=$('semesterTabs');wrap.innerHTML='';for(let semester=1;semester<=3;semester++){const tab=document.createElement('button');tab.type='button';tab.className='tab'+(state.semester===semester?' active':'');tab.setAttribute('role','tab');tab.setAttribute('aria-selected',state.semester===semester?'true':'false');tab.innerHTML=`<span class="tab-label">Semester ${semester}</span><span class="tabsmall">${PLANS[state.programme].semesters[semester-1].credits} credits</span>`;tab.addEventListener('click',()=>{state.semester=semester;render();persist();});wrap.appendChild(tab);}}
  function renderElective(){const box=$('electiveBox'),sel=$('electiveSelect');box.classList.toggle('hidden',state.semester!==2);if(state.semester!==2)return;const options=PLANS[state.programme].semesters[1].electives;sel.innerHTML='<option value="">— Select your elective subject —</option>'+options.map(x=>`<option value="${x.id}">${escapeHtml(x.name)} (${x.credits} credits)</option>`).join('');sel.value=state.data[state.programme].elective;}
  function renderCourses(){
    const tbody=$('coursesBody'),courses=activeCourses(state.programme,state.semester),entries=state.data[state.programme].entries;
    tbody.innerHTML='';
    for(const course of courses){
      const entry=entries[course.id]||{grade:''};
      const scale=itemForGrade(entry.grade);
      const tr=document.createElement('tr');
      if(scale) tr.classList.add('graded-row');
      const opts=['<option value="">Select</option>'].concat(SCALE.map(x=>`<option value="${x.grade}" ${entry.grade===x.grade?'selected':''}>${x.grade} · ${x.point.toFixed(2)}</option>`)).join('');
      tr.innerHTML=`<td><div class="course-heading"><div class="course-title">${escapeHtml(course.name)}${course.isElective?'<small>Selected elective *</small>':''}</div><span class="mobile-credit">${course.credits} credits</span></div></td><td><span class="credit-count">${course.credits}</span></td><td><select class="grade-select" aria-label="Grade for ${escapeHtml(course.name)}">${opts}</select></td><td class="points">${scale?(scale.point*course.credits).toFixed(2):'—'}</td><td><span class="status-tag ${scale?scale.status.toLowerCase():'pending'}">${scale?scale.status:'PENDING'}</span></td>`;
      tr.querySelector('.grade-select').addEventListener('change',e=>{
        const g=itemForGrade(e.target.value);
        if(g)entries[course.id]={grade:g.grade};else delete entries[course.id];
        updateRow(tr,course,g);updateSummaries();persist();
      });
      tbody.appendChild(tr);
    }
    $('bahasaNote').classList.toggle('hidden',state.semester!==1);
    $('courseCount').textContent=courses.length+' course'+(courses.length===1?'':'s')+' listed';
    $('creditRequirement').textContent=PLANS[state.programme].semesters[state.semester-1].credits+' credits expected this semester';
    const notice=$('entryNotice');notice.classList.add('hidden');notice.classList.remove('warning');
    if(state.semester===2&&!state.data[state.programme].elective){notice.classList.remove('hidden');notice.classList.add('warning');notice.textContent='Select your Semester 2 elective above to include the final 3 credits. Your current calculation is incomplete until an elective is selected and graded.';}
  }
  function updateRow(tr,course,g){tr.classList.toggle('graded-row',!!g);tr.querySelector('.points').textContent=g?(g.point*course.credits).toFixed(2):'—';const status=tr.querySelector('.status-tag');status.textContent=g?g.status:'PENDING';status.className='status-tag '+(g?g.status.toLowerCase():'pending');}
  function updateSummaries(){const current=semesterStats(state.programme,state.semester),all=cumulativeStats(state.programme,3);
    $('activeSemesterLabel').textContent='Semester '+state.semester+' GPA';
    $('statGpa').textContent=format(current.gpa);$('statGpaDesc').textContent=current.credits+' / '+current.target+' credits graded in semester '+state.semester;
    $('statCgpa').textContent=format(all.cgpa);$('statCgpaDesc').textContent=all.credits+' graded credits across entered semesters';
    $('statCredits').innerHTML=all.credits+' <span class="total-credits">/ '+totalCredits+'</span>';
    $('semesterProgress').textContent=Math.round(100*current.credits/current.target)+'%';
    $('semesterProgressFill').style.width=Math.min(100,100*current.credits/current.target)+'%';
    $('overallProgressFill').style.width=Math.min(100,100*all.credits/totalCredits)+'%';
    $('gradeCountPill').textContent=current.gradedCourses+' / '+current.courseCount+' graded';
    const complete=all.credits===totalCredits&&state.data[state.programme].elective!=='';
    $('resultPill').textContent=all.credits===0?'No results entered':(complete?'All programme credits graded':'Partial estimate · '+all.credits+'/50 credits graded');
    $('calculationText').textContent=current.credits?`${current.points.toFixed(2)} weighted grade points ÷ ${current.credits} graded credit hours`:'Enter a course result to see weighted grade points ÷ credits';
    $('calculationGpa').innerHTML=`${format(current.gpa)}<small>SEMESTER GPA</small>`;
    $('mobileGpa').textContent=format(current.gpa);
    $('mobileCgpa').textContent=format(all.cgpa);
    const wrap=$('progressRows');wrap.innerHTML='';for(let s=1;s<=3;s++){const x=semesterStats(state.programme,s),c=cumulativeStats(state.programme,s);const pct=Math.min(100,100*x.credits/x.target);const row=document.createElement('div');row.className='progress-row';row.innerHTML=`<div class="progress-top"><span>Semester ${s}</span><span>${x.credits} / ${x.target} credits</span></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div><div class="progress-caption">GPA: <strong>${format(x.gpa)}</strong> &nbsp;·&nbsp; CGPA to date: <strong>${format(c.cgpa)}</strong></div>`;wrap.appendChild(row);}
  }
  function render(){ $('nextSemesterBtn').disabled=state.semester===3; $('nextSemesterBtn').textContent=state.semester===3?'All semesters shown':'Next semester →'; $('programme').value=state.programme;$('studentName').value=state.studentName;$('studentId').value=state.studentId;renderTabs();renderElective();renderCourses();updateSummaries();}
  // Keep administrative controls and the longer grade reference compact on phones.
  const compactScreen=window.matchMedia('(max-width: 650px)');
  function adjustCompactSettings(){
    $('gradeReferenceDetails').open=!compactScreen.matches;
  }
  adjustCompactSettings();
  if(compactScreen.addEventListener)compactScreen.addEventListener('change',adjustCompactSettings);
  else if(compactScreen.addListener)compactScreen.addListener(adjustCompactSettings);
  $('mobilePdfBtn').addEventListener('click',()=> $('printBtn').click());
  document.addEventListener('focusin',e=>{if(e.target.matches('input,select'))document.body.classList.add('field-focused');});
  document.addEventListener('focusout',e=>{if(e.target.matches('input,select'))document.body.classList.remove('field-focused');});
  $('programme').addEventListener('change',e=>{state.programme=e.target.value;state.semester=1;render();persist();});
  $('studentName').addEventListener('input',e=>{state.studentName=e.target.value;persist();});
  $('studentId').addEventListener('input',e=>{state.studentId=e.target.value;persist();});
  $('electiveSelect').addEventListener('change',e=>{state.data[state.programme].elective=e.target.value;renderCourses();updateSummaries();persist();});
  $('nextSemesterBtn').addEventListener('click',()=>{if(state.semester<3){state.semester++;render();persist();$('grades-title').scrollIntoView({behavior:'smooth',block:'start'});}});
  $('clearSemesterBtn').addEventListener('click',()=>{if(!confirm('Clear the grades entered for Semester '+state.semester+'?'))return;const d=state.data[state.programme];for(const course of activeCourses(state.programme,state.semester)) delete d.entries[course.id];render();persist();});
  $('resetBtn').addEventListener('click',()=>{if(!confirm('Clear all entered results and student details? This cannot be undone.'))return;state=defaultState();render();persist();});
  // The official logo is a version-controlled asset. Students have no logo-upload controls.
  // Replace assets/school-logo.png in the repository to update the header and PDF.
  const SCHOOL_LOGO_PATH='assets/school-logo.png';
  let schoolLogoReady=false;
  function setupSchoolLogo(){
    const img=$('schoolLogoImage'),fallback=$('schoolLogoFallback');
    function markReady(available){
      schoolLogoReady=available;
      img.hidden=!available;
      fallback.hidden=available;
    }
    img.addEventListener('load',()=>markReady(true));
    img.addEventListener('error',()=>markReady(false));
    if(img.complete)markReady(img.naturalWidth>0);
  }

  function generateReport(){
    const all=cumulativeStats(state.programme,3);
    const formattedDate=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(new Date());
    const previewLogo=schoolLogoReady?`<img src="${SCHOOL_LOGO_PATH}" alt="School logo">`:'SFS';
    const complete=all.credits===totalCredits;
    let html=`<div class="report-content">
       <div class="report-watermark" aria-hidden="true">UNOFFICIAL</div>
       <div class="report-brand"><div class="report-brand-left"><div class="report-logo">${previewLogo}</div><div><div class="report-brand-title">School of Foundation Studies</div><div class="report-brand-sub">Foundation Programme · Academic self-check</div></div></div><span class="report-badge">UNOFFICIAL REPORT</span></div>
       <div class="report-title-area"><div><div class="report-kicker">Student performance</div><h1 class="report-title">GPA &amp; CGPA Report</h1><p class="report-subtitle">A grade-based summary across your foundation semesters</p></div><div class="report-generated">Prepared on<br><strong>${escapeHtml(formattedDate)}</strong></div></div>
       <div class="report-identity"><div class="report-identity-item"><label>Student name</label><strong>${escapeHtml(state.studentName.trim()||'Not provided')}</strong></div><div class="report-identity-item"><label>Student ID</label><strong>${escapeHtml(state.studentId.trim()||'Not provided')}</strong></div><div class="report-identity-item"><label>Programme</label><strong>${escapeHtml(PLANS[state.programme].name)}</strong></div></div>
       <div class="report-metrics"><div class="report-metric highlight"><label>Cumulative CGPA</label><strong>${format(all.cgpa)}</strong><span>4.00-point scale</span></div><div class="report-metric"><label>Graded credits</label><strong>${all.credits} / 50</strong><span>${complete?'All programme credits entered':'Partial results entered'}</span></div><div class="report-metric"><label>Weighted grade points</label><strong>${all.points.toFixed(2)}</strong><span>Across graded courses</span></div></div>`;
    for(let semester=1;semester<=3;semester++){
      const courses=activeCourses(state.programme,semester),stats=semesterStats(state.programme,semester),cg=cumulativeStats(state.programme,semester);
      html+=`<section class="report-section"><div class="report-section-header"><h3>Semester ${semester}</h3><div class="report-semester-stats">GPA&nbsp; ${format(stats.gpa)} &nbsp;&nbsp; · &nbsp;&nbsp; CGPA&nbsp; ${format(cg.cgpa)} &nbsp;&nbsp; · &nbsp;&nbsp; ${stats.credits} / ${stats.target} credits</div></div>`;
      if(semester===2&&!state.data[state.programme].elective){html+='<div class="report-empty-note">Semester 2 elective not selected; this semester is incomplete.</div>';}
      html+='<table class="report-table"><thead><tr><th>Course</th><th>Credits</th><th>Grade</th><th>Point</th><th>Weighted</th></tr></thead><tbody>';
      for(const course of courses){
        const g=itemForGrade(state.data[state.programme].entries[course.id]?.grade);
        html+=`<tr><td>${escapeHtml(course.name)}${course.isElective?'<span class="report-course-elective">Elective</span>':''}</td><td>${course.credits}</td><td>${g?escapeHtml(g.grade):'—'}</td><td>${g?g.point.toFixed(2):'—'}</td><td>${g?(g.point*course.credits).toFixed(2):'—'}</td></tr>`;
      }
      html+=`<tr class="report-total-row"><td>Semester subtotal</td><td>${stats.credits}</td><td colspan="2"></td><td>${stats.points.toFixed(2)}</td></tr></tbody></table></section>`;
    }
    html+=`<div class="report-endnote"><p>GPA = semester weighted points ÷ graded credits. CGPA = cumulative weighted points ÷ cumulative graded credits. Blank grades are excluded; an F counts as 0.00 points while its credits remain included. This self-check does not apply special academic regulations, and is not an official transcript.</p><strong>${complete?'Complete credit entry':'Partial / estimated results'}</strong></div></div>`;
    $('printReport').innerHTML=html;
    $('reportPreview').innerHTML=html;
  }
  const dlg=$('reportDialog');
  $('printBtn').addEventListener('click',()=>{generateReport();if(typeof dlg.showModal==='function')dlg.showModal();else{window.print();}});
  $('closeReportBtn').addEventListener('click',()=>dlg.close());
  $('cancelReportBtn').addEventListener('click',()=>dlg.close());
  $('confirmPrintBtn').addEventListener('click',()=>{generateReport();window.print();});
  dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close();});
  setupSchoolLogo();
  // Provide a globally accessible, read-only test surface for self-verification.
  window.FoundationGpaCalculator={semesterStats,cumulativeStats,plans:PLANS};
  render();
})();
