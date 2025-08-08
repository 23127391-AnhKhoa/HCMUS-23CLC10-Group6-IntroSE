import React, { useState, useEffect } from 'react';
import { FiCode, FiPenTool, FiVideo, FiDatabase, FiBriefcase, FiUser } from 'react-icons/fi';

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);

  // Default categories with icons - matching database structure
  const defaultCategories = [
    {
      id: 1,
      name: 'Video & Animation',
      icon: <FiVideo className="w-8 h-8" />,
      description: 'Creating and editing videos, motion graphics, and animated content.',
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 2,
      name: 'Programming & Tech',
      icon: <FiCode className="w-8 h-8" />,
      description: 'Building and maintaining websites, mobile apps, and software.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 3,
      name: 'Data',
      icon: <FiDatabase className="w-8 h-8" />,
      description: 'Analyzing, organizing, and visualizing data to uncover insights.',
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 4,
      name: 'Graphic & Design',
      icon: <FiPenTool className="w-8 h-8" />,
      description: 'Designing logos, branding, and visual materials for digital and print.',
      color: 'bg-pink-100 text-pink-600'
    },
    {
      id: 5,
      name: 'Business',
      icon: <FiBriefcase className="w-8 h-8" />,
      description: 'Providing strategic consulting, market research, and business support.',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 6,
      name: 'Lifestyle',
      icon: <FiUser className="w-8 h-8" />,
      description: 'Offering coaching, planning, and advice for personal development and well-being.',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  useEffect(() => {
    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.data && data.data.length > 0) {
            // Filter only parent categories (parent_id = null) and exclude "General"
            const parentCategories = data.data
              .filter(cat => cat.parent_id === null && cat.name !== "General")
              .slice(0, 6); // Only take 6 categories
            
            // Map real categories with icons
            const mappedCategories = parentCategories.map((cat, index) => ({
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              icon: defaultCategories[index % defaultCategories.length]?.icon || <FiCode className="w-8 h-8" />,
              description: cat.description || `Professional ${cat.name.toLowerCase()} services`,
              color: defaultCategories[index % defaultCategories.length]?.color || 'bg-gray-100 text-gray-600'
            }));
            setCategories(mappedCategories);
          } else {
            setCategories(defaultCategories.slice(0, 6));
          }
        } else {
          setCategories(defaultCategories.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories(defaultCategories.slice(0, 6));
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`/search?category=${category.id}`}
              className="group p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 block no-underline text-inherit"
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
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
