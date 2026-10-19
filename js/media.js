(() => {
 const base = document.body.dataset.base || '';
 const data = window.haloMedia;
 const copy = {
  aboutLabel:['01 / VỀ HALOVN','01 / OUR COMPANY'], aboutTitle:['Kinh doanh bằng kết nối. Phát triển cùng tri thức.','Connected through business. Growing through knowledge.'],
  aboutLink:['Tìm hiểu HaloVN →','Get to know HaloVN →'],video:['Xem video giới thiệu','Watch our introduction'],
  newsLabel:['TIN TỨC & HOẠT ĐỘNG','NEWS & ACTIVITIES'],newsTitle:['Những kết nối tạo nên hành trình.','Connections that shape our journey.'],newsIntro:['Gặp gỡ, học hỏi và chia sẻ kinh nghiệm cùng cộng đồng kinh doanh.','Meeting, learning and sharing experience within the business community.'],allNews:['Xem tất cả hoạt động →','Explore all activities →'],
  all:['Tất cả','All activities'],network:['Kết nối kinh doanh','Business connections'],learning:['Học tập & Phát triển','Learning & development'],ecommerce:['Thương mại điện tử','E-commerce'],read:['Đọc câu chuyện →','Read the story →'],
  gallery:['Những khoảnh khắc tại chương trình','Moments from the programme'],related:['Tiếp tục khám phá','More stories to explore'],back:['← Tất cả hoạt động','← All activities'],home:['Trang chủ','Home'],
  aboutPage:['Về HaloVN','About HaloVN'],aboutLead:['Sức khỏe, chăm sóc cá nhân và sắc đẹp trong hành trình kinh doanh số.','Health, personal care and beauty in a digital business journey.'],
  profile:['Doanh nghiệp & lĩnh vực hoạt động','Our company & business'],culture:['Con người & tinh thần học hỏi','People & continuous learning'],operations:['Môi trường làm việc & vận hành','Workplace & operations'],
  videoLabel:['HALOVN / PHIM GIỚI THIỆU','HALOVN / COMPANY FILM'],videoTitle:['Một góc nhìn về HaloVN.','An introduction to HaloVN.'],videoIntro:['Khám phá doanh nghiệp qua video trong tài liệu giới thiệu. Video phát khi bạn bấm nút, có điều khiển âm thanh và toàn màn hình.','Discover the company through the film supplied with our introduction materials. Playback starts on request, with audio and fullscreen controls.'],
  close:['Đóng','Close'],previous:['Ảnh trước','Previous image'],next:['Ảnh tiếp theo','Next image'],viewImage:['Xem ảnh','View image'],
  missing:['Không tìm thấy bài viết.','This story could not be found.'],contact:['Trao đổi cơ hội hợp tác →','Discuss opportunities →'],pageTitle:['Hoạt động & Kết nối | HaloVN','Activities & Connections | HaloVN'],
  pageDescription:['Khám phá các hoạt động kết nối, học tập và thương mại điện tử của HaloVN qua những câu chuyện và hình ảnh thực tế.','Explore HaloVN’s business connections, learning and e-commerce activities through stories and photographs.'],
  cultureNote:['Học hỏi không ngừng. Kết nối để cùng phát triển.','Keep learning. Connect and grow together.'],storyCount:['câu chuyện','stories']
 };
 const tr = key => copy[key] ? copy[key][language === 'vi' ? 0 : 1] : key;
 const loc = value => value?.[language] || value?.vi || '';
 const el = (tag,cls,text) => {const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 const link=(href,cls,text)=>{const a=el('a',cls,text);a.href=base+href;return a;};
 function img(path,alt,cls,eager=false) {const n=el('img',cls);n.src=base+path;n.alt=alt;n.loading=eager?'eager':'lazy';n.decoding='async';return n;}
 let filter='all', activeImages=[], activeIndex=0, focusBefore;
 const lightbox=document.querySelector('#media-lightbox');
 const videoDialog=document.querySelector('#company-video-dialog');
 function dateText(a) {return a.date ? new Intl.DateTimeFormat(language==='vi'?'vi-VN':'en-US',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(a.date+'T12:00:00Z')) : '';}
 function metadata(a) {return [tr(a.category),dateText(a),loc(a.location)].filter(Boolean).join(' · ');}
 function card(a,featured=false) {
  const n=el('article',featured?'news-card news-featured':'news-card');
  const visual=link('activities/'+a.id+'.html','news-image-link');visual.append(img(a.images[0].src,loc(a.images[0].caption),'news-image'));n.append(visual);
  const body=el('div','news-card-body');body.append(el('p','news-category',tr(a.category)));
  if(a.date)body.append(el('time','news-date',dateText(a)));body.querySelector('time')?.setAttribute('datetime',a.date);
  const h=el('h3');h.append(link('activities/'+a.id+'.html','',loc(a.title)));body.append(h,el('p','news-excerpt',loc(a.excerpt)),link('activities/'+a.id+'.html','text-link',tr('read')));n.append(body);return n;
 }
 function showImage() {
  const p=activeImages[activeIndex];document.querySelector('#lightbox-image').src=base+p.src;document.querySelector('#lightbox-image').alt=loc(p.caption);
  document.querySelector('#lightbox-caption').textContent=loc(p.caption);
  document.querySelector('#lightbox-counter').textContent=(activeIndex+1)+' / '+activeImages.length;
  document.querySelectorAll('[data-gallery-step]').forEach(b=>{b.hidden=activeImages.length<2;b.setAttribute('aria-label',tr(Number(b.dataset.galleryStep)<0?'previous':'next'));});
 }
 function openImage(images,index,trigger) {activeImages=images;activeIndex=index;focusBefore=trigger;showImage();lightbox.showModal();}
 function figure(p,images,index,cls='') {const f=el('figure',cls);const b=el('button','photo-button');b.type='button';b.setAttribute('aria-label',tr('viewImage')+': '+loc(p.caption));b.append(img(p.src,loc(p.caption)));b.addEventListener('click',()=>openImage(images,index,b));f.append(b,el('figcaption','',loc(p.caption)));return f;}
 function renderAbout() {
  document.querySelectorAll('[data-copy]').forEach(n=>{n.textContent=tr(n.dataset.copy);});
  document.querySelectorAll('[data-company-intro]').forEach(n=>{n.textContent=loc(data.company.intro);});
  document.querySelectorAll('[data-company-caption]').forEach(n=>{n.textContent=loc(data.company.photo.caption);});
  const companyBody=document.querySelector('#company-body');
  if(companyBody) {companyBody.replaceChildren();['profile','culture','operations'].forEach((key,i)=>{const part=el('section','company-body-part');part.append(el('h2','',tr(key)),el('p','',loc(data.company.body[i])));companyBody.append(part);});}
  const values=document.querySelector('#company-values');if(values){values.replaceChildren();data.company.values.forEach((v,i)=>{const n=el('article');n.append(el('span','value-index','0'+(i+1)),el('h3','',loc(v.title)),el('p','',loc(v.text)));values.append(n);});}
 }
 function renderStories() {
  const featured=document.querySelector('#home-stories');if(featured){featured.replaceChildren();[data.articles[0],data.articles[2],data.articles[1]].forEach((a,i)=>featured.append(card(a,i===0)));}
  const listing=document.querySelector('#all-stories');if(listing){listing.replaceChildren();data.articles.filter(a=>filter==='all'||a.category===filter).forEach(a=>listing.append(card(a)));}
  document.querySelectorAll('[data-news-filter]').forEach(b=>{b.textContent=tr(b.dataset.newsFilter);const selected=filter===b.dataset.newsFilter;b.setAttribute('aria-pressed',String(selected));b.classList.toggle('selected',selected);});
 }
 function renderArticle() {
  const root=document.querySelector('#article-content');if(!root)return;
  const a=data.articles.find(a=>a.id===document.body.dataset.article);root.replaceChildren();
  if(!a){root.append(el('h1','',tr('missing')),link('activities.html','text-link',tr('back')));return;}
  document.title=loc(a.title)+' | HaloVN';document.querySelector('meta[name="description"]').content=loc(a.excerpt);
  const intro=el('div','article-intro wrap');intro.append(link('activities.html','article-back',tr('back')),el('p','eyebrow',tr(a.category)),el('h1','',loc(a.title)),el('p','article-meta',metadata(a)));root.append(intro);
  root.append(figure(a.images[0],a.images,0,'article-cover wrap'));
  const content=el('div','article-body');content.append(el('p','article-lead',loc(a.lead)));
  a.sections.forEach((section,i)=>{const block=el('section');block.append(el('h2','',loc(section.title)),el('p','',loc(section.text)));content.append(block);if(i===0&&a.images[1])content.append(figure(a.images[1],a.images,1,'article-inline-image'));});
  content.append(el('blockquote','',loc(a.quote)));root.append(content);
  const gallery=el('section','article-gallery wrap');gallery.append(el('p','eyebrow',tr('gallery')));const galleryGrid=el('div','gallery-grid');a.images.forEach((p,i)=>galleryGrid.append(figure(p,a.images,i)));gallery.append(galleryGrid);root.append(gallery);
  const related=el('section','related-stories wrap section');related.append(el('h2','',tr('related')));const relatedGrid=el('div','news-grid');data.articles.filter(other=>other.id!==a.id).slice(0,2).forEach(other=>relatedGrid.append(card(other)));related.append(relatedGrid);root.append(related);
 }
 function render() {
  renderAbout();renderStories();renderArticle();
  if(document.body.dataset.page==='about'){document.title=tr('aboutPage')+' | HaloVN';document.querySelector('meta[name="description"]').content=loc(data.company.intro);}
  if(document.body.dataset.page==='activities'){document.title=tr('pageTitle');document.querySelector('meta[name="description"]').content=tr('pageDescription');}
  document.querySelectorAll('[data-media-close]').forEach(b=>{b.textContent='×';b.setAttribute('aria-label',tr('close'));});
  if(lightbox?.open)showImage();
 }
 document.querySelectorAll('[data-news-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.newsFilter;renderStories();}));
 document.querySelectorAll('[data-open-video]').forEach(b=>b.addEventListener('click',()=>{focusBefore=b;const video=document.querySelector('#company-video');video.src=base+data.company.video;videoDialog.showModal();}));
 document.querySelectorAll('[data-media-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
 [lightbox,videoDialog].filter(Boolean).forEach(d=>{d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});d.addEventListener('close',()=>{if(d===videoDialog){const v=document.querySelector('#company-video');v.pause();v.removeAttribute('src');v.load();}focusBefore?.focus({preventScroll:true});});});
 document.querySelectorAll('[data-gallery-step]').forEach(b=>b.addEventListener('click',()=>{activeIndex=(activeIndex+Number(b.dataset.galleryStep)+activeImages.length)%activeImages.length;showImage();}));
 lightbox?.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();activeIndex=(activeIndex+(e.key==='ArrowLeft'?-1:1)+activeImages.length)%activeImages.length;showImage();}});
 if(document.body.dataset.page!=='home'){
  const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#navigation');
  menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
  const year=document.querySelector('#year');if(year)year.textContent=new Date().getFullYear();
 }
 window.addEventListener('halovn:languagechange',render);
 applyLanguage();
})();
