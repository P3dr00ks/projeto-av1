(() => {
  'use strict';
  const Core = window.VitrineCore;
  const STORE_KEY = 'vitrine.products.v2';
  const API_KEY = 'vitrine.api.v2';
  const colors = ['#e7eee5','#f3e9db','#e8e9f1','#f3e5e1','#e3eceb','#f0eadf'];
  const starter = [
    {id:'k7c4DjYL3MxM5Q9U2ZB1',titulo:'Monitor 24 Polegadas',descricao:'Full HD IPS 75Hz HDMI',preco:749.00},
    {id:'FPfmb1afhwfNMUw1wkBn',titulo:'Headset Gamer',descricao:'Som estéreo com microfone ajustável',preco:179.90},
    {id:'qpENYZ1gA4o9eM0XPYVc',titulo:'Teclado Mecânico',descricao:'Switch red ABNT2 retroiluminado',preco:249.90},
    {id:'SEzB0TO80jBsIthcurIG',titulo:'Mouse Gamer',descricao:'Sem fio 2.4GHz',preco:199.90},
    {id:'UZceyxXLYLLl9gUJPf77',titulo:'Controle DualSense Midnight Black',descricao:'PlayStation 5 - Sem fio, lacrado na caixa.',preco:449.90},
    {id:'VJvU4C9X1OL314xrlK20',titulo:'Funko Pop! Master Chief',descricao:'Boneco colecionável de vinil do Master Chief, série Halo. Aproximadamente 10 cm.',preco:149.90},
    {id:'cG7yYhfgqlj96hj3zrQq',titulo:'Nintendo Switch OLED Branco',descricao:'Console híbrido com tela OLED de 7 polegadas, 64GB e Joy-Con brancos.',preco:2299},
    {id:'1J9mwGtV1gtchEomueoF',titulo:'Console Xbox Series X 1TB',descricao:'Console Xbox Series X com SSD de 1TB, 4K a 120 fps e controle sem fio incluso.',preco:4199},
    {id:'7UhGKyr0p31DQQL1olCK',titulo:'Console PlayStation 5 Slim 1TB',descricao:'Console PS5 Slim com leitor de disco, SSD de 1TB e controle DualSense incluso.',preco:3799},
    {id:'mNAKP5xwC0tewVG9qieG',titulo:'The Legend of Zelda: Tears of the Kingdom',descricao:'Aventura em mundo aberto pelas ilhas do céu de Hyrule. Mídia física, lacrado.',preco:349.90}
  ];
  const $ = id => document.getElementById(id);
  const cloneStarter = () => starter.map(item => ({...item}));
  const readJson = (key, fallback) => { try { const value=JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } };
  let products = readJson(STORE_KEY, cloneStarter());
  let config = readJson(API_KEY, window.VITRINE_CONFIG);
  let connected = false;
  let busy = false;
  const productDialog = $('product-dialog');
  const settingsDialog = $('settings-dialog');

  function imageFor(product){ return Core.productImage(product, window.VITRINE_IMAGES); }
  const themeButton=$('theme-toggle');
  const moonIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.3 15.2A8.5 8.5 0 0 1 8.8 3.7 8.6 8.6 0 1 0 20.3 15.2Z"/></svg>';
  const sunIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>';
  function applyTheme(theme,save=true){
    const dark=theme==='dark';document.documentElement.dataset.theme=dark?'dark':'light';
    themeButton.innerHTML=dark?sunIcon:moonIcon;
    themeButton.setAttribute('aria-label',dark?'Ativar modo claro':'Ativar modo noturno');
    themeButton.title=dark?'Ativar modo claro':'Ativar modo noturno';
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=dark?'#171b18':'#f5f6f2';
    if(save){try{localStorage.setItem('vitrine.theme',dark?'dark':'light')}catch{}}
  }
  applyTheme(document.documentElement.dataset.theme||'light',false);
  themeButton.addEventListener('click',()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));

  function render(){
    const visible=Core.filterProducts(products,$('search').value);
    $('result-count').textContent=`${visible.length} ${visible.length===1?'produto':'produtos'}`;
    $('collection-label').textContent=config?.mode==='functions'?'Functions':config?.mode==='rest'?'REST':config?.mode==='easy'?'Easy · GET':'demonstração';
    $('product-grid').innerHTML=visible.map((p,i)=>{
      const src=imageFor(p);
      return `<article class="card"><div class="card-art" style="background:${colors[i%colors.length]}"><span class="card-id">ID · ${Core.escapeHtml(p.id)}</span>${src?`<img class="product-image" src="${Core.escapeHtml(src)}" alt="${Core.escapeHtml(p.titulo)}" loading="lazy">`:''}</div><div class="card-body"><h3>${Core.escapeHtml(p.titulo)}</h3><p>${Core.escapeHtml(p.descricao)}</p><div class="card-bottom"><span class="price">${Core.formatPrice(p.preco)}</span><div class="card-actions"><button type="button" class="small-action" data-edit="${Core.escapeHtml(p.id)}">Editar</button><button type="button" class="small-action" data-delete="${Core.escapeHtml(p.id)}">Excluir</button></div></div></div></article>`;
    }).join('');
    $('empty-state').hidden=visible.length>0;$('product-grid').hidden=visible.length===0;
    $('add-open').disabled=busy;$('empty-add').disabled=busy;
  }
  function notify(message){const toast=$('toast');toast.textContent=message;toast.classList.add('show');window.setTimeout(()=>toast.classList.remove('show'),3600)}
  function setConnection(state,label){
    connected=state;const pill=$('connection-label');
    pill.textContent=label;pill.parentElement.classList.toggle('connected',state);
    $('footer-mode').textContent=state?`Dados compartilhados · API Technoworks REST · RA ${config.ra}`:label;
  }
  function persist(){try{localStorage.setItem(STORE_KEY,JSON.stringify(products))}catch{}}
  async function apiRequest(kind,id='',product={}){
    const plan=Core.requestPlan(config,kind,id,product);
    const controller=new AbortController();const timer=window.setTimeout(()=>controller.abort(),12000);
    try{
      const headers={Accept:'application/json'};
      if(plan.body!==undefined)headers['Content-Type']='application/json';
      if(config.token)headers.Authorization=config.token.startsWith('Bearer ')?config.token:`Bearer ${config.token}`;
      const response=await fetch(plan.url,{method:plan.method,headers,body:plan.body,signal:controller.signal});
      if(!response.ok){let detail='';try{detail=(await response.text()).slice(0,180)}catch{}throw new Error(`API respondeu HTTP ${response.status}${detail?`: ${detail}`:''}`)}
      if(response.status===204)return null;
      const text=await response.text();return text?JSON.parse(text):null;
    }catch(error){if(error.name==='AbortError')throw new Error('A API demorou mais de 12 segundos para responder.');if(error instanceof SyntaxError)throw new Error('A API retornou uma resposta que não é JSON válido.');throw error}
    finally{window.clearTimeout(timer)}
  }
  async function loadFromApi({quiet=false}={}){
    try{
      const payload=await apiRequest('list');products=Core.unwrapProducts(payload);persist();setConnection(true,`API ${config.mode.toUpperCase()} conectada`);render();return true;
    }catch(error){
      setConnection(false,`API indisponível · ${error.message}`);
      if(!quiet)notify(`Não foi possível carregar o catálogo compartilhado: ${error.message}`);
      render();return false;
    }
  }
  function openNew(){
    $('product-form').reset();$('product-id').value='';$('form-title').textContent='Adicionar produto';$('form-eyebrow').textContent='NOVO ITEM';$('form-error').textContent='';productDialog.showModal();
  }
  function openEdit(id){
    const p=products.find(item=>item.id===id);if(!p)return;
    $('product-id').value=p.id;$('title').value=p.titulo;$('description').value=p.descricao;$('price').value=p.preco;$('image-url').value=p.imagem||imageFor(p);
    $('form-title').textContent='Editar produto';$('form-eyebrow').textContent=`ID · ${p.id}`;$('form-error').textContent='';productDialog.showModal();
  }
  async function saveProduct(event){
    event.preventDefault();
    const id=$('product-id').value;
    const current={titulo:$('title').value.trim(),descricao:$('description').value.trim(),preco:Number($('price').value),imagem:$('image-url').value.trim()};
    const error=Core.validateProduct(current);if(error){$('form-error').textContent=error;return}
    busy=true;$('save-product').disabled=true;$('save-product').textContent='Salvando…';
    try{
      if(config.mode==='local'){
        if(id)products=products.map(p=>p.id===id?{...current,id}:p);else products.unshift({...current,id:`LOCAL-${Date.now()}`});
        persist();render();notify('Produto salvo neste navegador.');
      }else{
        await apiRequest(id?'update':'create',id,current);
        const ok=await loadFromApi({quiet:true});if(!ok)throw new Error('A gravação foi enviada, mas não consegui atualizar a lista. Recarregue a página.');
        notify(config.mode==='functions'&&current.imagem?'Produto salvo. A API Functions não armazena imagem; use REST para persistir a foto.':'Produto salvo na coleção compartilhada.');
      }
      productDialog.close();
    }catch(error){$('form-error').textContent=`Falha ao salvar: ${error.message}`}
    finally{busy=false;$('save-product').disabled=false;$('save-product').textContent='Salvar produto';render()}
  }
  async function deleteProduct(id){
    const item=products.find(p=>p.id===id);if(!item||!window.confirm(`Excluir “${item.titulo}” (ID ${id})?`))return;
    try{
      if(config.mode==='local'){products=products.filter(p=>p.id!==id);persist();render()}
      else{await apiRequest('delete',id);if(!await loadFromApi({quiet:true}))throw new Error('Exclusão enviada, mas a lista não pôde ser atualizada.')}
      notify('Produto excluído.');
    }catch(error){notify(`Falha ao excluir: ${error.message}`)}
  }
  function openSettings(){
    $('api-mode').value=config.mode||'rest';$('api-base').value=config.base||'';$('api-ra').value=config.ra||'';
    $('api-collection').value=config.collection||'';$('api-create').value=config.create||'';$('api-update').value=config.update||'';$('api-delete').value=config.delete||'';
    $('api-token').value=config.token||'';updateModeHelp();settingsDialog.showModal();
  }
  function updateModeHelp(){
    const mode=$('api-mode').value;
    $('mode-help').textContent=mode==='functions'?'Functions usa /api/items e aceita titulo, descricao e preco. Imagens não são persistidas nesse recurso.':mode==='rest'?'REST salva os campos livres no banco NoSQL, incluindo a URL HTTPS da imagem. O ID é gerado pela API e usado em alterações e exclusões.':'Easy aceita somente GET, inclusive para operações de gravação. A API precisa suportar os campos enviados pela query string.';
  }
  $('search').addEventListener('input',render);
  $('add-open').addEventListener('click',openNew);$('empty-add').addEventListener('click',openNew);
  $('settings-open').addEventListener('click',openSettings);$('product-form').addEventListener('submit',saveProduct);
  $('product-grid').addEventListener('click',event=>{const edit=event.target.closest('[data-edit]');const del=event.target.closest('[data-delete]');if(edit)openEdit(edit.dataset.edit);if(del)deleteProduct(del.dataset.delete)});
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>$(button.dataset.close).close()));
  $('api-mode').addEventListener('change',updateModeHelp);
  $('settings-form').addEventListener('submit',async event=>{
    event.preventDefault();const mode=$('api-mode').value,base=$('api-base').value.trim(),ra=$('api-ra').value.trim();
    if(!base){notify('Informe a URL base da API.');return}
    if(mode!=='functions'&&mode!=='local'&&!ra){notify('Informe o RA para usar REST ou Easy.');return}
    const next={mode,base,ra,collection:$('api-collection').value.trim(),create:$('api-create').value.trim(),update:$('api-update').value.trim(),delete:$('api-delete').value.trim(),token:$('api-token').value.trim()};
    try{Core.requestPlan(next,'list');config=next;localStorage.setItem(API_KEY,JSON.stringify(config));settingsDialog.close();await loadFromApi()}
    catch(error){notify(error.message)}
  });
  $('local-mode').addEventListener('click',()=>{
    config={mode:'local'};try{localStorage.setItem(API_KEY,JSON.stringify(config))}catch{}
    products=readJson(STORE_KEY,cloneStarter());setConnection(false,'Demonstração local · dados só neste navegador');render();settingsDialog.close();
  });
  render();setConnection(false,'Conectando à coleção compartilhada…');loadFromApi({quiet:true});
})();