package com.knoweb.salesmanagement.productcategory.repository;

import com.knoweb.salesmanagement.productcategory.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, UUID> {
    List<ProductCategory> findByActiveTrueOrderByNameAsc();
}
