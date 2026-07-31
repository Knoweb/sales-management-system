package com.knoweb.salesmanagement.productcategory.service;

import com.knoweb.salesmanagement.common.exception.ResourceConflictException;
import com.knoweb.salesmanagement.productcategory.dto.ProductCategoryDTO;
import com.knoweb.salesmanagement.productcategory.dto.ProductCategoryRequest;
import com.knoweb.salesmanagement.productcategory.entity.ProductCategory;
import com.knoweb.salesmanagement.productcategory.repository.ProductCategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductCategoryServiceTest {

    @Mock
    private ProductCategoryRepository productCategoryRepository;

    @InjectMocks
    private ProductCategoryService productCategoryService;

    private ProductCategory category;

    @BeforeEach
    void setUp() {
        category = new ProductCategory();
        category.setId(UUID.randomUUID());
        category.setCode("SAAS_STD");
        category.setName("Standard SaaS");
        category.setActive(true);
    }

    @Test
    void testGetActiveCategories() {
        when(productCategoryRepository.findByActiveTrueOrderByNameAsc())
                .thenReturn(Collections.singletonList(category));

        List<ProductCategoryDTO> list = productCategoryService.getActiveCategories();

        assertEquals(1, list.size());
        assertEquals("SAAS_STD", list.get(0).getCode());
    }

    @Test
    void testCreateCategory_Success() {
        when(productCategoryRepository.existsByCode("NEW_CAT")).thenReturn(false);
        when(productCategoryRepository.existsByNameIgnoreCase("New Category")).thenReturn(false);
        when(productCategoryRepository.save(any())).thenAnswer(inv -> {
            ProductCategory pc = inv.getArgument(0);
            pc.setId(UUID.randomUUID());
            return pc;
        });

        ProductCategoryRequest request = new ProductCategoryRequest();
        request.setCode("NEW_CAT");
        request.setName("New Category");

        ProductCategoryDTO result = productCategoryService.createCategory(request);

        assertNotNull(result);
        assertEquals("NEW_CAT", result.getCode());
        verify(productCategoryRepository).save(any());
    }

    @Test
    void testCreateCategory_RejectsDuplicateCode() {
        when(productCategoryRepository.existsByCode("SAAS_STD")).thenReturn(true);

        ProductCategoryRequest request = new ProductCategoryRequest();
        request.setCode("SAAS_STD");
        request.setName("Another Name");

        assertThrows(ResourceConflictException.class, () ->
                productCategoryService.createCategory(request)
        );
    }

    @Test
    void testCreateCategory_RejectsDuplicateName() {
        when(productCategoryRepository.existsByCode("UNIQUE_CODE")).thenReturn(false);
        when(productCategoryRepository.existsByNameIgnoreCase("Standard SaaS")).thenReturn(true);

        ProductCategoryRequest request = new ProductCategoryRequest();
        request.setCode("UNIQUE_CODE");
        request.setName("Standard SaaS");

        assertThrows(ResourceConflictException.class, () ->
                productCategoryService.createCategory(request)
        );
    }
}
