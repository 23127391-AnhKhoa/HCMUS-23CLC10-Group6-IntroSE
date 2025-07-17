const supabase = require('../config/supabaseClient');

// Get all categories
const getCategories = async (req, res) => {
    try {
        console.log('[Category Controller] Fetching categories...');
        
        // Query categories with their parent-child relationships
        const { data: categories, error } = await supabase
            .from('Categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('[Category Controller] Supabase error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Database error occurred',
                error: error.message
            });
        }

        // Organize categories into hierarchy (parent categories with children)
        const categoryMap = new Map();
        const rootCategories = [];

        // First pass: create map of all categories
        categories.forEach(category => {
            categoryMap.set(category.id, {
                ...category,
                children: []
            });
        });

        // Second pass: organize into hierarchy
        categories.forEach(category => {
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

        console.log('[Category Controller] Categories fetched successfully:', {
            total: categories.length,
            rootCategories: rootCategories.length
        });

        res.status(200).json({
            status: 'success',
            message: 'Categories retrieved successfully',
            data: rootCategories,
            pagination: {
                total: categories.length,
                root_categories: rootCategories.length
            }
        });

    } catch (error) {
        console.error('[Category Controller] Unexpected error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get category by ID
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`[Category Controller] Fetching category with ID: ${id}`);

        const { data: category, error } = await supabase
            .from('Categories')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    status: 'error',
                    message: 'Category not found'
                });
            }
            
            console.error('[Category Controller] Supabase error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Database error occurred',
                error: error.message
            });
        }

        // Get children categories if any
        const { data: children, error: childrenError } = await supabase
            .from('Categories')
            .select('*')
            .eq('parent_id', id)
            .order('name', { ascending: true });

        if (childrenError) {
            console.warn('[Category Controller] Error fetching children:', childrenError);
        }

        const result = {
            ...category,
            children: children || []
        };

        console.log(`[Category Controller] Category fetched successfully:`, category.name);

        res.status(200).json({
            status: 'success',
            message: 'Category retrieved successfully',
            data: result
        });

    } catch (error) {
        console.error('[Category Controller] Unexpected error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Create new category (Admin only)
const createCategory = async (req, res) => {
    try {
        const { name, slug, description, parent_id } = req.body;

        console.log('[Category Controller] Creating new category:', { name, slug, parent_id });

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                status: 'error',
                message: 'Category name is required'
            });
        }

        // Generate slug if not provided
        const finalSlug = slug || name.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim();

        const { data: category, error } = await supabase
            .from('Categories')
            .insert([{
                name: name.trim(),
                slug: finalSlug,
                description: description?.trim() || null,
                parent_id: parent_id || null
            }])
            .select()
            .single();

        if (error) {
            console.error('[Category Controller] Create error:', error);
            
            if (error.code === '23505') {
                return res.status(409).json({
                    status: 'error',
                    message: 'Category with this name or slug already exists'
                });
            }
            
            return res.status(500).json({
                status: 'error',
                message: 'Database error occurred',
                error: error.message
            });
        }

        console.log('[Category Controller] Category created successfully:', category.name);

        res.status(201).json({
            status: 'success',
            message: 'Category created successfully',
            data: category
        });

    } catch (error) {
        console.error('[Category Controller] Unexpected error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory
};