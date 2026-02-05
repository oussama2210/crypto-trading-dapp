import { getNewsById } from '@/lib/news-api';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, Tag, ExternalLink, Share2, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface NewsPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function NewsDetailPage({ params }: NewsPageProps) {
    const { id } = await params;
    const newsItem = await getNewsById(id);

    if (!newsItem) {
        notFound();
    }

    return (
        <div className="main-container py-10">
            {/* Back Button */}
            <Button asChild variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-green-500 transition-colors">
                <Link href="/news" className="flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5" />
                    Back to News
                </Link>
            </Button>

            <article className="max-w-4xl mx-auto bg-dark-500 rounded-3xl border border-dark-400 overflow-hidden shadow-2xl">
                {/* Hero Image */}
                <div className="relative h-[400px] w-full">
                    <Image
                        src={newsItem.imageurl}
                        alt={newsItem.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-500 to-transparent opacity-90" />

                    {/* Floating Source Badge */}
                    <div className="absolute top-6 left-6">
                        <div className="flex items-center gap-3 bg-dark-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-dark-400">
                            <img
                                src={newsItem.source_info.img}
                                alt={newsItem.source_info.name}
                                className="w-6 h-6 rounded-full"
                            />
                            <span className="font-medium text-white">{newsItem.source_info.name}</span>
                        </div>
                    </div>
                </div>

                <div className="px-8 md:px-12 -mt-32 relative z-10 space-y-8 pb-12">
                    {/* Header Info */}
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2 text-sm">
                            <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 px-3 py-1">
                                {newsItem.categories.split('|')[0] || 'Crypto'}
                            </Badge>
                            <div className="flex items-center gap-1 bg-dark-400/50 backdrop-blur px-3 py-1 rounded-full text-gray-300 border border-dark-300">
                                <Clock className="w-3.5 h-3.5" />
                                <span>5 min read</span>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold leading-tight text-white">
                            {newsItem.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-gray-400 border-b border-dark-400 pb-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-green-500" />
                                <span>{format(new Date(newsItem.published_on * 1000), 'MMMM do, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-green-500" />
                                <span>{newsItem.source_info.name}</span>
                            </div>
                            <div className="flex items-center gap-4 ml-auto">
                                <span className="flex items-center gap-1 text-sm">
                                    <ThumbsUp className="w-4 h-4 text-green-500" /> {newsItem.upvotes}
                                </span>
                                <span className="flex items-center gap-1 text-sm">
                                    <ThumbsDown className="w-4 h-4 text-red-500" /> {newsItem.downvotes}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="prose prose-invert prose-lg max-w-none">
                        <p className="text-gray-300 text-lg leading-relaxed">
                            {newsItem.body}
                        </p>
                        <p className="text-gray-400 italic mt-4">
                            ...Continue reading the full story on {newsItem.source_info.name}.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button
                            asChild
                            size="lg"
                            className="bg-green-500 hover:bg-green-600 text-white font-bold text-lg h-14"
                        >
                            <Link href={newsItem.url} target="_blank">
                                Read Full Article <ExternalLink className="w-5 h-5 ml-2" />
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-dark-400 hover:bg-dark-400 text-gray-300 h-14"
                        >
                            <Share2 className="w-5 h-5 mr-2" /> Share Story
                        </Button>
                    </div>

                    {/* Tags */}
                    {newsItem.tags && (
                        <div className="pt-6 border-t border-dark-400">
                            <h4 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-3 flex items-center gap-2">
                                <Tag className="w-4 h-4" /> Related Tags
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {newsItem.tags.split('|').map(tag => (
                                    <span
                                        key={tag}
                                        className="text-sm px-4 py-2 bg-dark-400 rounded-lg text-gray-300 hover:text-white hover:bg-dark-300 transition-colors cursor-pointer"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </article>
        </div>
    );
}
