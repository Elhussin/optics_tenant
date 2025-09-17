
function toggleGroup(header, content){
  const isOpen = content.style.maxHeight && content.style.maxHeight!=='0px';
  document.querySelectorAll('.checkbox-group').forEach(c=>{
    c.style.maxHeight='0';
    c.previousElementSibling.style.padding='1rem 0.8rem'; // إعادة الطي للارتفاع الكبير
  });
  if(!isOpen){
    content.style.maxHeight = content.scrollHeight + 'px';
    header.style.padding='0.5rem 0.8rem'; // عند الفتح أصغر ارتفاع
  }
}
const lensData =   [
  {section:'Single Vision', type:'Single', products:[
    {index:'1.5 70 MM', price:304},{index:'1.50 75 MM', price:320},{index:'1.50 80 MM', price:344},{index:'1.50 B.CUT', price:520},{index:'1.61', price:640},{index:'1.67', price:880},{index:'1.74', price:1520},{index:'1.59 POLY', price:640},{index:'1.56 SUPERVEX', price:640},{index:'1.56 B.CUT', price:440},{index:'1.56 B.CUT 75 MM', price:480},{index:'1.61 B.CUT', price:720},{index:'1.67 B.CUT', price:960},{index:'1.50 TRANSMISSION GRAY', price:760},{index:'1.56 PHOTO GRAY & BROWN', price:520},{index:'1.56 PHOTO GRAY 75 M', price:640},{index:'1.56 PHOTO (BLUE-GREEN-PINK-PURPLE)', price:850},{index:'1.61 TRANSMISSION GRAY', price:1120},{index:'1.67 TRANSMISSION GRAY', price:1440},{index:'1.56 B.CUT GRAY', price:880},{index:'1.61 B.CUT GRAY', price:1200},{index:'MIRROR', price:700},{index:'1.50 POLORIZED', price:640},{index:'LENTICULAR', price:440},{index:'MYOPIA CONTROL', price:1950},{index:'BEST 1.50', price:400}
  ]},
  {section:'Single Vision', type:'Sport', products:[
    {index:'1.5 70 MM', price:360},{index:'1.50 75 MM', price:376},{index:'1.50 80 MM', price:400},{index:'1.50 B.CUT', price:720},{index:'1.61', price:792},{index:'1.67', price:1024},{index:'1.74', price:1680},{index:'1.59 POLY', price:720},{index:'1.56 SUPERVEX', price:800},{index:'1.56 B.CUT', price:960},{index:'1.56 B.CUT 75 MM', price:640},{index:'1.61 B.CUT', price:840},{index:'1.67 B.CUT', price:1104},{index:'1.50 TRANSMISSION GRAY', price:984},{index:'1.56 PHOTO GRAY & BROWN', price:840},{index:'1.56 PHOTO GRAY 75 M', price:800},{index:'1.56 PHOTO (BLUE-GREEN-PINK-PURPLE)', price:1050},{index:'1.61 TRANSMISSION GRAY', price:1240},{index:'1.67 TRANSMISSION GRAY', price:1560},{index:'1.56 B.CUT GRAY', price:1120},{index:'1.61 B.CUT GRAY', price:1320},{index:'MIRROR', price:800},{index:'1.50 POLORIZED', price:800},{index:'LENTICULAR', price:'-'},{index:'MYOPIA CONTROL', price:'-'},{index:'BEST 1.50', price:'-'}
  ]},
  {section:'Bi Focal', type:'INVISABEL', products:[
    {index:'1.5 70 MM', price:360},{index:'1.50 75 MM', price:376},{index:'1.50 80 MM', price:400},{index:'1.50 B.CUT', price:656},{index:'1.61', price:760},{index:'1.67', price:992},{index:'1.74', price:1656},{index:'1.59 POLY', price:736},{index:'1.56 SUPERVEX', price:720},{index:'1.56 B.CUT', price:576},{index:'1.56 B.CUT 75 MM', price:616},{index:'1.61 B.CUT', price:856},{index:'1.67 B.CUT', price:1072},{index:'1.50 TRANSMISSION GRAY', price:888},{index:'1.56 PHOTO GRAY & BROWN', price:648},{index:'1.56 PHOTO GRAY 75 M', price:768},{index:'1.56 PHOTO (BLUE-GREEN-PINK-PURPLE)', price:'-'},{index:'1.61 TRANSMISSION GRAY', price:1200},{index:'1.67 TRANSMISSION GRAY', price:1520},{index:'1.56 B.CUT GRAY', price:976},{index:'1.61 B.CUT GRAY', price:1280},{index:'MIRROR', price:840},{index:'1.50 POLORIZED', price:776},{index:'LENTICULAR', price:'-'},{index:'MYOPIA CONTROL', price:'-'},{index:'BEST 1.50', price:'-'}
  ]},
  {section:'Bi Focal', type:'Flat Top', products:[
    {index:'1.5 70 MM', price:336},{index:'1.50 75 MM', price:'-'},{index:'1.50 80 MM', price:'-'},{index:'1.50 B.CUT', price:'-'},{index:'1.61', price:'-'},{index:'1.67', price:'-'},{index:'1.74', price:'-'},{index:'1.59 POLY', price:'-'},{index:'1.56 SUPERVEX', price:'-'},{index:'1.56 B.CUT', price:560},{index:'1.56 B.CUT 75 MM', price:'-'},{index:'1.61 B.CUT', price:'-'},{index:'1.67 B.CUT', price:'-'},{index:'1.50 TRANSMISSION GRAY', price:'-'},{index:'1.56 PHOTO GRAY & BROWN', price:576},{index:'1.56 PHOTO GRAY 75 M', price:768},{index:'1.56 PHOTO (BLUE-GREEN-PINK-PURPLE)', price:'-'},{index:'1.61 TRANSMISSION GRAY', price:'-'},{index:'1.67 TRANSMISSION GRAY', price:'-'},{index:'1.56 B.CUT GRAY', price:'-'},{index:'1.61 B.CUT GRAY', price:'-'},{index:'MIRROR', price:'-'},{index:'1.50 POLORIZED', price:'-'},{index:'LENTICULAR', price:'-'},{index:'MYOPIA CONTROL', price:'-'},{index:'BEST 1.50', price:'450'}
]},


{section:'Progressive', type:'Top', products:[
    {index:'1.5 70 MM', price:360},{index:'1.50 75 MM', price:376},{index:'1.50 80 MM', price:400},{index:'1.50 B.CUT', price:656},{index:'1.61', price:760},{index:'1.67', price:992},{index:'1.74', price:1656},{index:'1.59 POLY', price:736},{index:'1.56 SUPERVEX', price:720},{index:'1.56 B.CUT', price:576},{index:'1.56 B.CUT 75 MM', price:616},{index:'1.61 B.CUT', price:856},{index:'1.67 B.CUT', price:1072},{index:'1.50 TRANSMISSION GRAY', price:888},{index:'1.56 PHOTO GRAY & BROWN', price:648},{index:'1.56 PHOTO GRAY 75 M', price:'768'},{index:'1.56 PHOTO (BLUE-GREEN-PINK-PURPLE)', price:1010},{index:'1.61 TRANSMISSION GRAY', price:1200},{index:'1.67 TRANSMISSION GRAY', price:1520},{index:'1.56 B.CUT GRAY', price:976},{index:'1.61 B.CUT GRAY', price:1280},{index:'MIRROR', price:840},{index:'1.50 POLORIZED', price:776},{index:'LENTICULAR', price:'-'},{index:'MYOPIA CONTROL', price:'-'},{index:'BEST 1.50', price:480}
]},
{section:'Progressive', type:'Magic', products:[
    {index:'1.5 70 MM', price:440},{index:'1.50 75 MM', price:456},{index:'1.50 80 MM', price:480},{index:'1.50 B.CUT', price:736},{index:'1.61', price:840},{index:'1.67', price:1072},{index:'1.74', price:1736},{index:'1.59 POLY', price:816},{index:'1.56 SUPERVEX', price:800},{index:'1.56 B.CUT', price:656},{index:'1.56 B.CUT 75 MM', price:696},{index:'1.61 B.CUT', price:936},{index:'1.67 B.CUT', price:1152},{index:'1.50 TRANSMISSION GRAY', price:968},{index:'1.56 PHOTO GRAY & BROWN', price:728},{index:'1.56 PHOTO GRAY 75 M', price:848},{index:'1.56 PHOTO (BLUE-GREEN-PINK-PURPLE)', price:1110},{index:'1.61 TRANSMISSION GRAY', price:1280},{index:'1.67 TRANSMISSION GRAY', price:1600},{index:'1.56 B.CUT GRAY', price:1056},{index:'1.61 B.CUT GRAY', price:1360},{index:'MIRROR', price:940},{index:'1.50 POLORIZED', price:856},{index:'LENTICULAR', price:'-'},{index:'MYOPIA CONTROL', price:'-'},{index:'BEST 1.50', price:'-'}
]},
{section:'Progressive', type:'Nice', products:[
    {index:'1.5 70 MM', price:376},{index:'1.50 75 MM', price:392},{index:'1.50 80 MM', price:416},{index:'1.50 B.CUT', price:672},{index:'1.61', price:776},{index:'1.67', price:1008},{index:'1.74', price:1672},{index:'1.59 POLY', price:752},{index:'1.56 SUPERVEX', price:736},{index:'1.56 B.CUT', price:592},{index:'1.56 B.CUT 75 MM', price:632},{index:'1.61 B.CUT', price:872},{index:'1.67 B.CUT', price:1088},{index:'1.50 TRANSMISSION GRAY', price:904},{index:'1.56 PHOTO GRAY & BROWN', price:664},{index:'1.56 PHOTO GRAY 75 M', price:784},{index:'1.56 PHOTO (BLUE-GREEN-PINK-PURPLE)', price:1030},{index:'1.61 TRANSMISSION GRAY', price:1216},{index:'1.67 TRANSMISSION GRAY', price:1536},{index:'1.56 B.CUT GRAY', price:992},{index:'1.61 B.CUT GRAY', price:1296},{index:'MIRROR', price:860},{index:'1.50 POLORIZED', price:792},{index:'LENTICULAR', price:'-'},{index:'MYOPIA CONTROL', price:'-'},{index:'BEST 1.50', price:'-'}
]},
{section:'Progressive', type:'Nice Pro', products:[
    {index:'1.5 70 MM', price:440},{index:'1.50 75 MM', price:456},{index:'1.50 80 MM', price:480},{index:'1.50 B.CUT', price:736},{index:'1.61', price:840},{index:'1.67', price:1072},{index:'1.74', price:1736},{index:'1.59 POLY', price:816},{index:'1.56 SUPERVEX', price:800},{index:'1.56 B.CUT', price:656},{index:'1.56 B.CUT 75 MM', price:696},{index:'1.61 B.CUT', price:936},{index:'1.67 B.CUT', price:1152},{index:'1.50 TRANSMISSION GRAY', price:968},{index:'1.56 PHOTO GRAY & BROWN', price:728},{index:'1.56 PHOTO GRAY 75 M', price:848},{index:'1.56 PHOTO (BLUE-GREEN-PINK-PURPLE)', price:1110},{index:'1.61 TRANSMISSION GRAY', price:1280},{index:'1.67 TRANSMISSION GRAY', price:1600},{index:'1.56 B.CUT GRAY', price:1056},{index:'1.61 B.CUT GRAY', price:1360},{index:'MIRROR', price:940},{index:'1.50 POLORIZED', price:856},{index:'LENTICULAR', price:'-'},{index:'MYOPIA CONTROL', price:'-'},{index:'BEST 1.50', price:'-'}
]},
{section:'Life Style', type:'Computer', products:[
    {index:'1.5 70 MM', price:480},{index:'1.50 75 MM', price:496},{index:'1.50 80 MM', price:520},{index:'1.50 B.CUT', price:776},{index:'1.61', price:880},{index:'1.67', price:1072},{index:'1.74', price:1776},{index:'1.59 POLY', price:856},{index:'1.56 SUPERVEX', price:840},{index:'1.56 B.CUT', price:1096},{index:'1.56 B.CUT 75 MM', price:696},{index:'1.61 B.CUT', price:976},{index:'1.67 B.CUT', price:1192},{index:'1.50 TRANSMISSION GRAY', price:1072},{index:'1.56 PHOTO GRAY & BROWN', price:1008},{index:'1.56 PHOTO GRAY 75 M', price:888},{index:'1.56 PHOTO (BLUE-GREEN-PINK-PURPLE)', price:1160},{index:'1.61 TRANSMISSION GRAY', price:1240},{index:'1.67 TRANSMISSION GRAY', price:1560},{index:'1.56 B.CUT GRAY', price:1120},{index:'1.61 B.CUT GRAY', price:1320},{index:'MIRROR', price:900},{index:'1.50 POLORIZED', price:896},{index:'LENTICULAR', price:'-'},{index:'MYOPIA CONTROL', price:'-'},{index:'BEST 1.50', price:'-'}
]},
{section:'Life Style', type:'Relife', products:[
    {index:'1.5 70 MM', price:360},{index:'1.50 75 MM', price:376},{index:'1.50 80 MM', price:400},{index:'1.50 B.CUT', price:672},{index:'1.61', price:760},{index:'1.67', price:992},{index:'1.74', price:1656},{index:'1.59 POLY', price:736},{index:'1.56 SUPERVEX', price:720},{index:'1.56 B.CUT', price:576},{index:'1.56 B.CUT 75 MM', price:616},{index:'1.61 B.CUT', price:856},{index:'1.67 B.CUT', price:1072},{index:'1.50 TRANSMISSION GRAY', price:888},{index:'1.56 PHOTO GRAY & BROWN', price:648},{index:'1.56 PHOTO GRAY 75 M', price:768},{index:'1.56 PHOTO (BLUE-GREEN-PINK-PURPLE)', price:1010},{index:'1.61 TRANSMISSION GRAY', price:1200},{index:'1.67 TRANSMISSION GRAY', price:1520},{index:'1.56 B.CUT GRAY', price:976},{index:'1.61 B.CUT GRAY', price:1280},{index:'MIRROR', price:840},{index:'1.50 POLORIZED', price:776},{index:'LENTICULAR', price:'-'},{index:'MYOPIA CONTROL', price:'-'},{index:'BEST 1.50', price:'-'}
]},
{section:'Life Style', type:'Driving', products:[
    {index:'1.5 70 MM', price:360},{index:'1.50 75 MM', price:376},{index:'1.50 80 MM', price:400},{index:'1.50 B.CUT', price:672},{index:'1.61', price:760},{index:'1.67', price:992},{index:'1.74', price:1656},{index:'1.59 POLY', price:736},{index:'1.56 SUPERVEX', price:720},{index:'1.56 B.CUT', price:576},{index:'1.56 B.CUT 75 MM', price:616},{index:'1.61 B.CUT', price:856},{index:'1.67 B.CUT', price:1072},{index:'1.50 TRANSMISSION GRAY', price:888},{index:'1.56 PHOTO GRAY & BROWN', price:648},{index:'1.56 PHOTO GRAY 75 M', price:768},{index:'1.56 PHOTO (BLUE-GREEN-PINK-PURPLE)', price:1010},{index:'1.61 TRANSMISSION GRAY', price:1200},{index:'1.67 TRANSMISSION GRAY', price:1520},{index:'1.56 B.CUT GRAY', price:976},{index:'1.61 B.CUT GRAY', price:1280},{index:'MIRROR', price:840},{index:'1.50 POLORIZED', price:776},{index:'LENTICULAR', price:'-'},{index:'MYOPIA CONTROL', price:'-'},{index:'BEST 1.50', price:'-'}
]},
{section:'Life Style', type:'Kids', products:[
    {index:'1.5 70 MM', price:360},{index:'1.50 75 MM', price:376},{index:'1.50 80 MM', price:400},{index:'1.50 B.CUT', price:672},{index:'1.61', price:760},{index:'1.67', price:992},{index:'1.74', price:1656},{index:'1.59 POLY', price:736},{index:'1.56 SUPERVEX', price:720},{index:'1.56 B.CUT', price:576},{index:'1.56 B.CUT 75 MM', price:616},{index:'1.61 B.CUT', price:856},{index:'1.67 B.CUT', price:1072},{index:'1.50 TRANSMISSION GRAY', price:888},{index:'1.56 PHOTO GRAY & BROWN', price:648},{index:'1.56 PHOTO GRAY 75 M', price:768},{index:'1.56 PHOTO (BLUE-GREEN-PINK-PURPLE)', price:1010},{index:'1.61 TRANSMISSION GRAY', price:1200},{index:'1.67 TRANSMISSION GRAY', price:1520},{index:'1.56 B.CUT GRAY', price:976},{index:'1.61 B.CUT GRAY', price:1280},{index:'MIRROR', price:840},{index:'1.50 POLORIZED', price:776},{index:'LENTICULAR', price:'-'},{index:'MYOPIA CONTROL', price:'-'},{index:'BEST 1.50', price:'-'}
]}

  // ... تابع إدخال باقي الأنواع Progressive و Life Style بنفس الشكل ...
];

const extrasGroups = [
  [{name:'HC', price:120},{name:'Bright', price:200},{name:'Bright PLUS', price:280},{name:'Bright BLUE', price:480},{name:'Bright Drive HMC', price:400}],
  [{name:'Watercolor', price:50},{name:'Watercolor-HI INDEX', price:70}],
  [{name:'Plus Double Base TOTAL +12', price:80},{name:'Plus Double Base TOTAL > +12', price:160},{name:'ADD Base', price:40}],
  [{name:'Prism <= 6', price:40},{name:'Prism > 6', price:120},{name:'Decentering', price:40}],
  [{name:'Edge Blending ', price:120},{name:'PLUS Blending', price:80},{name:'More Edge Blending', price:160},{name:'OVAL', price:80}],
  [{name:'Higher than 4 cylinders ', price:40},{name:'Higher than 6 cylinders', price:120}]
];

const extrasGroupNames = ['Coating','Water color','Base','Prism','Edge Blending','HIGH CYL'];

let currentLens = {section:'', type:'', price:0, index:''};

// إنشاء أقسام العدسات
function createLensSections(){
  const container = document.getElementById('lensSections');
  container.innerHTML = '';
  const sectionsMap = {};
  lensData.forEach(item=>{ if(!sectionsMap[item.section]) sectionsMap[item.section]=[]; sectionsMap[item.section].push(item); });

  for(let sec in sectionsMap){
    const divSection = document.createElement('div'); 
    divSection.className='section';
    divSection.style.marginBottom='10px';

    const header = document.createElement('h2');
    header.textContent = sec;
    header.className='section-header';

    const content = document.createElement('div'); 
    content.className='content';

    let tableHTML = `<table><thead><tr><th>Index</th>`;
    sectionsMap[sec].forEach(typeObj=>{ tableHTML+=`<th>${typeObj.type}</th>`; });
    tableHTML += `</tr></thead><tbody></tbody></table>`;
    content.innerHTML = tableHTML;

    const tbody = content.querySelector('tbody');
    const indices = sectionsMap[sec][0].products.map(p=>p.index);
    indices.forEach(index=>{
      const tr = document.createElement('tr'); tr.innerHTML=`<td>${index}</td>`;
      sectionsMap[sec].forEach(typeObj=>{
        const prod = typeObj.products.find(p=>p.index===index);
        const price = prod ? prod.price : '-';
        tr.innerHTML += `<td>${price!=='-' ? `<button class="price-btn" onclick="openExtras('${sec}','${typeObj.type}',${price},'${index}')">${price}</button>` : '<span style="color:red">-</span>'}</td>`;
      });
      tbody.appendChild(tr);
    });

    header.addEventListener('click', ()=>{
      if(content.style.maxHeight && content.style.maxHeight !== '0px'){
        content.style.maxHeight = '0';
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });

    divSection.appendChild(header);
    divSection.appendChild(content);
    container.appendChild(divSection);
  }
}

// البحث
function filterTable(){
  const filter = document.getElementById("searchBox").value.toUpperCase();
  document.querySelectorAll("table").forEach(table=>{
    const trs = table.getElementsByTagName("tr");
    for(let i=1;i<trs.length;i++){
      const tds = trs[i].getElementsByTagName("td"); let show=false;
      for(let j=0;j<tds.length;j++){ if(tds[j].textContent.toUpperCase().indexOf(filter)>-1){show=true; break;} }
      trs[i].style.display=show?"":"none";
    }
  });
}

// نافذة الإضافات
function openExtras(section, type, price, index){
  currentLens = {section:type, type:section, price:price, index:index};
  document.getElementById('modalTitle').textContent = `اختر الإضافات للعدسة: ${section} - ${type}`;
  const container = document.getElementById('extrasContainer');
  container.innerHTML = '';

  extrasGroups.forEach((group,i)=>{
    const divGroup = document.createElement('div');
    divGroup.className='group-section';

    const header = document.createElement('h4');
    header.textContent = extrasGroupNames[i];

    const content = document.createElement('div');
    content.className='checkbox-group';
    content.style.maxHeight='0';

    group.forEach(extra=>{
      const label = document.createElement('label');
      label.innerHTML = `<input type="radio" name="group${i}" value="${extra.name}" data-price="${extra.price}"> ${extra.name} +${extra.price}`;
      content.appendChild(label);
    });

    header.addEventListener('click', ()=>{
      if(content.style.maxHeight && content.style.maxHeight !== '0px'){
        content.style.maxHeight='0';
      } else{
        document.querySelectorAll('.checkbox-group').forEach(c=>c.style.maxHeight='0');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });

    divGroup.appendChild(header);
    divGroup.appendChild(content);
    container.appendChild(divGroup);
  });

  document.getElementById('overlay').style.display='block';
  document.getElementById('extrasModal').style.display='block';
}

function closeModal(){
  document.getElementById('overlay').style.display='none';
  document.getElementById('extrasModal').style.display='none';
}

// إضافة الطلب
function addOrder(){
  const extrasSelected=[];
  document.querySelectorAll('#extrasContainer input:checked').forEach(inp=>{
    extrasSelected.push({name:inp.value, price:Number(inp.dataset.price)});
  });

  const totalExtras = extrasSelected.reduce((sum,e)=>sum+e.price,0);
  const totalPrice = currentLens.price + totalExtras;

  const tbody = document.getElementById('ordersBody');
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${currentLens.type}</td><td>${currentLens.index}</td><td>${currentLens.price}</td><td>${extrasSelected.map(e=>e.name).join(', ')} (${extrasSelected.map(e=>e.price).join(', ')})</td><td>${totalPrice}</td><td><button onclick="this.closest('tr').remove()" style="background:red;color:#fff;padding:2px 6px;border:none;border-radius:3px;cursor:pointer">حذف</button></td>`;
  tbody.appendChild(tr);
  closeModal();
}

// تشغيل عند التحميل
createLensSections();
// فقط استبدال toggleGroup في حدث الضغط على h4:
document.addEventListener("DOMContentLoaded", function(){
  document.querySelectorAll('.group-section header').forEach(header=>{
    const content = header.nextElementSibling;
    header.addEventListener('click', ()=>toggleGroup(H4, content));
  });
});
document.getElementById('printBtn').addEventListener('click', printOrders);

function printOrders() {
  const table = document.getElementById('ordersContainer').querySelector('table');
  const clonedTable = table.cloneNode(true);

  // تحديد الأعمدة المطلوب إخفاؤها
  const removeHeaders = ['حذف', 'طباعة'];

  // تحديد فهارس الأعمدة
  const ths = clonedTable.querySelectorAll('thead th');
  let removeIndexes = [];
  ths.forEach((th, idx) => {
    if(removeHeaders.includes(th.textContent.trim())) {
      removeIndexes.push(idx);
    }
    // لو العمود فيه زر (بدون نص واضح) نعتبره "طباعة"
    if(th.querySelector('button')) {
      removeIndexes.push(idx);
    }
  });

  // ترتيب الفهارس تنازليًا علشان الحذف ما يبوظش الترتيب
  removeIndexes = [...new Set(removeIndexes)].sort((a, b) => b - a);

  // إزالة الأعمدة المحددة من الرأس
  clonedTable.querySelectorAll('thead tr').forEach(tr => {
    removeIndexes.forEach(idx => {
      if(tr.children[idx]) tr.removeChild(tr.children[idx]);
    });
  });

  // إزالة الأعمدة المحددة من كل صف في الجسم
  clonedTable.querySelectorAll('tbody tr').forEach(tr => {
    removeIndexes.forEach(idx => {
      if(tr.children[idx]) tr.removeChild(tr.children[idx]);
    });
  });

  // إنشاء نافذة الطباعة
  const printWindow = window.open('', '', 'width=900,height=600');
  printWindow.document.write('<html><head><title>طباعة الطلبات</title>');
  printWindow.document.write('<style>table {border-collapse: collapse; width:100%;} th, td {border:1px solid #000; padding:5px; text-align:center;} th {background:#4f46e5; color:#fff;}</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write('<h2>الطلبات المختارة</h2>');
  printWindow.document.write(clonedTable.outerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
}
function printOrders() {
  const table = document.getElementById('ordersContainer').querySelector('table');
  const clonedTable = table.cloneNode(true);

  const removeHeaders = ['حذف', 'طباعة'];
  const ths = clonedTable.querySelectorAll('thead th');
  let removeIndexes = [];
  ths.forEach((th, idx) => {
    if(removeHeaders.includes(th.textContent.trim())) removeIndexes.push(idx);
  });

  removeIndexes = [...new Set(removeIndexes)].sort((a,b)=>b-a);

  clonedTable.querySelectorAll('thead tr').forEach(tr => {
    removeIndexes.forEach(idx => {
      if(tr.children[idx]) tr.removeChild(tr.children[idx]);
    });
  });
  clonedTable.querySelectorAll('tbody tr').forEach(tr => {
    removeIndexes.forEach(idx => {
      if(tr.children[idx]) tr.removeChild(tr.children[idx]);
    });
  });

  const printWindow = window.open('', '', 'width=900,height=600');
  printWindow.document.write('<html><head><title>طباعة الطلبات</title>');
  printWindow.document.write('<style>table {border-collapse: collapse; width:100%;} th, td {border:1px solid #000; padding:5px; text-align:center;} th {background:#4f46e5; color:#fff;} button.close-btn {margin-bottom:10px; padding:5px 10px; cursor:pointer; background:red; color:#fff; border:none; border-radius:4px;}</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write('<button class="close-btn" onclick="window.close()">إغلاق النافذة</button>');
  printWindow.document.write('<h2>الطلبات المختارة</h2>');
  printWindow.document.write(clonedTable.outerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

