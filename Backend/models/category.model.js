// models/category.model.js
const supabase = require('../config/supabaseClient');

// Helper function to execute query with retry using fresh connection
const executeQueryWithRetry = async (queryFunction, queryName = 'unknown') => {
  try {
    const result = await queryFunction(supabase);
    
    // If we get empty results, just return them (no retry needed)
    if (result.data && Array.isArray(result.data) && result.data.length === 0) {
      console.log(`Category Query ${queryName} returned no results`);
      return result;
    }
    
    // If we get a count of 0, just return it (no retry needed)
    if (result.count === 0) {
      console.log(`Category Query ${queryName} returned count of 0`);
      return result;
    }
    
    return result;
  } catch (error) {
    console.error(`Category Model Error in ${queryName}:`, error);
    throw error;
  }
};

const Category = {
  // Find all categories
  findAll: async () => {
    try {
      const queryFunction = async (client) => {
        const result = await client
          .from('Categories')
          .select('*')
          .order('name', { ascending: true });
        
        if (result.error) {
          throw result.error;
        }
        
        return result;
      };
      
      const result = await executeQueryWithRetry(queryFunction, 'findAll');
      return result.data;
      
    } catch (error) {
      console.error('Category Model Error in findAll:', error);
      throw error;
    }
  },

  // Find category by ID
  findById: async (id) => {
    try {
      const queryFunction = async (client) => {
        const result = await client
          .from('Categories')
          .select('*')
          .eq('id', id)
          .single();
        
        if (result.error && result.error.code !== 'PGRST116') {
          throw result.error;
        }
        
        return result;
      };
      
      const result = await executeQueryWithRetry(queryFunction, 'findById');
      return result.data;
      
    } catch (error) {
      console.error('Category Model Error in findById:', error);
      throw error;
    }
  },

  // Find children categories by parent ID
  findByParentId: async (parentId) => {
    try {
      const queryFunction = async (client) => {
        const result = await client
          .from('Categories')
          .select('*')
          .eq('parent_id', parentId)
          .order('name', { ascending: true });
        
        if (result.error) {
          throw result.error;
        }
        
        return result;
      };
      
      const result = await executeQueryWithRetry(queryFunction, 'findByParentId');
      return result.data;
      
    } catch (error) {
      console.error('Category Model Error in findByParentId:', error);
      throw error;
    }
  },

  // Find root categories (parent_id is null)
  findRootCategories: async () => {
    try {
      const queryFunction = async (client) => {
        const result = await client
          .from('Categories')
          .select('*')
          .is('parent_id', null)
          .order('name', { ascending: true });
        
        if (result.error) {
          throw result.error;
        }
        
        return result;
      };
      
      const result = await executeQueryWithRetry(queryFunction, 'findRootCategories');
      return result.data;
      
    } catch (error) {
      console.error('Category Model Error in findRootCategories:', error);
      throw error;
    }
  },

  // Find category with its children
  findWithChildren: async (id) => {
    try {
      // Get the category
      const category = await Category.findById(id);
      if (!category) {
        return null;
      }

      // Get its children
      const children = await Category.findByParentId(id);
      
      return {
        ...category,
        children: children || []
      };
      
    } catch (error) {
      console.error('Category Model Error in findWithChildren:', error);
      throw error;
    }
  },

  // Get hierarchical structure of all categories
  findHierarchical: async () => {
    try {
      // Get all categories
      const allCategories = await Category.findAll();
      
      // Organize categories into hierarchy
      const categoryMap = new Map();
      const rootCategories = [];

      // First pass: create map of all categories
      allCategories.forEach(category => {
        categoryMap.set(category.id, {
          ...category,
          children: []
        });
      });

      // Second pass: organize into hierarchy
      allCategories.forEach(category => {
        if (category.parent_id === null) {
          // This is a root category
          rootCategories.push(categoryMap.get(category.id));
        } else {
          // This is a child category
          const parent = categoryMap.get(category.parent_id);
          if (parent) {
            parent.children.push(categoryMap.get(category.id));
          }
        }
      });

      return rootCategories;
      
    } catch (error) {
      console.error('Category Model Error in findHierarchical:', error);
      throw error;
    }
  },

  // Create a new category
  create: async (categoryData) => {
    try {
      const queryFunction = async (client) => {
        const result = await client
          .from('Categories')
          .insert([categoryData])
          .select()
          .single();
        
        if (result.error) {
          throw result.error;
        }
        
        return result;
      };
      
      const result = await executeQueryWithRetry(queryFunction, 'create');
      return result.data;
      
    } catch (error) {
      console.error('Category Model Error in create:', error);
      throw error;
    }
  },

  // Update category by ID
  updateById: async (id, updateData) => {
    try {
      const queryFunction = async (client) => {
        const result = await client
          .from('Categories')
          .update({ ...updateData, updated_at: new Date() })
          .eq('id', id)
          .select()
          .single();
        
        if (result.error) {
          throw result.error;
        }
        
        return result;
      };
      
      const result = await executeQueryWithRetry(queryFunction, 'updateById');
      return result.data;
      
    } catch (error) {
      console.error('Category Model Error in updateById:', error);
      throw error;
    }
  },

  // Delete category by ID
  deleteById: async (id) => {
    try {
      const queryFunction = async (client) => {
        const result = await client
          .from('Categories')
          .delete()
          .eq('id', id)
          .select()
          .single();
        
        if (result.error) {
          throw result.error;
        }
        
        return result;
      };
      
      const result = await executeQueryWithRetry(queryFunction, 'deleteById');
      return result.data;
      
    } catch (error) {
      console.error('Category Model Error in deleteById:', error);
      throw error;
    }
  },

  // Check if category exists by slug
  findBySlug: async (slug) => {
    try {
      const queryFunction = async (client) => {
        const result = await client
          .from('Categories')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (result.error && result.error.code !== 'PGRST116') {
          throw result.error;
        }
        
        return result;
      };
      
      const result = await executeQueryWithRetry(queryFunction, 'findBySlug');
      return result.data;
      
    } catch (error) {
      console.error('Category Model Error in findBySlug:', error);
      throw error;
    }
  },

  // Get count of categories
  getCount: async (filters = {}) => {
    try {
      const queryFunction = async (client) => {
        let query = client
          .from('Categories')
          .select('*', { count: 'exact', head: true });

        if (filters.parent_id !== undefined) {
          if (filters.parent_id === null) {
            query = query.is('parent_id', null);
          } else {
            query = query.eq('parent_id', filters.parent_id);
          }
        }

        const result = await query;
        
        if (result.error) {
          throw result.error;
        }
        
        return result;
      };

      const result = await executeQueryWithRetry(queryFunction, 'getCount');
      return result.count;
      
    } catch (error) {
      console.error('Category Model Error in getCount:', error);
      throw error;
    }
  }
};

module.exports = Category;
