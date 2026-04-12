import React from 'react';

const BlogPage = () => {
  return (
    <div className="min-h-screen gradient-bg pt-20 sm:pt-32 pb-16 px-4">
      <div className="container mx-auto" style={{ maxWidth: 900 }}>
        <div className="card" style={{ borderRadius: 16 }}>
          <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
          <p className="text-gray-700 mt-4 leading-relaxed">
            Duyurular ve rehber içerikler burada yayınlanacak.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
