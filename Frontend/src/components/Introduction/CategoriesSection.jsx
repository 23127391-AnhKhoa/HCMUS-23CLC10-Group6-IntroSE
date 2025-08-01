import React, { useState, useEffect } from 'react';
import { FiCode, FiPenTool, FiVideo, FiTrendingUp, FiMusic, FiEdit3, FiCamera, FiSpeaker } from 'react-icons/fi';

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);

  // Default categories with icons
  const defaultCategories = [
    {
      id: 1,
      name: 'Programming & Tech',
      icon: <FiCode className="w-8 h-8" />,
      description: 'Web development, mobile apps, software solutions',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      name: 'Graphics & Design',
      icon: <FiPenTool className="w-8 h-8" />,
      description: 'Logo design, branding, web design, illustrations',
      color: 'bg-pink-100 text-pink-600'
    },
    {
      id: 3,
      name: 'Video & Animation',
      icon: <FiVideo className="w-8 h-8" />,
      description: 'Video editing, motion graphics, 3D animation',
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 4,
      name: 'Digital Marketing',
      icon: <FiTrendingUp className="w-8 h-8" />,
      description: 'SEO, social media marketing, content marketing',
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 5,
      name: 'Music & Audio',
      icon: <FiMusic className="w-8 h-8" />,
      description: 'Audio editing, voice overs, music production',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 6,
      name: 'Writing & Translation',
      icon: <FiEdit3 className="w-8 h-8" />,
      description: 'Content writing, copywriting, translation services',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 7,
      name: 'Photography',
      icon: <FiCamera className="w-8 h-8" />,
      description: 'Photo editing, product photography, portraits',
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      id: 8,
      name: 'Business',
      icon: <FiSpeaker className="w-8 h-8" />,
      description: 'Business consulting, market research, presentations',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  useEffect(() => {
    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          // Map API data with default icons
          const mappedCategories = data.map((cat, index) => ({
            ...cat,
            icon: defaultCategories[index % defaultCategories.length]?.icon || <FiCode className="w-8 h-8" />,
            color: defaultCategories[index % defaultCategories.length]?.color || 'bg-gray-100 text-gray-600'
          }));
          setCategories(mappedCategories);
        } else {
          setCategories(defaultCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories(defaultCategories);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Popular Categories
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover services across various categories and find the perfect freelancer for your project
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, 8).map((category) => (
            <div
              key={category.id}
              className="group p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
            >
              <div className={`w-16 h-16 ${category.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {category.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {category.description}
              </p>
              <div className="text-sm text-purple-600 font-medium group-hover:underline">
                Explore services →
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-300">
            View All Categories
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
