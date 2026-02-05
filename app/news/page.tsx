import { getCryptoNews } from '@/lib/news-api';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, User, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const revalidate = 300; // Revalidate every 5 minutes

export default async function NewsPage() {
    const news = await getCryptoNews();

    return (
        <div className="main-container py-12">
            <div className="mb-10 text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Crypto News
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                    Stay updated with the latest trends, market analysis, and blockchain developments from top sources.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.map((item) => (
                    <article
                        key={item.id}
                        className="flex flex-col bg-dark-500 rounded-2xl border border-dark-400 overflow-hidden hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 group"
                    >
                        <div className="relative h-48 w-full overflow-hidden">
                            <Image
                                src={item.imageurl}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 to-transparent opacity-60" />
                            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                <Badge variant="secondary" className="bg-green-500/20 text-green-500 hover:bg-green-500/30 backdrop-blur-md border-0">
                                    {item.source_info.name}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex flex-col flex-1 p-6">
                            <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>
                                        {new Date(item.published_on * 1000).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 truncate max-w-[50%]">
                                    <Tag className="w-3.5 h-3.5" />
                                    <span className="truncate">{item.tags.split('|')[0] || 'Crypto'}</span>
                                </div>
                            </div>

                            <Link href={`/news/${item.id}`} className="group-hover:text-green-500 transition-colors">
                                <h2 className="text-xl font-bold mb-3 line-clamp-2 leading-tight">
                                    {item.title}
                                </h2>
                            </Link>

                            <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-1">
                                {item.body}
                            </p>

                            <div className="mt-auto pt-4 border-t border-dark-400/50">
                                <Button
                                    asChild
                                    variant="ghost"
                                    className="w-full justify-between hover:bg-dark-400 hover:text-green-500 group/btn p-0 px-2"
                                >
                                    <Link href={`/news/${item.id}`}>
                                        Read Full Story
                                        <ExternalLink className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {news.length === 0 && (
                <div className="text-center py-20 bg-dark-500 rounded-2xl border border-dark-400">
                    <p className="text-gray-400 text-lg">Unable to fetch news at the moment.</p>
                    <p className="text-sm text-gray-500 mt-2">Please try again later.</p>
                </div>
            )}
        </div>
    );
}
