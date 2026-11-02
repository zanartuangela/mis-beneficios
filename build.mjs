// Arma index.html a partir de src/template.html y los archivos de la carpeta data/.
// Uso: node build.mjs
import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const strip = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const slug = (s) => strip(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const DIAS = { lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6, domingo: 0 };
const REGION = /valdivia|chillan|vina del mar|renaca|rancagua|talca\b|osorno|temuco|villarrica|maitencillo|algarrobo|puerto varas|concepcion|talcahuano|san pedro de la paz|coyhaique|concon|bio bio/;
const MINUS = new Set(['de', 'del', 'la', 'el', 'y', 'en', 'a', 'al', 'los', 'las', 'con']);

function tidyName(name) {
  return name
    .split(' ')
    .map((w) => {
      if (!w || MINUS.has(w.toLowerCase())) return w;
      if (w === w.toUpperCase() && w.length > 3) return w[0] + w.slice(1).toLowerCase();
      return w[0].toUpperCase() + w.slice(1);
    })
    .join(' ');
}

function parseRestaurantes(texto) {
  const out = [];
  for (const raw of texto.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const [pct, nombre, cond, diasTxt, ubi, hasta] = line.split('|');
    const comercio = tidyName(nombre.trim());
    const d = strip(diasTxt);
    let dias;
    const notas = [];
    if (/todos los dias/.test(d)) dias = [];
    else if (/^(\d) dias a la semana/.test(d)) notas.push(`Aplica ${d[0]} días a la semana; confirma cuáles en el local.`);
    else dias = Object.keys(DIAS).filter((k) => d.includes(k)).map((k) => DIAS[k]).sort((a, b) => a - b);

    const c = strip(cond);
    let canal = 'Presencial';
    if (/exclusivo online|^online/.test(c)) canal = 'Online';
    else if (/delivery/.test(c)) canal = 'Delivery';
    else if (/presencial y online/.test(c)) canal = 'Presencial y online';

    const elite = /elite/.test(c);
    const trivial = /^(exclusivo presencial|presencial|presencial y online|exclusivo online|online|exclusivo delivery)$/;
    const detalle = [];
    if (!trivial.test(c)) detalle.push(cond.replace(/\.$/, '') + '.');
    if (notas.length) detalle.push(...notas);

    let ubicacion = ubi.trim();
    const mas = ubicacion.match(/^(.*?)\s*\+(\d+)$/);
    if (mas) ubicacion = `${mas[1]} y ${mas[2]} más`;
    ubicacion = ubicacion.replace('Región Metropolitana de Santiago', 'Región Metropolitana');
    const regional = REGION.test(strip(ubi + ' ' + cond));
    if (ubicacion === 'Cerca de ti') {
      ubicacion = regional ? cond.replace(/^(presencial|domingo)( en)? /i, '').replace(/\.$/, '') : '';
    }

    const doc = {
      id: 'cmr-r-' + slug(comercio),
      tarjetas: ['cmr-elite-black'],
      comercio,
      categoria: 'Restaurantes',
      descuento: pct + '%',
      canal,
      hasta: hasta.trim(),
      tipo: 'promo',
      verificado: false,
      fuente: 'https://www.bancofalabella.cl/descuentos/restaurantes',
    };
    if (detalle.length) doc.detalle = detalle.join(' ');
    if (dias) doc.dias = dias;
    if (ubicacion) doc.ubicacion = ubicacion;
    if (regional) doc.regional = true;
    if (elite) doc.elite = true;
    out.push(doc);
  }
  return out;
}

const tarjetas = JSON.parse(read('data/tarjetas.json'));
const fijos = JSON.parse(read('data/beneficios.json'));
const rest = parseRestaurantes(read('data/restaurantes-cmr.txt'));
const meta = JSON.parse(read('data/meta.json'));

const ids = new Set();
for (const b of [...fijos, ...rest]) {
  if (ids.has(b.id)) throw new Error('id repetido: ' + b.id);
  ids.add(b.id);
}

const data = { tarjetas, beneficios: [...fijos, ...rest], meta };
const json = JSON.stringify(data).replace(/</g, '\\u003c');
const tpl = read('src/template.html');
if (!tpl.includes('"__DATA__"')) throw new Error('falta el marcador "__DATA__" en src/template.html');
const html = tpl.replace('"__DATA__"', () => json).replace('__BUILD__', meta.actualizado);
fs.writeFileSync('index.html', html);
console.log(`index.html listo: ${tarjetas.length} tarjetas, ${data.beneficios.length} beneficios (${rest.length} restaurantes CMR), ${(html.length / 1024).toFixed(0)} KB`);
