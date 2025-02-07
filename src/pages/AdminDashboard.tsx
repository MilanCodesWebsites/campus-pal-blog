import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PlusCircle, Edit, Trash, Eye, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Post {
  id: string;
  title: string;
  published: boolean;
  created_at: string;
  slug: string;
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data || []);
    }
  }

  async function deletePost(id: string) {
    if (window.confirm('Are you sure you want to delete this post?')) {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting post:', error);
      } else {
        setPosts(posts.filter(post => post.id !== id));
      }
    }
  }

  async function togglePublished(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('posts')
      .update({ published: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating post:', error);
    } else {
      setPosts(posts.map(post =>
        post.id === id ? { ...post, published: !currentStatus } : post
      ));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link to="/admin/post/new" className="btn btn-primary flex items-center space-x-2">
          <PlusCircle className="w-5 h-5" />
          <span>New Post</span>
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Created</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-750">
                <td className="px-6 py-4">{post.title}</td>
                <td className="px-6 py-4">
                  {format(new Date(post.created_at), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => togglePublished(post.id, post.published)}
                    className={`flex items-center space-x-1 ${
                      post.published ? 'text-green-500' : 'text-gray-400'
                    }`}
                  >
                    {post.published ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Published</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Draft</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end space-x-3">
                    <Link
                      to={`/post/${post.slug}`}
                      className="text-gray-400 hover:text-white"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link
                      to={`/admin/post/${post.slug}/edit`}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}