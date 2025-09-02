import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { UNSPLASH_ACCESS_KEY } from '$env/static/private';

export const GET: RequestHandler = async ({ params }) => {
	const { word } = params;

	if (!UNSPLASH_ACCESS_KEY) {
		console.error('UNSPLASH_ACCESS_KEY environment variable is not set');
		return json({ error: 'Unsplash API not configured' }, { status: 500 });
	}

	try {
		const response = await fetch(
			`https://api.unsplash.com/search/photos?query=${encodeURIComponent(word)}&per_page=1&lang=es&client_id=${UNSPLASH_ACCESS_KEY}`
		);

		if (!response.ok) {
			console.error('Unsplash API error:', response.status, response.statusText);
			return json({ error: 'Failed to fetch image from Unsplash' }, { status: 500 });
		}

		const data = await response.json();

		if (!data.results || data.results.length === 0) {
			return json({ error: 'No images found for this word' }, { status: 404 });
		}

		const photo = data.results[0];

		return json({
			id: photo.id,
			url: photo.urls.regular,
			thumb: photo.urls.thumb,
			alt: photo.alt_description || `Image of ${word}`,
			author: photo.user.name,
			authorUrl: photo.user.links.html,
			downloadUrl: photo.links.download
		});
	} catch (error) {
		console.error('Error fetching image:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
