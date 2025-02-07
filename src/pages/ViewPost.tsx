import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface Post {
  id: string;
  title: string;
  content: string;
  cover_image: string;
  created_at: string;
  author_id: string;
  published: boolean;
}

export default function ViewPost() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  async function fetchPost() {
    if (!slug) return;

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    setLoading(false);

    if (error) {
      setError('Post not found');
    } else if (data) {
      if (!data.published && (!user || user.id !== data.author_id)) {
        setError('Post not found');
      } else {
        setPost(data);
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-xl text-gray-400">{error}</div>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto">
      <img
        src={post.cover_image || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c'}
        alt={post.title}
        className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
      />

      <div className="space-y-4">
        <h1 className="text-4xl font-bold">{post.title}</h1>
        
        <div className="flex items-center text-gray-400">
          <time>{format(new Date(post.created_at), 'MMMM d, yyyy')}</time>
          {!post.published && (
            <span className="ml-4 px-2 py-1 bg-gray-800 rounded-full text-sm">
              Draft
            </span>
          )}
        </div>

        <div className="prose prose-invert max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}