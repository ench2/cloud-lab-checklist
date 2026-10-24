'use strict';
const STORAGE_KEY = 'cloud-lab-checklist-v1';
const groups = [
  { title: '��ʼ֮ǰ', subtitle: '׼���ã�����������ʱ', items: [
    ['free','ȷ�ϱ���ʵ��ķ��÷�Χ','�˶���Ѵ�����ʵ�����������Դ�շ�˵�������ò���ȷʱ��ͣ��'],
    ['account','����ѧϰ�˺���ʵ���˺�','��ʵ���ֲ�ȷ�Ͽ���̨�˺ţ���Ҫƽ̨��ʱ�˺�ʱ����ʹ�ø����˺������'],
    ['isolation','׼�������ĵ�¼�Ự','��Ҫ��ʹ������ / InPrivate ���ڣ��������̨���ٴκ˶��˺š�'],
    ['timer','ȷ��ʵ��ʱ�޺ͽ�����ʽ','�ȶ��경�裬���ⳬʱ����������ʱ����Դ�ͷŹ���']
  ]},
  { title: 'ʵ�������', subtitle: '�ѱ��������ʵ�鷶Χ��', items: [
    ['region','�˶�������Ŀ����Դ���','ֻ�����ֲ���ȷָ�����������Դ�������ڸ��˻����󴴽���'],
    ['cost','�ڴ���ǰ�ٴκ˶Է���','����֧������ֵ���շ���������ȷ�Ĺ���ȷ��ʱֹͣ��'],
    ['secrets','������ʱƾ�ݺ�ʵ������','�������¡���ͼ���ֿ���ʴ��й������롢������Կ��������ϡ�'],
    ['record','��ʵ��¼����ɲ���','δʵ��ִ�л�δͨ����֤�Ĳ��裬�����Ϊ����ɡ�']
  ]},
  { title: '����֮��', subtitle: '��ɲ�����Ҳ�����β', items: [
    ['save','�����Ҫ�ķ�����ѧϰ�ʼ�','���������������Ĵ����������Ƴ�ƾ�ݺ͸�����Ϣ��'],
    ['release','���ֲ��������ʵ��Դ�ͷ�','��Ҫ��ƾ�ر����������Ϊ��Դ��ֹͣ�Ʒѻ��ѱ�ɾ����'],
    ['result','�ֱ�˶�ʵ�������������','ƽ̨���״̬����ֵ����ǲ�ͬ���������ƽ̨��¼Ϊ׼��'],
    ['logout','�˳�ʵ���˺Ų��رո��봰��','����������Ҫ����ʱ�Ự�������´ν�������˺š�']
  ]}
];
const ids = new Set(groups.flatMap(g => g.items.map(i => i[0])));
let state = { name: '', checked: [] };
let storageOK = true;
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (saved && typeof saved === 'object') state = {
    name: typeof saved.name === 'string' ? saved.name.slice(0, 80) : '',
    checked: Array.isArray(saved.checked) ? [...new Set(saved.checked.filter(id => ids.has(id)))] : []
  };
} catch { storageOK = false; }
const root = document.querySelector('#checklist');
groups.forEach((group, index) => {
  const section = document.createElement('section');
  section.className = 'group';
  section.innerHTML = `<div class="group-head"><span class="step">0${index + 1}</span><div><h2>${group.title}</h2><p class="group-sub">${group.subtitle}</p></div></div>`;
  group.items.forEach(([id,title,detail]) => {
    const label = document.createElement('label');
    label.className = 'item';
    label.innerHTML = `<input type="checkbox" id="${id}"><span><strong>${title}</strong><small>${detail}</small></span>`;
    const checkbox = label.querySelector('input');
    checkbox.checked = state.checked.includes(id);
    checkbox.addEventListener('change', () => {
      state.checked = [...root.querySelectorAll('input:checked')].map(el => el.id);
      save(); update();
    });
    section.append(label);
  });
  root.append(section);
});
const nameField = document.querySelector('#lab-name');
nameField.value = state.name;
nameField.addEventListener('input', () => { state.name = nameField.value; save(); });
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageOK = true; }
  catch { storageOK = false; }
  updateStorage();
}
function updateStorage() {
  document.querySelector('#storage-status').textContent = storageOK
    ? '��ѡ����Զ������ڱ����������'
    : '�����δ�ܶ�ȡ�򱣴��¼����ǰ�Կ�ʹ�ã��뼰ʱ������';
}
function update() {
  const n = state.checked.length;
  document.querySelector('#count').textContent = `${n} / ${ids.size} ��`;
  document.querySelector('#percent').textContent = `${Math.round(n / ids.size * 100)}%`;
  document.querySelector('#progress').value = n;
  document.querySelector('#status').textContent = n === ids.size
    ? '�Բ��¼�ѹ�ѡ������ƽ̨�������Դ״̬����ֱ��ʵ��'
    : n === 0 ? '�Ⱥ˶�׼���嵥���ٽ���ʵ�顣' : `�Ѽ�¼ ${n} �ʣ�� ${ids.size - n} ����˶ԡ�`;
  updateStorage();
}
document.querySelector('#export').addEventListener('click', () => {
  const lines = ['��ʵ�����嵥', `ʵ�飺${state.name || 'δ����'}`, `����ʱ�䣺${new Date().toLocaleString()}`, '', '�����û��Բ��¼������ƽ̨��ɻ����֤����'];
  groups.forEach(group => {
    lines.push('', group.title);
    group.items.forEach(([id,title,detail]) => lines.push(`${state.checked.includes(id) ? '[x]' : '[ ]'} ${title}`, `    ${detail}`));
  });
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = 'cloud-lab-checklist.txt';
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
const resetDialog = document.querySelector('#reset-dialog');
document.querySelector('#reset').addEventListener('click', () => resetDialog.showModal());
document.querySelector('#cancel-reset').addEventListener('click', () => resetDialog.close());
document.querySelector('#confirm-reset').addEventListener('click', () => {
  state = {name:'',checked:[]}; nameField.value = ''; root.querySelectorAll('input').forEach(el => {el.checked=false;});
  save(); update(); resetDialog.close();
});
update();
