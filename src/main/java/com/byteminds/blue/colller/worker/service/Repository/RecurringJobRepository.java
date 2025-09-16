package com.byteminds.blue.colller.worker.service.Repository;

import com.byteminds.blue.colller.worker.service.models.RecurringJob;
import com.byteminds.blue.colller.worker.service.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecurringJobRepository extends JpaRepository<RecurringJob, Long> {
    
    // Find recurring jobs by customer
    List<RecurringJob> findByCustomerId(Long customerId);
    
    // Find active recurring jobs by customer
    List<RecurringJob> findByCustomerIdAndIsActiveTrue(Long customerId);
    
    // Find active recurring jobs by category
    List<RecurringJob> findByCategoryAndIsActiveTrue(String category);
    
    // Find active recurring jobs near location (within 10km)
    @Query("SELECT rj FROM RecurringJob rj WHERE rj.isActive = true AND " +
           "(:category IS NULL OR rj.category = :category) AND " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(rj.latitude)) * " +
           "cos(radians(rj.longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(rj.latitude)))) <= :radius " +
           "ORDER BY rj.createdAt DESC")
    List<RecurringJob> findActiveJobsNearLocation(
        @Param("latitude") Double latitude,
        @Param("longitude") Double longitude,
        @Param("radius") Double radius,
        @Param("category") String category
    );
}