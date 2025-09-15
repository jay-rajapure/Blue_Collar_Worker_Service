package com.byteminds.blue.colller.worker.service.Repository;

import com.byteminds.blue.colller.worker.service.models.Users;
import com.byteminds.blue.colller.worker.service.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users,Long> {

    Optional<Users> findByEmail(String email);
    
    // Find available workers by role and availability
    List<Users> findByRoleAndIsAvailableTrue(Role role);
    
    // Find available workers with rating above threshold
    @Query("SELECT u FROM Users u WHERE u.role = :role AND u.isAvailable = true AND u.rating >= :minRating ORDER BY u.rating DESC, u.experienceYears DESC")
    List<Users> findTopWorkersByRating(@Param("role") Role role, @Param("minRating") Double minRating);
    
    // Find available workers near location (basic distance calculation)
    @Query("SELECT u FROM Users u WHERE u.role = :role AND u.isAvailable = true " +
           "AND u.latitude IS NOT NULL AND u.longitude IS NOT NULL " +
           "ORDER BY (ABS(u.latitude - :latitude) + ABS(u.longitude - :longitude)) ASC, u.rating DESC")
    List<Users> findWorkersByLocation(@Param("role") Role role, @Param("latitude") Double latitude, @Param("longitude") Double longitude);
    
    // Find workers excluding specific IDs (for reassignment)
    @Query("SELECT u FROM Users u WHERE u.role = :role AND u.isAvailable = true AND u.id NOT IN :excludedIds ORDER BY u.rating DESC, u.experienceYears DESC")
    List<Users> findAvailableWorkersExcluding(@Param("role") Role role, @Param("excludedIds") List<Long> excludedIds);
}
