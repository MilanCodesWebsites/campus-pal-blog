import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Save, Upload } from 'lucide-react';

interface PostData {
  title: string;
  content: string;
  excerpt: string;
  cover_image: string;
  published: boolean;
}

export default function EditPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [post, setPost] = useState<PostData>({
    title: '',
    content: '',
    excerpt: '',
    cover_image: '',
    published: false,
  });

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  async function fetchPost() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      navigate('/admin');
    } else if (data) {
      setPost(data);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      alert('Please upload an image file (jpg, jpeg, png, gif, webp)');
      return;
    }

    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user?.id}/${fileName}`;

    setUploading(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      setPost({ ...post, cover_image: data.publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const newSlug = slug || generateSlug(post.title);

    const postData = {
      ...post,
      slug: newSlug,
      author_id: user.id,
    };

    const { error } = slug
      ? await supabase
          .from('posts')
          .update(postData)
          .eq('slug', slug)
      : await supabase
          .from('posts')
          .insert([postData]);

    setLoading(false);

    if (error) {
      console.error('Error saving post:', error);
      alert('Error saving post. Please try again.');
    } else {
      navigate('/admin');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {slug ? 'Edit Post' : 'New Post'}
        </h1>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>{loading ? 'Saving...' : 'Save'}</span>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            className="input w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium mb-1">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            value={post.excerpt}
            onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
            className="input w-full h-20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Cover Image
          </label>
          <div className="flex items-center space-x-4">
            <label className="btn btn-secondary flex items-center space-x-2 cursor-pointer">
              <Upload className="w-5 h-5" />
              <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            {post.cover_image && (
              <img
                src={post.cover_image}
                alt="Cover preview"
                className="h-20 w-20 object-cover rounded"
              />
            )}
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            Content
          </label>
          <textarea
            id="content"
            value={post.content}
            onChange={(e) => setPost({ ...post, content: e.target.value })}
            className="input w-full h-96 font-mono"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="published"
            type="checkbox"
            checked={post.published}
            onChange={(e) => setPost({ ...post, published: e.target.checked })}
            className="rounded border-gray-700 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
          />
          <label htmlFor="published" className="text-sm font-medium">
            Publish post
          </label>
        </div>
      </div>
    </form>
  );
}