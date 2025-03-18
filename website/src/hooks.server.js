import { base } from '$app/paths';
import { languages } from '$lib/languages';
import { getURLForLanguage } from '$lib/utils';

export async function handle({ event, resolve }) {
	const language = event.params.language ?? 'en';
	const strings = await import(`./locales/${language}.json`);

	const path = event.url.pathname;
	const page = event.route.id?.replace('/[[language]]', '').split('/')[1] ?? 'home';

	let title = strings.metadata[`${page}_title`];
	const description = strings.metadata[`description`];

	if (page === 'help' && event.params.guide) {
		const [guide, subguide] = event.params.guide.split('/');
		const guideModule = subguide
			? await import(`./lib/docs/${language}/${guide}/${subguide}.mdx`)
			: await import(`./lib/docs/${language}/${guide}.mdx`);
		title = `${title} | ${guideModule.metadata.title}`;
	}

	const htmlTag = `<html lang="${language}" translate="no">`;

	let headTag = `<head>
    <title>Studio — ${title} — Wanderstories</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="gps.studio — ${title}" />
    <meta property="og:description" content="${description}" />
    <meta name="twitter:title" content="gps.studio — ${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta property="og:image" content="https://studio.wanderstories.space${base}/og_logo.png" />
    <meta property="og:url" content="https://studio.wanderstories.space/" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="gps.studio" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="https://studio.wanderstories.space${base}/og_logo.png" />
    <meta name="twitter:url" content="https://studio.wanderstories.space/" />
    <meta name="twitter:site" content="@wanderstories" />
    <meta name="twitter:creator" content="@gpxstudio" />
    <link rel="alternate" hreflang="x-default" href="https://studio.wanderstories.space${getURLForLanguage('en', path)}" />`;

	for (let lang of Object.keys(languages)) {
		headTag += `   <link rel="alternate" hreflang="${lang}" href="https://studio.wanderstories.space${getURLForLanguage(lang, path)}" />
`;
	}

	const GA_MEASUREMENT_ID = 'G-8YRS2SPLX3';
	// Add Google Analytics script
	headTag += `
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${GA_MEASUREMENT_ID}');
</script>`;

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('<html>', htmlTag).replace('<head>', headTag)
	});

	return response;
}
