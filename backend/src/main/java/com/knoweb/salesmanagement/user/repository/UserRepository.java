package com.knoweb.salesmanagement.user.repository;

import com.knoweb.salesmanagement.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    
    List<User> findByRolesCode(String code);
    
    @Query("SELECT u FROM User u WHERE " +
           "(CAST(:search AS string) IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (CAST(:active AS boolean) IS NULL OR u.active = :active) " +
           "AND (CAST(:roleCode AS string) IS NULL OR EXISTS (SELECT r FROM u.roles r WHERE r.code = :roleCode)) " +
           "AND (CAST(:unlinked AS boolean) IS NULL OR :unlinked = false OR NOT EXISTS (SELECT e FROM Employee e WHERE e.user = u))")
    Page<User> searchUsers(@Param("search") String search, 
                           @Param("active") Boolean active, 
                           @Param("roleCode") String roleCode, 
                           @Param("unlinked") Boolean unlinked,
                           Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.code = 'SYSTEM_ADMIN' AND u.active = true")
    long countActiveSystemAdmins();
}
