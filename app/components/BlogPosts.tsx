'use client'
import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

interface BlogPost {
  title: string;
  date: string;
  excerpt: string;
}

interface BlogPostsProps {
  blogPosts: BlogPost[];
}

export function BlogPosts({ blogPosts }: BlogPostsProps) {
  const [posts, setPosts] = useState<typeof blogPosts>([]);
  useEffect(() => {
    setTimeout(() => setPosts(blogPosts), 500);
  });
  
  return (
    <section className="mt-12">
      <div className="flex items-center mb-4">
        <BookOpen className="w-6 h-6 text-primary mr-2" />
        <h2 className="text-2xl font-semibold"><s>Latest</s> Potential Blog Posts</h2>
      </div>
      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-muted-foreground text-sm">Loading posts...</p>
        ) : (
          posts.map((post, idx) => (
            <div key={idx} className="p-4 bg-card rounded-xl shadow">
              <h3 className="text-xl font-bold">{post.title}</h3>
              <p className="text-sm text-muted-foreground">{post.date}</p>
              <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
} 