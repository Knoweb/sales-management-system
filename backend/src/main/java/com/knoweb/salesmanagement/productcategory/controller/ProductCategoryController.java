package com.knoweb.salesmanagement.productcategory.controller;

import com.knoweb.salesmanagement.productcategory.dto.ProductCategoryDTO;
import com.knoweb.salesmanagement.productcategory.service.ProductCategoryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.knoweb.salesmanagement.productcategory.dto.ProductCategoryRequest;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/product-categories")
public class ProductCategoryController {

    private final ProductCategoryService productCategoryService;

    public ProductCategoryController(ProductCategoryService productCategoryService) {
        this.productCategoryService = productCategoryService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PRODUCT_CATEGORY_READ')")
    public List<ProductCategoryDTO> getActiveCategories() {
        return productCategoryService.getActiveCategories();
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('PRODUCT_CATEGORY_MANAGE')")
    public List<ProductCategoryDTO> getAllCategories() {
        return productCategoryService.getAllCategories();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PRODUCT_CATEGORY_MANAGE')")
    public ProductCategoryDTO createCategory(@Valid @RequestBody ProductCategoryRequest request) {
        return productCategoryService.createCategory(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_CATEGORY_MANAGE')")
    public ProductCategoryDTO updateCategory(@PathVariable UUID id, @Valid @RequestBody ProductCategoryRequest request) {
        return productCategoryService.updateCategory(id, request);
    }
}
