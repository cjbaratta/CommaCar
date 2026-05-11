import { readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

const HOST = 'www.pilotcompatible.com';
const ORIGIN = `https://${HOST}`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const KEY_FILE = resolve('public/67a6e289566a459f83636eb5efcf94ef.txt');
const SITEMAP_FILE = resolve('public/sitemap.xml');

const RESPONSE_HELP = {
  400: 'Invalid request format. Check the sitemap URLs and IndexNow JSON payload.',
  403: 'IndexNow could not validate the key. Confirm the key file is deployed and publicly reachable.',
  422: 'One or more URLs do not belong to the host, or the key does not match the protocol schema.',
  429: 'IndexNow rate limited the request. Wait before submitting again.',
};

function extractSitemapUrls(sitemapXml) {
  return [...sitemapXml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) => match[1]);
}

function validateUrls(urls) {
  if (urls.length === 0) {
    throw new Error(`No URLs found in ${SITEMAP_FILE}.`);
  }

  for (const url of urls) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error(`Invalid sitemap URL: ${url}`);
    }

    if (parsed.hostname !== HOST) {
      throw new Error(`Sitemap URL does not belong to ${HOST}: ${url}`);
    }

    if (parsed.protocol !== 'https:') {
      throw new Error(`Sitemap URL must use https: ${url}`);
    }
  }
}

async function main() {
  const [rawKey, sitemapXml] = await Promise.all([
    readFile(KEY_FILE, 'utf8'),
    readFile(SITEMAP_FILE, 'utf8'),
  ]);

  const key = rawKey.trim();
  const urlList = extractSitemapUrls(sitemapXml);
  validateUrls(urlList);

  const payload = {
    host: HOST,
    key,
    keyLocation: `${ORIGIN}/${basename(KEY_FILE)}`,
    urlList,
  };

  let response;
  try {
    response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error(`IndexNow submission failed before receiving a response: ${error.message}`);
  }

  if (response.status === 200 || response.status === 202) {
    console.log(`IndexNow accepted ${urlList.length} URL${urlList.length === 1 ? '' : 's'} for ${HOST}.`);
    if (response.status === 202) {
      console.log('The key is pending validation; try again later if search engines have not accepted it yet.');
    }
    return;
  }

  const responseBody = await response.text();
  const help = RESPONSE_HELP[response.status] ?? 'Unexpected IndexNow response.';
  throw new Error(
    `IndexNow submission failed with HTTP ${response.status}. ${help}${responseBody ? ` Response: ${responseBody}` : ''}`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
