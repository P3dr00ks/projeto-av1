(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.VitrineCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
  function idFor(item){
    const value=item?.id??item?._id??item?.ID;
    if(value===undefined||value===null||String(value).trim()==='')throw new Error('Cada produto precisa ter um ID.');
    return String(value);
  }
  function normalize(item){
    if(!item||typeof item!=='object'||Array.isArray(item))throw new Error('Registro de produto inválido.');
    const id=idFor(item);
    const titulo=String(item.titulo??item.title??'').trim();
    const descricao=String(item.descricao??item.description??'').trim();
    const preco=Number(item.preco??item.price);
    if(!titulo||!Number.isFinite(preco))throw new Error(`Produto ${id} possui título ou preço inválido.`);
    const imagem=item.imagem??item.image??item.imageUrl??'';
    return {id,titulo,descricao,preco,imagem:typeof imagem==='string'?imagem.trim():''};
  }
  function unwrapProducts(payload){
    const rows=Array.isArray(payload)?payload:payload?.dados??payload?.data??payload?.items??payload?.results;
    if(!Array.isArray(rows))throw new Error('A API não retornou uma lista de produtos.');
    return rows.map(normalize);
  }
  function validateProduct(product){
    const titulo=String(product?.titulo??'').trim();
    const descricao=String(product?.descricao??'').trim();
    const preco=Number(product?.preco);
    const imagem=String(product?.imagem??'').trim();
    if(titulo.length<2||titulo.length>90)return 'O título deve ter entre 2 e 90 caracteres.';
    if(descricao.length<3||descricao.length>400)return 'A descrição deve ter entre 3 e 400 caracteres.';
    if(!Number.isFinite(preco)||preco<=0)return 'Informe um preço maior que zero.';
    if(imagem&&!isSafeImageUrl(imagem))return 'A imagem precisa usar um endereço HTTPS válido.';
    return null;
  }
  function normalizeText(value){return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR')}
  function filterProducts(products,query=''){
    const needle=normalizeText(query.trim());
    if(!needle)return [...products];
    return products.filter(product=>normalizeText(`${product.titulo} ${product.descricao} ${product.id}`).includes(needle));
  }
  function isSafeImageUrl(value){
    try{return new URL(String(value)).protocol==='https:'}catch{return false}
  }
  function productImage(product,manifest={}){
    if(product?.imagem&&isSafeImageUrl(product.imagem))return product.imagem;
    const entry=manifest[String(product?.id??'')];
    const url=typeof entry==='string'?entry:entry?.url;
    return isSafeImageUrl(url)?url:'';
  }
  function routePath(config,kind,id=''){
    const mode=config?.mode||'functions';
    const ra=String(config?.ra||'');
    if(mode!=='functions'&&!ra)throw new Error('Informe o RA para usar REST ou Easy.');
    const defaults={
      functions:{list:'/api/items',create:'/api/items',update:'/api/items/{id}',delete:'/api/items/{id}'},
      rest:{list:'/rest/{ra}',create:'/rest/{ra}',update:'/rest/{ra}/{id}',delete:'/rest/{ra}/{id}'},
      easy:{list:'/easy/get/{ra}',create:'/easy/post/{ra}',update:'/easy/put/{ra}/{id}',delete:'/easy/delete/{ra}/{id}'}
    };
    const table=defaults[mode];
    if(!table||!own(table,kind))throw new Error('Modo ou operação da API inválida.');
    const standard=['/api/items','/rest/{ra}','/easy/get/{ra}'];
    const collection=config?.collection&&!standard.includes(config.collection)?config.collection:table.list;
    const path=kind==='list'?collection:(config?.[kind]||table[kind]);
    return path.replaceAll('{ra}',encodeURIComponent(ra)).replaceAll('{id}',encodeURIComponent(String(id)));
  }
  function requestPlan(config,kind,id='',product={}){
    const base=String(config?.base||'').trim();
    let parsed;
    try{parsed=new URL(base)}catch{throw new Error('URL base da API inválida.')}
    if(parsed.protocol!=='https:'&&parsed.hostname!=='localhost'&&parsed.hostname!=='127.0.0.1')throw new Error('A API precisa usar HTTPS.');
    const url=new URL(routePath(config,kind,id),base);
    const mode=config?.mode||'functions';
    const data={titulo:String(product.titulo??'').trim(),descricao:String(product.descricao??'').trim(),preco:Number(product.preco)};
    if(mode==='rest'&&product.imagem)data.imagem=String(product.imagem).trim();
    if(mode==='easy'&&kind!=='list'){
      for(const [key,value] of Object.entries(data))if(value!==''&&!Number.isNaN(value))url.searchParams.set(key,String(value));
      return {url:url.toString(),method:'GET',body:undefined};
    }
    if(kind==='list'||kind==='delete')return {url:url.toString(),method:kind==='list'?'GET':'DELETE',body:undefined};
    return {url:url.toString(),method:kind==='create'?'POST':mode==='rest'?'PATCH':'PUT',body:JSON.stringify(data)};
  }
  function formatPrice(value){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(value)||0)}
  function escapeHtml(value=''){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
  return {idFor,normalize,unwrapProducts,validateProduct,filterProducts,isSafeImageUrl,productImage,routePath,requestPlan,formatPrice,escapeHtml};
});