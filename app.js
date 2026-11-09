'use strict';
const names=['Definições essenciais','Conteúdo e atividades','Produção e preparação','Fechamento e ensaio','Checagem final','Dia do evento','Pós-evento'];
const dates=['16–20 NOV','23–27 NOV','30 NOV–04 DEZ','07–11 DEZ','14–15 DEZ','16 OU 17 DEZ','ATÉ 22 DEZ'];
const descriptions=['Comece pelas decisões que dão direção ao encontro.','Defina as experiências, as dinâmicas e quem vai conduzi-las.','Prepare os materiais, os participantes e a logística.','Acerte os detalhes e teste a experiência do início ao fim.','Confira o essencial para receber todo mundo.','É hora de conectar a Rede e colocar as ideias em movimento.','Organize os aprendizados e dê continuidade ao que começou.'];
const decisionFallback=['','','','','Local, materiais, acessibilidade e equipe prontos para o encontro.','Propostas, responsáveis e próximos passos registrados.','Resultados compartilhados e continuidade dos encaminhamentos definida.'];
const $=s=>document.querySelector(s);
const storageKey='transformagov-checklist';
const total=groups.reduce((n,g)=>n+g.tasks.length,0);
const taskKey=(g,t)=>`${g}-${t}`;
const escapeHtml=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selected=0,filter='all',allMode=false,checked={},saveError=false,toastTimer;
try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))checked=saved}catch{saveError=true}
const isDone=(g,t)=>checked[taskKey(g,t)]===true;
const doneInGroup=g=>groups[g].tasks.filter((_,t)=>isDone(g,t)).length;
function render(){
 const done=groups.reduce((n,_,g)=>n+doneInGroup(g),0),percentage=Math.round(done/total*100);
 $('#progressNumber').innerHTML=percentage+'<span>%</span>';
 $('#progressText').textContent=`${done} de ${total} tarefas concluídas`;
 $('#pending').textContent=total-done;$('#completed').textContent=done;$('#navCount').textContent=total;
 $('#miniBar').style.width=percentage+'%';$('.progress-track').setAttribute('aria-valuenow',percentage);
 $('#saveStatus').textContent=saveError?'Armazenamento local indisponível':'Marcações salvas automaticamente neste navegador';
 $('#timeline').innerHTML=groups.map((g,i)=>{
  const n=doneInGroup(i),active=i===selected&&!allMode,finished=n===g.tasks.length;
  return `<button class="stage ${active?'active':''} ${finished?'finished':''}" data-stage="${i}" aria-pressed="${active}" aria-label="Etapa ${i+1}: ${names[i]}, ${n} de ${g.tasks.length} tarefas concluídas"><span class="stage-number">${finished?'✓':String(i+1).padStart(2,'0')}</span><span class="stage-content"><span class="stage-date">${dates[i]}</span><span class="stage-name">${names[i]}</span><span class="stage-bottom"><span class="stage-mini-track"><i style="width:${n/g.tasks.length*100}%"></i></span><span class="stage-count">${n}/${g.tasks.length}</span></span></span>${active?'<span class="stage-arrow" aria-hidden="true">›</span>':''}</button>`;
 }).join('');
 const count=allMode?total:groups[selected].tasks.length,finished=allMode?done:doneInGroup(selected);
 $('#stageLabel').textContent=allMode?'VISÃO COMPLETA · NOVEMBRO A DEZEMBRO':`ETAPA ${String(selected+1).padStart(2,'0')} · ${dates[selected]}`;
 $('#taskTitle').textContent=allMode?'Todas as tarefas':names[selected];
 $('#stageDescription').textContent=allMode?'O planejamento completo, do primeiro passo ao pós-evento.':descriptions[selected];
 const status=$('#stageStatus');status.textContent=finished===count?'Concluída':finished?'Em andamento':'A iniciar';status.className='status-pill'+(finished===count?' complete':finished?' started':'');
 $('#stageProgressText').textContent=`${finished} de ${count} tarefas`;
 $('#stageBar').style.width=finished/count*100+'%';$('#tabCount').textContent=count;
 $('#footerCount').textContent=`${count} tarefas ${allMode?'no planejamento':'nesta etapa'}`;
 $('#search').placeholder=allMode?'Buscar em todas as tarefas…':'Buscar nesta etapa…';
 document.querySelectorAll('[data-filter]').forEach(b=>{const active=b.dataset.filter===filter;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',active)});
 $('#overview').classList.toggle('active',!allMode);$('#overview').setAttribute('aria-pressed',!allMode);
 $('#allTasks').classList.toggle('active',allMode);$('#allTasks').setAttribute('aria-pressed',allMode);
 $('.decision').hidden=allMode;
 const decision=groups[selected].decision||decisionFallback[selected];
 $('#decision').textContent=decision.charAt(0).toLocaleUpperCase('pt-BR')+decision.slice(1);
 $('#stageSelect').value=allMode?'all':String(selected);const previous=$('#prevStage');previous.hidden=allMode;previous.disabled=selected===0;
 const next=$('#nextStage');next.hidden=allMode;next.disabled=selected===groups.length-1;next.innerHTML=selected===groups.length-1?'Última etapa':'Próxima etapa <svg class="icon"><use href="#i-arrow"/></svg>';
 renderTasks();
}
function renderTasks(){
 const query=$('#search').value.toLocaleLowerCase('pt-BR').trim();let rows=[];
 groups.forEach((group,g)=>{
  if(!allMode&&g!==selected)return;
  group.tasks.forEach((text,t)=>{
   const done=isDone(g,t);
   if(filter==='done'&&!done||filter==='pending'&&done||!text.toLocaleLowerCase('pt-BR').includes(query))return;
   rows.push(`<label class="task ${done?'done':''}"><input type="checkbox" data-key="${taskKey(g,t)}" ${done?'checked':''}><span class="task-copy">${allMode?`<span class="task-group">${escapeHtml(names[g])} · ${dates[g]}</span>`:''}${escapeHtml(text)}</span><span class="task-index" aria-hidden="true">${String(t+1).padStart(2,'0')}</span></label>`);
  });
 });
 $('#tasks').innerHTML=rows.join('')||'<div class="empty"><strong>Nenhuma tarefa por aqui.</strong>Tente outra busca ou escolha um filtro diferente.</div>';
}
function selectStage(stage){selected=stage;allMode=false;filter='all';$('#search').value='';render()}
document.addEventListener('click',event=>{
 const stage=event.target.closest('[data-stage]');if(stage){selectStage(Number(stage.dataset.stage));return}
 const tab=event.target.closest('[data-filter]');if(tab){filter=tab.dataset.filter;render()}
});
$('#tasks').addEventListener('change',event=>{
 const input=event.target;if(!input.dataset.key)return;
 const focusKey=input.dataset.key;checked[focusKey]=input.checked;
 try{localStorage.setItem(storageKey,JSON.stringify(checked));saveError=false}catch{saveError=true;toast('O navegador não permitiu salvar. Você ainda pode exportar o progresso.')}
 render();const restored=document.querySelector(`[data-key="${focusKey}"]`);if(restored)restored.focus({preventScroll:true});
});
$('#search').addEventListener('input',renderTasks);
$('#stageSelect').innerHTML='<option value="all">Todas as etapas</option>'+names.map((name,i)=>`<option value="${i}">${String(i+1).padStart(2,'0')} · ${name}</option>`).join('');
$('#stageSelect').addEventListener('change',event=>{if(event.target.value==='all'){allMode=true;filter='all';$('#search').value='';render()}else selectStage(Number(event.target.value))});
$('#prevStage').onclick=()=>{if(selected>0){selectStage(selected-1);$('.checklist').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})}};
$('#allTasks').onclick=()=>{allMode=true;filter='all';$('#search').value='';render();$('#planejamento').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})};
$('#overview').onclick=()=>{selectStage(selected);$('#planejamento').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})};
$('#nextStage').onclick=()=>{if(selected<groups.length-1){selectStage(selected+1);$('.checklist').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});$('#taskTitle').setAttribute('tabindex','-1');$('#taskTitle').focus({preventScroll:true})}};
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
$('#export').onclick=()=>{
 let text='CIRCUITO TRANSFORMAGOV — CHECKLIST DE ORGANIZAÇÃO\nDatas sugeridas: 16 ou 17 de dezembro de 2026\n\n';
 groups.forEach((group,g)=>{text+=group.title+'\n';group.tasks.forEach((task,t)=>{text+=`[${isDone(g,t)?'x':' '}] ${task}\n`});if(group.decision)text+='Decisão-chave: '+group.decision+'\n';text+='\n'});
 const url=URL.createObjectURL(new Blob(['\uFEFF',text],{type:'text/plain;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='checklist-transformagov.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Checklist exportado com seu progresso.');
};
render();
