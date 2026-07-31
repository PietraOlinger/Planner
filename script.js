let data = loadData();

  function loadData(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return days.map(()=>[]);
      return JSON.parse(raw);
    }catch(e){
      console.error('Erro ao carregar dados:', e);
      return days.map(()=>[]);
    }
  }

  function saveData(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

  const board = document.getElementById('board');

  function render(){
    board.innerHTML = '';
    days.forEach((dayName, idx) => {
      const col = document.createElement('div');
      col.className = 'day';
      const header = document.createElement('h2');
      header.innerHTML = '<span>'+dayName+'</span>';
      const addBtn = document.createElement('button');
      addBtn.className = 'btn-add';
      addBtn.textContent = '+ Adicionar';
      addBtn.onclick = ()=> showInlineForm(idx, col);
      header.appendChild(addBtn);
      col.appendChild(header);

      const ul = document.createElement('ul');
      ul.className = 'list';
      data[idx].forEach(task => {
        const li = document.createElement('li');
        li.className = 'task';
        li.dataset.id = task.id;

        const timeSpan = document.createElement('div');
        timeSpan.className = 'time';
        timeSpan.textContent = task.time || '--:--';
        timeSpan.title = 'Clique para editar a hora';
        timeSpan.onclick = ()=> editTime(idx, task.id);

        const textSpan = document.createElement('div');
        textSpan.className = 'text';
        textSpan.contentEditable = true;
        textSpan.spellcheck = false;
        textSpan.innerText = task.text || '';
        textSpan.addEventListener('blur', ()=> {
          updateTaskText(idx, task.id, textSpan.innerText.trim());
        });
        textSpan.addEventListener('keydown', (e)=> {
          if(e.key === 'Enter'){ e.preventDefault(); textSpan.blur(); }
        });

        const actions = document.createElement('div');
        actions.className = 'actions';
        const delBtn = document.createElement('button');
        delBtn.className = 'btn-del';
        delBtn.textContent = '✕';
        delBtn.title = 'Excluir';
        delBtn.onclick = ()=> {
          if(confirm('Excluir compromisso?')) { deleteTask(idx, task.id); }
        };

        actions.appendChild(delBtn);

        li.appendChild(timeSpan);
        li.appendChild(textSpan);
        li.appendChild(actions);
        ul.appendChild(li);
      });

      col.appendChild(ul);
      board.appendChild(col);
    });
  }

  function showInlineForm(dayIndex, container){
    if(container.querySelector('.inline-form')) return;
    const form = document.createElement('div');
    form.className = 'inline-form';
    const timeInput = document.createElement('input');
    timeInput.type = 'time';
    timeInput.value = '09:00';
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.placeholder = 'Descrição...';
    const ok = document.createElement('button');
    ok.className = 'btn-add';
    ok.textContent = 'Salvar';
    ok.onclick = ()=>{
      const text = textInput.value.trim();
      const time = timeInput.value || '';
      if(!text){ alert('Digite a descrição.'); textInput.focus(); return; }
      addTask(dayIndex, {id: uid(), time, text});
      form.remove();
    };
    const cancel = document.createElement('button');
    cancel.textContent = 'Cancelar';
    cancel.onclick = ()=> form.remove();
    form.appendChild(timeInput);
    form.appendChild(textInput);
    form.appendChild(ok);
    form.appendChild(cancel);
    container.appendChild(form);
    textInput.focus();
  }

  function addTask(dayIndex, task){
    data[dayIndex].push(task);
    saveData();
    render();
  }

  function updateTaskText(dayIndex, id, newText){
    const list = data[dayIndex];
    const item = list.find(t=>t.id===id);
    if(item){
      item.text = newText;
      saveData();
    }
  }

  function editTime(dayIndex, id){
    const list = data[dayIndex];
    const item = list.find(t=>t.id===id);
    if(!item) return;
    const newTime = prompt('Editar hora (HH:MM)', item.time || '');
    if(newTime === null) return;
    if(newTime && !/^\d{2}:\d{2}$/.test(newTime)){
      alert('Formato inválido. Use HH:MM (por exemplo 14:30).');
      return;
    }
    item.time = newTime;
    saveData();
    render();
  }

  function deleteTask(dayIndex, id){
    data[dayIndex] = data[dayIndex].filter(t=>t.id!==id);
    saveData();
    render();
  }

  render();

  // Funções úteis para debug/uso avançado
  window.PLANNER = {
    getData: ()=>JSON.parse(JSON.stringify(data)),
    clearAll: ()=>{ if(confirm('Limpar todos os compromissos?')){ data = days.map(()=>[]); saveData(); render(); } }
  };
})();
