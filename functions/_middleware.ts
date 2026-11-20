import { STATION_BY_INDEX } from '../src/data/gta6Radios';
import { decodeSharedProfile } from '../src/engine/share';

declare class HTMLRewriter {
  on(selector: string, handlers: {
    element?(element: {
      setInnerContent(content: string): void;
      setAttribute(name: string, value: string): void;
    }): void;
  }): HTMLRewriter;
  transform(response: Response): Response;
}

export async function onRequest(context: {
  request: Request;
  next: () => Promise<Response>;
}): Promise<Response> {
  const url = new URL(context.request.url);
  if (url.pathname !== '/' && url.pathname !== '/index.html') {
    return context.next();
  }

  const token = url.searchParams.get('r');
  if (!token) {
    return context.next();
  }

  const payload = decodeSharedProfile(token);
  if (!payload || payload.r.length === 0) {
    return context.next();
  }

  const response = await context.next();
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  const [topIdx, topPct] = payload.r[0];
  const topStation = STATION_BY_INDEX.get(topIdx);
  const stationName = topStation?.name ?? 'Flash FM';
  const frequency = topStation?.frequency ?? '98.7 MHz';

  const title = `${payload.n} — ${stationName} (${topPct}%) | LEONIDA WRAPPED`;
  const ogTitle = `${payload.n} sintonizou ${stationName} (${frequency}) — ${topPct}% de match!`;
  const artistsText =
    payload.a.length > 0 ? `Artistas: ${payload.a.slice(0, 4).join(', ')} • ` : '';
  const description = `${artistsText}Descubra sua rádio oficial de GTA VI e compare no Modo Carona.`;
  const ogImage = `${url.origin}/api/og?r=${encodeURIComponent(token)}`;
  const ogUrl = `${url.origin}/?r=${encodeURIComponent(token)}`;

  return new HTMLRewriter()
    .on('title', {
      element(el) {
        el.setInnerContent(title);
      },
    })
    .on('meta[property="og:title"]', {
      element(el) {
        el.setAttribute('content', ogTitle);
      },
    })
    .on('meta[name="twitter:title"]', {
      element(el) {
        el.setAttribute('content', ogTitle);
      },
    })
    .on('meta[property="og:description"]', {
      element(el) {
        el.setAttribute('content', description);
      },
    })
    .on('meta[name="twitter:description"]', {
      element(el) {
        el.setAttribute('content', description);
      },
    })
    .on('meta[property="og:image"]', {
      element(el) {
        el.setAttribute('content', ogImage);
      },
    })
    .on('meta[name="twitter:image"]', {
      element(el) {
        el.setAttribute('content', ogImage);
      },
    })
    .on('meta[property="og:url"]', {
      element(el) {
        el.setAttribute('content', ogUrl);
      },
    })
    .transform(response);
}
