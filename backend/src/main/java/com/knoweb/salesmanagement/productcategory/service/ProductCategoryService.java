package com.knoweb.salesmanagement.productcategory.service;

import com.knoweb.salesmanagement.productcategory.dto.ProductCategoryDTO;
import com.knoweb.salesmanagement.productcategory.entity.ProductCategory;
import com.knoweb.salesmanagement.productcategory.repository.ProductCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.productcategory.dto.ProductCategoryRequest;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.knoweb.salesmanagement.common.exception.ResourceConflictException;

@Service
@Transactional(readOnly = true)
public class ProductCategoryService {

    private final ProductCategoryRepository productCategoryRepository;

    public ProductCategoryService(ProductCategoryRepository productCategoryRepository) {
        this.productCategoryRepository = productCategoryRepository;
    }

    public List<ProductCategoryDTO> getActiveCategories() {
        return productCategoryRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductCategoryDTO> getAllCategories() {
        return productCategoryRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductCategoryDTO createCategory(ProductCategoryRequest request) {
        if (productCategoryRepository.existsByCode(request.getCode())) {
            throw new ResourceConflictException("Product category with code '" + request.getCode() + "' already exists");
        }
        if (productCategoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ResourceConflictException("Product category with name '" + request.getName() + "' already exists");
        }
        ProductCategory entity = new ProductCategory();
        entity.setCode(request.getCode());
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setActive(request.isActive());
        entity = productCategoryRepository.save(entity);
        return mapToDTO(entity);
    }

    @Transactional
    public ProductCategoryDTO updateCategory(UUID id, ProductCategoryRequest request) {
        ProductCategory entity = productCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (productCategoryRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new ResourceConflictException("Product category with code '" + request.getCode() + "' already exists");
        }
        if (productCategoryRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new ResourceConflictException("Product category with name '" + request.getName() + "' already exists");
        }

        entity.setCode(request.getCode());
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setActive(request.isActive());
        entity = productCategoryRepository.save(entity);
        return mapToDTO(entity);
    }

    private ProductCategoryDTO mapToDTO(ProductCategory entity) {
        ProductCategoryDTO dto = new ProductCategoryDTO();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setActive(entity.isActive());
        return dto;
    }
}
