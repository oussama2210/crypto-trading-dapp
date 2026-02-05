export interface NewsItem {
    id: string;
    guid: string;
    published_on: number;
    imageurl: string;
    title: string;
    url: string;
    source: string;
    body: string;
    tags: string;
    categories: string;
    upvotes: string;
    downvotes: string;
    lang: string;
    source_info: {
        name: string;
        lang: string;
        img: string;
    };
}

export async function getCryptoNews(): Promise<NewsItem[]> {
    try {
        // CryptoCompare News API (Free endpoint, no key required for basic usage)
        const response = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN', {
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch news: ${response.status}`);
        }

        const data = await response.json();
        return data.Data || [];
    } catch (error) {
        console.error('Error fetching crypto news:', error);
        return [];
    }
}

export async function getNewsById(id: string): Promise<NewsItem | undefined> {
    const news = await getCryptoNews();
    return news.find((item) => item.id === id);
}
