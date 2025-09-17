// create-db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('prices.sqlite');

// بيانات العدسات
const lensData = [
  {section:'Single Vision', type:'Single', idx:'1.5 70 MM', price:304},
  {section:'Single Vision', type:'Single', idx:'1.50 75 MM', price:320},
  {section:'Single Vision', type:'Sport', idx:'1.5 70 MM', price:360},
  {section:'Bi Focal', type:'INVISABEL', idx:'1.5 70 MM', price:360},
  {section:'Progressive', type:'Top', idx:'1.5 70 MM', price:360},
  // أكمل باقي البيانات هنا …
];

db.serialize(() => {
  // إنشاء الجداول
  db.run(`CREATE TABLE IF NOT EXISTS lens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT,
    type TEXT,
    idx TEXT,
    price REAL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lens_id INTEGER,
    section TEXT,
    type TEXT,
    idx TEXT,
    price REAL
  )`);

  // إدخال البيانات
  const stmt = db.prepare("INSERT INTO lens (section,type,idx,price) VALUES (?,?,?,?)");
  lensData.forEach(l => stmt.run([l.section,l.type,l.idx,l.price]));
  stmt.finalize();

  console.log('تم إنشاء prices.sqlite بنجاح ✅');
});

db.close();
