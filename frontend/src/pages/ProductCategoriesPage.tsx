import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { FilterBar } from '../components/FilterBar';
import { SearchInput } from '../components/SearchInput';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState, LoadingState, ErrorState } from '../components/FeedbackStates';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Edit, Plus, Package } from 'lucide-react';
import { Modal } from '../components/Modal';
import { FormField, Input, Select, Textarea, Checkbox } from '../components/Forms';
import { Alert } from '../components/Alert';
import { ProductCategoryApi, type ProductCategory, type ProductCategoryRequest } from '../api/productCategoryApi';

export const ProductCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductCategoryApi.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load product categories', err);
      setError('Failed to load product categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCategories();
  }, [loadCategories]);

  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const matchesSearch = !searchQuery || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || 
        (statusFilter === 'ACTIVE' && c.active) || 
        (statusFilter === 'INACTIVE' && !c.active);
      
      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  const handleOpenModal = (category?: ProductCategory) => {
    setEditingCategory(category || null);
    setIsModalOpen(true);
  };



  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader 
        title="Product Categories"
        description="Manage product and service categories for sales opportunities."
        icon={<Package size={24} />}
        actionElement={
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <Plus size={16} className="mr-2" />
            Add Category
          </Button>
        }
      />

      <FilterBar>
        <SearchInput
          placeholder="Search by code or name..."
          value={searchQuery}
          onSearch={setSearchQuery}
        />
        <div className="w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </div>
      </FilterBar>

      <div className="mt-6">
        {loading && categories.length === 0 ? (
          <LoadingState message="Loading product categories..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadCategories} />
        ) : filteredCategories.length === 0 ? (
          <EmptyState 
            icon={<Package size={48} />}
            title="No product categories found"
            message={searchQuery || statusFilter !== 'ALL' 
              ? "No categories match your filters. Try adjusting your search." 
              : "Get started by adding your first product category."}
            action={!searchQuery && statusFilter === 'ALL' ? (
              <Button onClick={() => handleOpenModal()}>Add Category</Button>
            ) : (
              <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}>Clear Filters</Button>
            )}
          />
        ) : (
          <div className="table-container">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Code</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Description</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader align="right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-text-primary">{item.code}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-text-secondary truncate max-w-xs block">{item.description || '-'}</TableCell>
                    <TableCell>
                      <StatusBadge 
                        status={item.active ? 'ACTIVE' : 'INACTIVE'} 
                        variant={item.active ? 'success' : 'neutral'} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        icon={<Edit size={16} />}
                        onClick={() => handleOpenModal(item)}
                        aria-label="Edit Category"
                        title="Edit Category"
                        variant="ghost"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ProductCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        onSuccess={() => {
          setIsModalOpen(false);
          void loadCategories();
        }}
      />
    </div>
  );
};

interface ProductCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ProductCategory | null;
  onSuccess: () => void;
}

const ProductCategoryModal: React.FC<ProductCategoryModalProps> = ({ isOpen, onClose, category, onSuccess }) => {
  const [formData, setFormData] = useState<ProductCategoryRequest>({
    code: '',
    name: '',
    description: '',
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          code: category.code,
          name: category.name,
          description: category.description || '',
          active: category.active
        });
      } else {
        setFormData({
          code: '',
          name: '',
          description: '',
          active: true
        });
      }
      setError(null);
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (category) {
        await ProductCategoryApi.updateCategory(category.id, formData);
      } else {
        await ProductCategoryApi.createCategory(formData);
      }
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to save product category');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Edit Product Category' : 'Add Product Category'}
      maxWidth="500px"
    >
      <div className="p-6">
        {error && <Alert variant="error" style={{ marginBottom: '1rem' }}>{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Category Code" required>
            <Input
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              maxLength={50}
              placeholder="e.g. SW-DEV"
              disabled={loading}
            />
          </FormField>
          
          <FormField label="Category Name" required>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={100}
              placeholder="e.g. Software Development"
              disabled={loading}
            />
          </FormField>
          
          <FormField label="Description">
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={500}
              rows={3}
              disabled={loading}
            />
          </FormField>

          <div className="pt-2">
            <Checkbox
              name="active"
              checked={formData.active}
              onChange={handleChange}
              label="Active (visible for new opportunities)"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              {category ? 'Save Changes' : 'Add Category'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ProductCategoriesPage;
