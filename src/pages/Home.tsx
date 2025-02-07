import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { Search, ArrowLeft } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  cover_image: string;
  created_at: string;
  slug: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data || []);
    }
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="relative flex items-center">
        <a 
          href="https://campus-pal-gamma.vercel.app/"
          className="absolute left-0 -ml-16 text-gray-400 hover:text-[#A9E627] transition-colors"
          title="Back to main site"
        >
          <ArrowLeft className="w-6 h-6" />
        </a>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-12"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <Link
            key={post.id}
            to={`/post/${post.slug}`}
            className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform duration-200"
          >
            <img
              src={post.cover_image || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c'}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{post.title}</h2>
              <p className="text-gray-400 mb-4">{post.excerpt}</p>
              <time className="text-sm text-gray-500">
                {format(new Date(post.created_at), 'MMMM d, yyyy')}
              </time>
            </div>
          </Link>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No posts found.</p>
        </div>
      )}
    </div>
  );
}