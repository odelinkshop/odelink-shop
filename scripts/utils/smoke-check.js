const DEFAULT_TIMEOUT_MS = Number.parseInt(process.env.SMOKE_TIMEOUT_MS || '15000', 10);
const FETCH_RETRY_COUNT = Math.max(0, Number.parseInt(process.env.SMOKE_FETCH_RETRY_COUNT || '2', 10) || 0);
const FETCH_RETRY_DELAY_MS = Math.max(100, Number.parseInt(process.env.SMOKE_FETCH_RETRY_DELAY_MS || '1500', 10) || 1500);
const JSON_RETRY_COUNT = Math.max(0, Number.parseInt(process.env.SMOKE_JSON_RETRY_COUNT || '2', 10) || 0);
const JSON_RETRY_DELAY_MS = Math.max(100, Number.parseInt(process.env.SMOKE_JSON_RETRY_DELAY_MS || '1500', 10) || 1500);
const baseUrl = normalizeBaseUrl(process.env.SMOKE_BASE_URL || 'https://www.odelink.shop');
const apexUrl = normalizeBaseUrl(process.env.SMOKE_APEX_URL || 'https://odelink.shop');
const expectedMainJs = normalizeString(process.env.SMOKE_EXPECT_MAIN_JS);
const publicSiteSubdomain = normalizeString(process.env.SMOKE_PUBLIC_SITE_SUBDOMAIN);

function normalizeString(value) {
  return (value || '').toString().trim();
}

function normalizeBaseUrl(value) {
  return normalizeString(value).replace(/\/+$/, '');
}

function log(message) {
  process.stdout.write(`[smoke] ${message}\n`);
}

function fail(message) {
  throw new Error(message);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0)));
}

async function fetchWithTimeout(url, options = {}) {
  const retryCount = Math.max(0, Number.parseInt(options.retryCount ?? FETCH_RETRY_COUNT, 10) || 0);
  const retryDelayMs = Math.max(100, Number.parseInt(options.retryDelayMs ?? FETCH_RETRY_DELAY_MS, 10) || FETCH_RETRY_DELAY_MS);
  let lastError = null;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    const controller = new AbortController();
    const timeout = Number.parseInt(options.timeoutMs || DEFAULT_TIMEOUT_MS, 10);
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        redirect: options.redirect || 'follow',
        headers: {
          'cache-control': 'no-cache',
          pragma: 'no-cache',
          'user-agent': 'odelink-smoke-check/1.0',
          ...(options.headers || {})
        },
        signal: controller.signal
      });
      const text = await response.text();
      return { response, text };
    } catch (error) {
      lastError = error;
      if (attempt >= retryCount) {
        throw error;
      }
      log(`retrying fetch for ${url} after network error (${attempt + 1}/${retryCount + 1}): ${error.message}`);
      await sleep(retryDelayMs);
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new Error(`Failed to fetch ${url}`);
}

async function fetchJson(url, options = {}) {
  const retryCount = Math.max(0, Number.parseInt(options.retryCount ?? JSON_RETRY_COUNT, 10) || 0);
  const retryDelayMs = Math.max(100, Number.parseInt(options.retryDelayMs ?? JSON_RETRY_DELAY_MS, 10) || JSON_RETRY_DELAY_MS);
  let lastError = null;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    const { response, text } = await fetchWithTimeout(url, options);
    let json = null;

    if (text) {
      try {
        json = JSON.parse(text);
      } catch (error) {
        lastError = error;
        const contentType = normalizeString(
          response.headers.get('content-type') || response.headers.get('Content-Type')
        ).toLowerCase();
        const looksLikeHtml = text.trim().startsWith('<') || contentType.includes('text/html');
        const retryable = attempt < retryCount && (looksLikeHtml || response.status >= 500);

        if (!retryable) {
          fail(`Invalid JSON from ${url}: ${error.message}`);
        }

        log(`retrying json fetch for ${url} after transient non-json response (${attempt + 1}/${retryCount + 1})`);
        await sleep(retryDelayMs);
        continue;
      }
    }

    return { response, json, text };
  }

  fail(`Invalid JSON from ${url}: ${lastError?.message || 'unknown parse failure'}`);
}

function extractMainJsFromHtml(html) {
  const text = normalizeString(html);
  if (!text) return '';
  const match = text.match(/static\/js\/main\.[^"'<>]+\.js/);
  return normalizeString(match?.[0]);
}

function ensureStatus(response, url, allowedStatuses = [200]) {
  if (allowedStatuses.includes(response.status)) return;
  fail(`Unexpected status ${response.status} for ${url}`);
}

async function checkHealth() {
  const url = `${baseUrl}/api/health`;
  const { response, json } = await fetchJson(url);
  ensureStatus(response, url, [200]);

  if (normalizeString(json?.status) !== 'ok') {
    fail(`Health endpoint did not report ok status: ${JSON.stringify(json)}`);
  }

  log('health ok');
}

async function checkReadiness() {
  const url = `${baseUrl}/api/ready`;
  const { response, json } = await fetchJson(url);
  ensureStatus(response, url, [200]);

  if (!json?.ok) {
    fail(`Readiness endpoint did not report ok: ${JSON.stringify(json)}`);
  }

  if (!json?.checks?.database?.ok) {
    fail(`Database readiness failed: ${JSON.stringify(json?.checks?.database || null)}`);
  }

  log('readiness ok');
}

async function readFrontendMetadata() {
  const apiUrl = `${baseUrl}/api/frontend-build`;
  const apiResult = await fetchJson(apiUrl);

  if (apiResult.response.status === 200) {
    const mainJs = normalizeString(apiResult.json?.mainJs);
    if (!mainJs) {
      fail(`Frontend build endpoint missing mainJs: ${JSON.stringify(apiResult.json)}`);
    }

    log(`frontend metadata via api (${mainJs})`);
    return { mainJs, source: 'api' };
  }

  if (
    apiResult.response.status === 404 &&
    normalizeString(apiResult.json?.error) === 'frontend_not_served'
  ) {
    const manifestUrl = `${baseUrl}/asset-manifest.json`;
    const manifestFetch = await fetchWithTimeout(manifestUrl);
    if (manifestFetch.response.status === 200) {
      try {
        const manifestJson = manifestFetch.text ? JSON.parse(manifestFetch.text) : null;
        const mainJs = normalizeString(manifestJson?.files?.['main.js']);
        if (mainJs) {
          log(`frontend metadata via public manifest (${mainJs})`);
          return { mainJs, source: 'public-manifest' };
        }
      } catch (error) {
        log(`public manifest unavailable, falling back to homepage parse (${error.message})`);
      }
    }

    const homepageUrl = `${baseUrl}/?smoke=${Date.now()}`;
    const homepage = await fetchWithTimeout(homepageUrl);
    ensureStatus(homepage.response, homepageUrl, [200]);

    const mainJs = extractMainJsFromHtml(homepage.text);
    if (!mainJs) {
      fail('Homepage HTML is missing a detectable main bundle reference');
    }

    log(`frontend metadata via homepage (${mainJs})`);
    return { mainJs, source: 'homepage' };
  }

  fail(`Unexpected frontend-build response: ${apiResult.response.status}`);
}

async function checkHomepage(mainJs) {
  const url = `${baseUrl}/?smoke=${Date.now()}`;
  const { response, text } = await fetchWithTimeout(url);
  ensureStatus(response, url, [200]);

  if (!text.includes(mainJs)) {
    fail(`Homepage HTML does not reference expected main bundle ${mainJs}`);
  }

  log('homepage bundle reference ok');
}

async function checkApexRedirect() {
  if (!apexUrl) return;

  const url = `${apexUrl}/panel?smoke=${Date.now()}`;
  const { response, text } = await fetchWithTimeout(url, { redirect: 'manual' });

  if ([301, 302, 307, 308].includes(response.status)) {
    const location = normalizeString(response.headers.get('location'));
    if (!location.startsWith(`${baseUrl}/panel`)) {
      fail(`Apex redirect target mismatch: ${location}`);
    }

    log('apex redirect ok');
    return;
  }

  ensureStatus(response, url, [200]);

  if (!text.includes('window.location.replace') && !text.includes('location.replace')) {
    fail('Apex panel response is missing canonical redirect script');
  }

  if (!text.includes('__odelink_transfer__')) {
    fail('Apex panel response is missing session transfer marker');
  }

  log('apex script redirect ok');
}

async function checkPublicSite() {
  if (!publicSiteSubdomain) return;

  const encoded = encodeURIComponent(publicSiteSubdomain);
  const url = `${baseUrl}/api/sites/public/${encoded}`;
  const { response, json } = await fetchJson(url);
  ensureStatus(response, url, [200]);

  const actual = normalizeString(json?.site?.subdomain);
  if (actual !== publicSiteSubdomain) {
    fail(`Public site subdomain mismatch. Expected ${publicSiteSubdomain}, got ${actual || '<empty>'}`);
  }

  log('public site lookup ok');
}

async function main() {
  if (!baseUrl) {
    fail('SMOKE_BASE_URL is required');
  }

  log(`base url ${baseUrl}`);
  await checkHealth();
  await checkReadiness();

  const frontend = await readFrontendMetadata();
  const mainJs = expectedMainJs || frontend.mainJs;

  if (expectedMainJs && frontend.mainJs !== expectedMainJs) {
    fail(`Expected main bundle ${expectedMainJs}, got ${frontend.mainJs} from ${frontend.source}`);
  }

  await checkHomepage(mainJs);
  await checkApexRedirect();
  await checkPublicSite();

  log('all smoke checks passed');
}

main().catch((error) => {
  process.stderr.write(`[smoke] FAILED: ${error.message}\n`);
  process.exit(1);
});
