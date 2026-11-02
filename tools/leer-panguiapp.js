// Cómo leer la lista de restaurantes CMR desde Panguiapp con el navegador integrado de Claude.
// 1) Abre https://panguiapp.com/explorar?category=restaurante&bank=cmr-falabella y espera ~8 segundos.
// 2) Ejecuta el PASO A con javascript_tool varias veces hasta que devuelva { quedan: false }.
//    (Cada llamada tiene un límite de 45 segundos, por eso hace pocas pasadas.)
// 3) Ejecuta el PASO B: devuelve las líneas en el formato de data/restaurantes-cmr.txt
//    (descuento|nombre|condición|días|ubicación|vence). Pega el resultado en ese archivo.
//
// PASO A -------------------------------------------------------------------
// for (let i = 0; i < 12; i++) {
//   const b = [...document.querySelectorAll('button')].find(x => /^Cargar m[aá]s/i.test(x.textContent.trim()));
//   if (!b) break;
//   b.click();
//   await new Promise(r => setTimeout(r, 1200));
// }
// ({ quedan: !![...document.querySelectorAll('button')].find(x => /^Cargar m[aá]s/i.test(x.textContent.trim())) })
//
// PASO B -------------------------------------------------------------------
// const t = document.body.innerText;
// const M = { ene:'01', feb:'02', mar:'03', abr:'04', may:'05', jun:'06', jul:'07', ago:'08', sep:'09', oct:'10', nov:'11', dic:'12' };
// const out = [];
// for (const b of t.split(/(?=\n\d+\n%\nde descuento\nRestaurante\n)/).slice(1)) {
//   const L = b.split('\n').map(s => s.trim()).filter(Boolean);
//   const i0 = L.indexOf('CMR FALABELLA'); if (i0 < 0) continue;
//   const nombre = L[i0 + 1].replace(/^(Dcto en |\d+% en )/i, '');
//   const iv = L.indexOf('Ver detalle'); let ubic = L[iv - 1]; if (/^Vista/.test(ubic)) ubic = 'Cerca de ti';
//   const m = (L.find(x => /^Hasta \d/.test(x)) || '').match(/Hasta (\d+) (\w+) (\d{4})/);
//   const iso = m ? m[3] + '-' + M[m[2]] + '-' + String(m[1]).padStart(2, '0') : '';
//   out.push([L[0], nombre, L[i0 + 2], L[i0 + 4], ubic, iso].join('|'));
// }
// out.join('\n')
