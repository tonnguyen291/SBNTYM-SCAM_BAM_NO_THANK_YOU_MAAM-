// Native fetch is available in Node 18+

const test = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8787/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                page_url: 'https://example.com',
                // 1x1 pixel transparent png
                screenshot_data_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
            })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Server error: ${response.status} ${text}`);
        }

        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
};

test();
