export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Handle Netlify image optimization requests
    if (url.pathname === '/.netlify/images') {
      const imageUrl = url.searchParams.get('url');

      if (imageUrl && imageUrl.includes('hero-electric-car')) {
        // Serve Xanh SM electric car image
        const response = await fetch(
          'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1600&q=80'
        );
        return new Response(response.body, {
          headers: {
            'content-type': 'image/jpeg',
            'cache-control': 'public, max-age=86400',
            'access-control-allow-origin': '*',
          },
        });
      }

      // For other images, proxy to Netlify
      const netlifyUrl = new URL(url.toString());
      netlifyUrl.hostname = 'xedienat.netlify.app';
      return fetch(netlifyUrl);
    }

    // Skip Netlify HUD scripts
    if (url.pathname.startsWith('/.netlify/scripts')) {
      return new Response('', {
        headers: { 'content-type': 'application/javascript' },
      });
    }

    // For all other requests, proxy to Netlify
    const netlifyUrl = new URL(url.toString());
    netlifyUrl.hostname = 'xedienat.netlify.app';

    const proxyRequest = new Request(netlifyUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow',
    });

    const response = await fetch(proxyRequest);

    // Return the response with cleaned headers
    const newHeaders = new Headers(response.headers);
    newHeaders.delete('x-nf-request-id');
    newHeaders.delete('netlify-hosting');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
