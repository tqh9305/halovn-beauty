const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }));
const yearLabel = document.querySelector('#year'); if (yearLabel) yearLabel.textContent = new Date().getFullYear();
const brands = document.querySelector('#brand-grid');
const brandFilter = document.querySelector('#brand-filter');
const search = document.querySelector('#search');
const grid = document.querySelector('#product-grid');
const dialog = document.querySelector('#product-dialog');
const more = document.querySelector('#load-more');
const PAGE_SIZE = 8;
let category = 'all', selectedBrand = 'all', visibleLimit = PAGE_SIZE;
let lastTrigger, currentItem;
function local(value) { return typeof value === 'object' ? (value[language] || value.vi || value.en || '') : (value || ''); }
function element(tag, className, text) { const el = document.createElement(tag); if (className) el.className = className; if (text !== undefined) el.textContent = text; return el; }
function productImage(item) { return item.gallery?.[language]?.[0]?.src || item.image; }
function productGallery(item) {
 const images = item.gallery?.[language];
 if (!images?.length) return imageBlock(item.image,local(item.name),'dialog-image',true);
 const gallery = element('div','product-gallery');
 gallery.setAttribute('role','region'); gallery.setAttribute('aria-label',(language==='vi'?"Bộ ảnh sản phẩm":"Product image gallery"));
 const stage = element('div','gallery-stage');
 const picture = element('a','gallery-picture'); picture.target='_blank'; picture.rel='noopener';
 const image = document.createElement('img'); image.decoding='async';
 const fallback=element('p','image-fallback',(language==='vi'?"Không tải được ảnh. Anh/chị vui lòng chọn ảnh khác.":"Unable to load this image. Please select another image."));fallback.hidden=true;
 image.addEventListener('error',()=>{image.hidden=true;fallback.hidden=false;});
 image.addEventListener('load',()=>{image.hidden=false;fallback.hidden=true;});
 picture.append(image,fallback);
 const previous=element('button','gallery-arrow gallery-previous','‹');previous.type='button';previous.setAttribute('aria-label',(language==='vi'?"Ảnh trước":"Previous image"));
 const next=element('button','gallery-arrow gallery-next','›');next.type='button';next.setAttribute('aria-label',(language==='vi'?"Ảnh tiếp theo":"Next image"));
 stage.append(picture,previous,next);
 const caption=element('div','gallery-caption');
 const label=element('span','gallery-label');label.setAttribute('aria-live','polite');
 caption.append(label,element('span','gallery-hint',(language==='vi'?"Bấm ảnh để xem kích thước lớn":"Click the image to view full size")));
 const thumbs=element('div','gallery-thumbnails');thumbs.setAttribute('aria-label',(language==='vi'?"Chọn ảnh sản phẩm":"Choose a product image"));
 let selected=0;
 const buttons=images.map((entry,index)=>{
  const button=element('button','gallery-thumbnail');button.type='button';button.setAttribute('aria-label',entry.label+' — '+local(item.name));
  const preview=document.createElement('img');preview.src=entry.src;preview.alt='';preview.loading='lazy';preview.decoding='async';
  button.append(preview,element('span','',entry.label));button.addEventListener('click',()=>select(index));thumbs.append(button);return button;
 });
 function select(index) {
  selected=(index+images.length)%images.length;const entry=images[selected];
  image.hidden=false;fallback.hidden=true;image.src=entry.src;image.alt=local(item.name)+' — '+entry.label;
  picture.href=entry.src;picture.setAttribute('aria-label',(language==='vi'?"Mở ảnh lớn: ":"Open full-size image: ")+entry.label);
  label.textContent=entry.label+' · '+(selected+1)+' / '+images.length;
  buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===selected)));
 }
 previous.addEventListener('click',()=>select(selected-1));next.addEventListener('click',()=>select(selected+1));
 thumbs.addEventListener('keydown',event=>{
  if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
  event.preventDefault();select(selected+(event.key==='ArrowRight'?1:-1));buttons[selected].focus();
 });
 gallery.append(stage,caption,thumbs);select(0);return gallery;
}
function imageBlock(path, alt, className, eager = false) {
 const box = element('div', className);
 const fallback = element('span','image-fallback',t('Image being updated'));
 if (!path) { box.append(fallback); return box; }
 const img = document.createElement('img'); img.src = path; img.alt = alt; img.loading = eager ? 'eager' : 'lazy'; img.decoding = 'async';
 img.addEventListener('error', () => { img.remove(); box.append(fallback); }, {once:true});
 box.append(img); return box;
}
function renderBrands() {
 brands.replaceChildren();
 brandFilter.replaceChildren();
 const all = element('option','',t('All brands')); all.value = 'all'; brandFilter.append(all);
 window.haloData.brands.forEach(brand => {
  const option = element('option','',brand.name); option.value = brand.id; brandFilter.append(option);
  const card = element('button','brand brand-card'); card.type = 'button';
  const top = element('div','brand-card-top');
  if(brand.logo) top.append(imageBlock(brand.logo,brand.name,'brand-logo'));
  else top.append(element('strong','brand-wordmark',brand.name));
  card.append(top);
  const hint=element('span','brand-hover-hint',language==='vi'?'Xem chi tiết':'View details');
  hint.setAttribute('aria-hidden','true');card.append(hint);
  card.setAttribute('aria-label',(language==='vi'?'Xem sản phẩm của ':'View products from ')+brand.name);
  card.addEventListener('click', () => {
   selectedBrand=brand.id;category='all';visibleLimit=PAGE_SIZE;search.value='';brandFilter.value=selectedBrand;
   document.querySelectorAll('[data-category]').forEach(button=>{
    const active=button.dataset.category==='all';button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));
   });
   renderProducts();document.querySelector('#products').scrollIntoView({behavior:'smooth'});
  });brands.append(card);
 });
 brandFilter.value = selectedBrand;

}
function normalize(value) { return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase(); }
function renderProducts() {
 const query = normalize(search.value.trim());
 const filtered = window.haloData.products.filter(p => (category === 'all' || p.category === category) && (selectedBrand === 'all' || p.brandId === selectedBrand) && normalize([p.name.vi,p.name.en,p.brand,p.type,p.category,t(p.category),p.size].join(' ')).includes(query));
 grid.replaceChildren();
 const shown = Math.min(visibleLimit,filtered.length);
 document.querySelector('#result-count').textContent = language === 'vi' ? 'Hiển thị ' + shown + ' / ' + filtered.length + ' sản phẩm' : 'Showing ' + shown + ' of ' + filtered.length + ' products';
 filtered.slice(0,visibleLimit).forEach(p => {
  const card = element('button','product-card'); card.type = 'button';
  const art = imageBlock(productImage(p),local(p.name),'product-art real-product'+(p.gallery?.[language]?.length?' supplied-thumbnail':''));
  art.append(element('span','product-arrow','↗'));
  card.append(art,element('span','product-category',p.brand + ' / ' + t(p.category)),element('h3','',local(p.name)));
  // Internal import IDs are not manufacturer SKU codes.
  const measure = (p.size.match(/\d+(?:[.,]\d+)?\s*(?:ml|g|kg|l)\b/i) || [''])[0];
  card.append(element('span','product-detail',measure || t(p.category)));
  card.addEventListener('click',()=>openDetails('product',p,card)); grid.append(card);
 });
 if (!filtered.length) grid.append(element('p','empty-state',t('No products match your search. Try another brand, category or search term.')));
 more.hidden = visibleLimit >= filtered.length;
}
function sourceDetails(text) {
 const container = element('div','source-details');
 const sections = text.split(/(?=^\s*\d+\.[ \t]+[A-ZÀ-Ỹ][A-ZÀ-Ỹ0-9 /&(),:+–-]*[ \t]*$)/m).filter(s=>s.trim());
 sections.forEach(section => {
  const trimmed = section.trim();
  const firstBreak = trimmed.indexOf('\n');
  if (/^\d+\./.test(trimmed) && firstBreak >= 0) { const part=element('section','detail-section'); part.append(element('h3','',trimmed.slice(0,firstBreak)),element('p','',trimmed.slice(firstBreak+1).trim())); container.append(part); }
  else container.append(element('p','',trimmed));
 });
 return container;
}
function openDetails(kind,item,trigger) { currentItem={kind,item}; lastTrigger=trigger; updateDialog(); dialog.showModal(); }
function updateDialog() {
 if (!currentItem) return;
 const {kind,item} = currentItem;
 document.querySelector('#dialog-eyebrow').textContent = t(kind === 'brand' ? 'BRAND PROFILE' : 'PRODUCT DETAILS');
 document.querySelector('#dialog-title').textContent = kind === 'brand' ? item.name : local(item.name);
 document.querySelector('#dialog-category').textContent = kind === 'brand' ? '' : item.brand + ' · ' + t(item.category);
 const media=document.querySelector('#dialog-media'); media.replaceChildren(kind==='product'?productGallery(item):imageBlock(item.logo,item.name,'dialog-image',true));
 const description=document.querySelector('#dialog-description'); description.replaceChildren();
 if(language === 'vi') description.append(sourceDetails(item.description.vi));
 else {
  description.append(sourceDetails(item.description.en));

  const original=element('details','original-copy'); original.lang='vi'; const summary=element('summary','',t('Vietnamese source details')); original.append(summary,sourceDetails(item.description.vi)); description.append(original);
 }
 if(kind==='brand') {
  const count=window.haloData.products.filter(p=>p.brandId===item.id).length;
  description.prepend(element('p','brand-product-total',count+(language==='vi'?' sản phẩm trong danh mục':' products in the collection')));
 }
 document.querySelector('.dialog-done').textContent = t(kind==='brand'?'View brand products →':'Continue exploring →');
}
document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{
 category=button.dataset.category;visibleLimit=PAGE_SIZE;
 document.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});renderProducts();
}));
brandFilter.addEventListener('change',()=>{selectedBrand=brandFilter.value;visibleLimit=PAGE_SIZE;renderProducts();});
search.addEventListener('input',()=>{visibleLimit=PAGE_SIZE;renderProducts();});
document.querySelector('#clear-filters').addEventListener('click',()=>{category='all';selectedBrand='all';search.value='';brandFilter.value='all';visibleLimit=PAGE_SIZE;document.querySelectorAll('[data-category]').forEach(b=>{const selected=b.dataset.category==='all';b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});renderProducts();});
more.addEventListener('click',()=>{const count=grid.children.length;visibleLimit+=PAGE_SIZE;renderProducts();grid.children[count]?.focus({preventScroll:true});});
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
document.querySelector('.dialog-done').addEventListener('click',()=>{
 if(currentItem?.kind==='brand') { selectedBrand=currentItem.item.id;category='all';visibleLimit=PAGE_SIZE;search.value='';brandFilter.value=selectedBrand;document.querySelectorAll('[data-category]').forEach(b=>{const active=b.dataset.category==='all';b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});renderProducts();dialog.close();document.querySelector('#products').scrollIntoView({behavior:'smooth'}); }
 else dialog.close();
});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>lastTrigger?.focus({preventScroll:true}));
applyLanguage();
