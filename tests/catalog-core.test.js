const test=require('node:test');
const assert=require('node:assert/strict');
const Core=require('../catalog-core.js');

test('normalizes IDs from the documented API shapes',()=>{
  assert.equal(Core.normalize({id:'a1',titulo:'Mouse',descricao:'Wireless',preco:199.9}).id,'a1');
  assert.equal(Core.normalize({_id:'a2',title:'Headset',description:'Audio',price:99}).id,'a2');
  assert.equal(Core.normalize({ID:'a3',titulo:'Teclado',descricao:'ABNT2',preco:250}).id,'a3');
});
test('rejects API products without a stable ID',()=>{
  assert.throws(()=>Core.normalize({titulo:'Monitor',descricao:'24 polegadas',preco:700}),/ID/);
});
test('unwraps direct and envelope API lists',()=>{
  const row={id:'x',titulo:'Console',descricao:'1 TB',preco:4000};
  assert.equal(Core.unwrapProducts({dados:[row]})[0].id,'x');
  assert.equal(Core.unwrapProducts([row])[0].titulo,'Console');
  assert.throws(()=>Core.unwrapProducts({total:1}),/lista/);
});
test('validates required text, price, and HTTPS image URLs',()=>{
  assert.equal(Core.validateProduct({titulo:'Mouse Gamer',descricao:'Sem fio',preco:199.9,imagem:'https://cdn.example.com/mouse.jpg'}),null);
  assert.match(Core.validateProduct({titulo:'',descricao:'x',preco:-1}),/título/);
  assert.match(Core.validateProduct({titulo:'A',descricao:'Descrição válida',preco:1}),/título/);
  assert.match(Core.validateProduct({titulo:'Monitor',descricao:'Descrição válida',preco:0}),/preço/);
  assert.match(Core.validateProduct({titulo:'Monitor',descricao:'Descrição válida',preco:10,imagem:'javascript:alert(1)'}),/HTTPS/);
});
test('search matches IDs, names, and accent-insensitive descriptions',()=>{
  const rows=[{id:'x-1',titulo:'Teclado Mecânico',descricao:'Switch vermelho',preco:100},{id:'x-2',titulo:'Mouse',descricao:'Sem fio',preco:50}];
  assert.equal(Core.filterProducts(rows,'mecanico').length,1);
  assert.equal(Core.filterProducts(rows,'X-2')[0].titulo,'Mouse');
  assert.equal(Core.filterProducts(rows,'').length,2);
});
test('maps a product photo using its stable ID and rejects unsafe URLs',()=>{
  const manifest={db1:{url:'https://cdn.example.com/item.jpg'}};
  assert.equal(Core.productImage({id:'db1'},manifest),'https://cdn.example.com/item.jpg');
  assert.equal(Core.productImage({id:'db2',imagem:'http://cdn.example.com/item.jpg'},manifest),'');
});
test('builds Functions routes and strips the unsupported image field',()=>{
  const plan=Core.requestPlan({mode:'functions',base:'https://technoworks.com.br'},'create','',{titulo:'Mouse',descricao:'Sem fio',preco:100,imagem:'https://cdn.example.com/mouse.jpg'});
  assert.equal(plan.url,'https://technoworks.com.br/api/items');
  assert.equal(plan.method,'POST');
  assert.deepEqual(JSON.parse(plan.body),{titulo:'Mouse',descricao:'Sem fio',preco:100});
});
test('builds REST requests with encoded RA and image URL',()=>{
  const plan=Core.requestPlan({mode:'rest',base:'https://technoworks.com.br',ra:'3023/100'},'create','',{titulo:'Mouse',descricao:'Sem fio',preco:100,imagem:'https://cdn.example.com/mouse.jpg'});
  assert.equal(plan.url,'https://technoworks.com.br/rest/3023%2F100');
  assert.equal(plan.method,'POST');
  assert.equal(JSON.parse(plan.body).imagem,'https://cdn.example.com/mouse.jpg');
});
test('builds Easy write requests with GET query parameters only',()=>{
  const plan=Core.requestPlan({mode:'easy',base:'https://technoworks.com.br',ra:'123'},'create','',{titulo:'Mouse Gamer',descricao:'Sem fio',preco:199.9});
  const url=new URL(plan.url);
  assert.equal(plan.method,'GET');
  assert.equal(plan.body,undefined);
  assert.equal(url.pathname,'/easy/post/123');
  assert.equal(url.searchParams.get('titulo'),'Mouse Gamer');
});
test('requires RA outside the Functions mode and HTTPS API origins',()=>{
  assert.throws(()=>Core.requestPlan({mode:'rest',base:'https://technoworks.com.br'},'list'),/RA/);
  assert.throws(()=>Core.requestPlan({mode:'functions',base:'http://api.example.com'},'list'),/HTTPS/);
});
