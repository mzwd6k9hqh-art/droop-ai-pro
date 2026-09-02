import { StoreConfig } from '@/components/StorePreview';
import { getStoreName } from './storeName';

const escapeHtml = (s: string = '') =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const isImg = (v?: string) => !!v && (v.startsWith('http') || v.startsWith('data:image') || v.startsWith('/'));

export function generateStoreHTML(config: StoreConfig): string {
  const storeName = escapeHtml(config.storeName || getStoreName());
  const description = escapeHtml(config.description || 'متجر إلكتروني عصري');
  const heroText = escapeHtml(config.heroText || `مرحباً بكم في ${storeName}`);
  const heroSubtext = escapeHtml(config.heroSubtext || description);
  const heroBtn = escapeHtml(config.heroButtonText || 'تسوق الآن');
  const currency = escapeHtml(config.currency || '$');
  const products = config.products || [];
  const testimonials = config.testimonials || [];
  const faq = config.faq || [];
  const announcement = config.announcement;
  const social = config.socialLinks || {};

  const gradient = 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%)';

  const productCards = products.map(p => {
    const img = isImg(p.image)
      ? `<img src="${escapeHtml(p.image!)}" alt="${escapeHtml(p.name)}" loading="lazy"/>`
      : `<div class="emoji">${escapeHtml(p.image || '🛍️')}</div>`;
    const badge = p.badge ? `<span class="badge">${escapeHtml(p.badge)}</span>` : '';
    const discount = p.discount ? `<span class="discount">-${p.discount}%</span>` : '';
    return `<article class="card">
      <div class="thumb">${img}${badge}${discount}</div>
      <div class="info">
        <h3>${escapeHtml(p.name)}</h3>
        ${p.description ? `<p class="desc">${escapeHtml(p.description)}</p>` : ''}
        <div class="row">
          <span class="price">${escapeHtml(p.price)}</span>
          <button class="buy">أضف للسلة</button>
        </div>
      </div>
    </article>`;
  }).join('');

  const testimonialCards = testimonials.map(t => `
    <div class="testimonial">
      <div class="stars">${'★'.repeat(Math.max(1, Math.min(5, t.rating || 5)))}</div>
      <p>"${escapeHtml(t.text)}"</p>
      <strong>— ${escapeHtml(t.name)}</strong>
    </div>`).join('');

  const faqItems = faq.map(f => `
    <details class="faq-item">
      <summary>${escapeHtml(f.question)}</summary>
      <p>${escapeHtml(f.answer)}</p>
    </details>`).join('');

  const socialLinks = Object.entries(social)
    .filter(([, v]) => v)
    .map(([k, v]) => `<a href="${escapeHtml(v as string)}" target="_blank" rel="noopener">${escapeHtml(k)}</a>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${storeName} — ${description}</title>
<meta name="description" content="${description}"/>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--p:#6366f1;--a:#ec4899;--bg:#fafafa;--fg:#0f172a;--muted:#64748b;--card:#fff}
body{font-family:'Cairo',system-ui,sans-serif;background:var(--bg);color:var(--fg);line-height:1.6}
.container{max-width:1200px;margin:0 auto;padding:0 24px}
.announce{background:${gradient};color:#fff;text-align:center;padding:10px;font-size:14px;font-weight:600}
header{position:sticky;top:0;background:rgba(255,255,255,.85);backdrop-filter:blur(12px);z-index:50;border-bottom:1px solid #e5e7eb}
.nav{display:flex;justify-content:space-between;align-items:center;padding:16px 0}
.logo{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;background:${gradient};-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.nav ul{display:flex;gap:28px;list-style:none}
.nav a{color:var(--fg);text-decoration:none;font-weight:600;font-size:14px}
.nav a:hover{color:var(--p)}
.cta{background:${gradient};color:#fff;border:none;padding:10px 22px;border-radius:999px;font-weight:700;cursor:pointer;font-family:inherit}
.hero{padding:80px 0;text-align:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:${gradient};opacity:.08;z-index:-1}
.hero h1{font-family:'Playfair Display',serif;font-size:clamp(36px,6vw,72px);font-weight:900;line-height:1.1;margin-bottom:20px}
.hero p{font-size:20px;color:var(--muted);max-width:640px;margin:0 auto 32px}
.hero .cta{font-size:16px;padding:16px 36px}
.section{padding:64px 0}
.section h2{font-family:'Playfair Display',serif;font-size:40px;text-align:center;margin-bottom:48px;font-weight:800}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:24px}
.card{background:var(--card);border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.06);transition:.3s}
.card:hover{transform:translateY(-6px);box-shadow:0 20px 40px rgba(0,0,0,.12)}
.thumb{aspect-ratio:1;background:#f3f4f6;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
.thumb img{width:100%;height:100%;object-fit:cover}
.thumb .emoji{font-size:80px}
.badge{position:absolute;top:12px;right:12px;background:${gradient};color:#fff;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700}
.discount{position:absolute;top:12px;left:12px;background:#ef4444;color:#fff;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:700}
.info{padding:18px}
.info h3{font-size:16px;margin-bottom:6px;font-weight:700}
.desc{font-size:13px;color:var(--muted);margin-bottom:12px}
.row{display:flex;justify-content:space-between;align-items:center}
.price{font-size:20px;font-weight:800;color:var(--p)}
.buy{background:var(--fg);color:#fff;border:none;padding:8px 14px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
.buy:hover{background:var(--p)}
.testimonials{background:#fff;border-radius:24px;padding:48px}
.t-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px}
.testimonial{padding:24px;background:#fafafa;border-radius:16px}
.stars{color:#fbbf24;font-size:18px;margin-bottom:8px}
.testimonial p{font-style:italic;margin-bottom:12px;color:var(--fg)}
.faq-item{background:#fff;border-radius:12px;padding:20px;margin-bottom:12px;cursor:pointer}
.faq-item summary{font-weight:700;font-size:16px}
.faq-item p{margin-top:12px;color:var(--muted)}
footer{background:#0f172a;color:#fff;padding:48px 0;text-align:center;margin-top:64px}
footer .logo{filter:brightness(2)}
footer .social{display:flex;gap:20px;justify-content:center;margin:20px 0}
footer .social a{color:#94a3b8;text-decoration:none;text-transform:capitalize;font-size:14px}
footer .social a:hover{color:#fff}
footer .copy{color:#64748b;font-size:13px;margin-top:16px}
@media(max-width:640px){.nav ul{display:none}.section h2{font-size:28px}}
</style>
</head>
<body>
${announcement?.show ? `<div class="announce">${escapeHtml(announcement.text)}</div>` : ''}
<header>
  <div class="container nav">
    <div class="logo">${storeName}</div>
    <ul>
      <li><a href="#home">الرئيسية</a></li>
      <li><a href="#products">المنتجات</a></li>
      <li><a href="#about">من نحن</a></li>
      <li><a href="#contact">تواصل</a></li>
    </ul>
    <button class="cta">تسوق</button>
  </div>
</header>

<section class="hero" id="home">
  <div class="container">
    <h1>${heroText}</h1>
    <p>${heroSubtext}</p>
    <button class="cta">${heroBtn}</button>
  </div>
</section>

${products.length ? `<section class="section" id="products">
  <div class="container">
    <h2>منتجاتنا المميزة</h2>
    <div class="grid">${productCards}</div>
  </div>
</section>` : ''}

${testimonials.length ? `<section class="section">
  <div class="container">
    <h2>آراء عملائنا</h2>
    <div class="testimonials"><div class="t-grid">${testimonialCards}</div></div>
  </div>
</section>` : ''}

${faq.length ? `<section class="section" id="faq">
  <div class="container" style="max-width:760px">
    <h2>الأسئلة الشائعة</h2>
    ${faqItems}
  </div>
</section>` : ''}

<footer id="contact">
  <div class="container">
    <div class="logo">${storeName}</div>
    <p style="color:#94a3b8;margin-top:8px">${description}</p>
    ${socialLinks ? `<div class="social">${socialLinks}</div>` : ''}
    <p class="copy">© ${new Date().getFullYear()} ${storeName}. جميع الحقوق محفوظة. — صُنع بواسطة ZYRA</p>
  </div>
</footer>
</body>
</html>`;
}

export function downloadStoreHTML(config: StoreConfig) {
  const html = generateStoreHTML(config);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(config.storeName || 'my-store').replace(/\s+/g, '-').toLowerCase()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function publishStorePreview(config: StoreConfig): string {
  const html = generateStoreHTML(config);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  return url;
}
