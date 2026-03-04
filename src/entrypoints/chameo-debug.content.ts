export default defineContentScript({
  matches: ['<all_urls>'],
  world: 'MAIN',
  runAt: 'document_idle',

  main() {
    (window as any).__chameo = {
      highlights() {
        const spans = document.querySelectorAll<HTMLElement>('[data-chameo-type]');
        const items = [...spans].map((el) => ({
          text: el.textContent,
          type: el.dataset.chameoType,
          label: el.dataset.chameoLabel,
          modifies: el.dataset.chameoModifies || '',
        }));
        console.table(items);
        return items;
      },
      cache() {
        const el = document.getElementById('__chameo-cache');
        if (!el) {
          console.log('[Chameo] No cache data');
          return null;
        }
        const data = JSON.parse(el.textContent || '{}');
        const url = location.origin + location.pathname;
        const current = data[url] || [];
        console.log(`[Chameo] Current page (${url}): ${current.length} cached`);
        current.forEach((e: any, i: number) => {
          console.groupCollapsed(`#${i + 1} ${e.sentence.slice(0, 60)}...`);
          console.table(e.result.segments);
          console.log('Core:', e.result.core.summary);
          console.log('Translation:', e.result.translation);
          console.log('Saved:', new Date(e.timestamp).toLocaleString());
          console.groupEnd();
        });
        console.log(`[Chameo] Total pages cached: ${Object.keys(data).length}`);
        return data;
      },
      clear() {
        document.querySelectorAll('[data-chameo-type]').forEach((span) => {
          const parent = span.parentNode;
          if (!parent) return;
          while (span.firstChild) parent.insertBefore(span.firstChild, span);
          parent.removeChild(span);
          parent.normalize();
        });
      },
    };
    console.log('[Chameo] Debug: __chameo.highlights()  __chameo.cache()  __chameo.clear()');
  },
});
