'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient, type FacebookPost } from '@/lib/supabase'
import { Heart, MessageCircle, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function BlogSection() {
  const [posts, setPosts] = useState<FacebookPost[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('facebook_posts')
          .select('*')
          .eq('is_published', true)
          .order('created_time', { ascending: false })
          .limit(6)
        if (error) throw error
        setPosts(data || [])
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-gray-50" id="blog">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Nos Actualités</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                <div className="bg-gray-200 h-64"></div>
                <div className="p-6"><div className="h-4 bg-gray-200 rounded mb-4"></div></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gray-50" id="blog">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Nos Dernières Actualités</h2>
          <p className="text-gray-600 text-lg">Découvrez nos nouveautés sur Facebook</p>
        </div>
        {posts.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 mb-8">Aucune publication pour le moment</p>
            <a href="https://www.facebook.com/share/1UQrzK91XM/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700">
              Suivre sur Facebook <ExternalLink size={18} />
            </a>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => (
                <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition">
                  {post.full_picture && (
                    <div className="h-64 overflow-hidden">
                      <img src={post.full_picture} alt="Post" className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="text-sm text-gray-500 mb-3">{format(new Date(post.created_time), "d MMMM yyyy", { locale: fr })}</div>
                    {post.message && <p className="text-gray-700 mb-4 line-clamp-3">{post.message}</p>}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><Heart size={16} className="text-red-500" />{post.likes_count}</span>
                        <span className="flex items-center gap-1"><MessageCircle size={16} className="text-blue-500" />{post.comments_count}</span>
                      </div>
                      {post.permalink_url && (
                        <a href={post.permalink_url} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1">
                          Voir <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="text-center mt-12">
              <a href="https://www.facebook.com/share/1UQrzK91XM/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white px-8 py-4 rounded-full font-bold hover:from-red-700 hover:to-orange-600">
                Suivre MDjambo <ExternalLink size={20} />
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
