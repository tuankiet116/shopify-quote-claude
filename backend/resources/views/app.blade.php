<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="shopify-api-key" content="{{ config('shopify.api_key') }}" />
    <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
    @if(app()->environment('local'))
        <script type="module" src="http://localhost:5173/@vite/client"></script>
        <script type="module" src="http://localhost:5173/src/main.tsx"></script>
    @else
        @php
            $manifest = json_decode(file_get_contents(public_path('build/.vite/manifest.json')), true);
        @endphp
        <link rel="stylesheet" href="/build/{{ $manifest['src/app.css']['file'] }}" />
        <script type="module" src="/build/{{ $manifest['src/main.tsx']['file'] }}"></script>
    @endif
</head>
<body>
    <div id="app"></div>
</body>
</html>
