/* ============================================================
   Izlemj, vai intro vispār rādīt — un izlemj to PIRMS lapa pirmo reizi
   uzzīmējas. Tāpēc šis ir atsevišķs, sinhrons fails <head> sadaļā, nevis daļa
   no js/intro.js: tas palaižas body beigās, un līdz tam sarkanais jau būtu
   nomirgojis tiem, kam intro nepienākas.

   Šī ir VIENĪGĀ vieta, kur šo izlemj. js/intro.js tikai nolasa rezultātu.
   ============================================================ */
(() => {
  'use strict';

  // Rādīt intro vienu reizi vienā sesijā. Kas atgriežas pārbaudīt pasākuma
  // datumu, tam gaidīšana otrajā reizē jau kaitina.
  const ONCE_PER_SESSION = true;
  const KEY = 'jns-intro';

  // Ja skripts kaut kur aizķeras, sarkanais nedrīkst palikt uz mūžiem —
  // aiz tā ir visa lapa. Šis ir avārijas vārsts, ne parastais ceļš.
  const FAILSAFE_MS = 6000;

  const qs     = location.search;
  const frozen = /[?&]t=/.test(qs);        // ?t=800 — iesaldēts kadrs atkļūdošanai
  const forced = /[?&]intro=1/.test(qs);   // ?intro=1 — parādi, pat ja jau redzēts

  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) { /* privātais režīms */ }

  let skip = false;
  if (!frozen && !forced) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) skip = true;
    else if (ONCE_PER_SESSION && seen) skip = true;
  }

  if (skip) {
    document.documentElement.classList.add('intro-skip');
    return;
  }

  if (!frozen) {                            // iesaldēts kadrs nav noskatīšanās
    try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* privātais režīms */ }
  }

  if (frozen) return;                       // atkļūdojot kadram jāpaliek uz ekrāna
  addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const el = document.getElementById('intro');
      if (el && !el.classList.contains('is-done')) {
        el.classList.add('is-done');
        document.documentElement.classList.remove('intro-running');
      }
    }, FAILSAFE_MS);
  });
})();
