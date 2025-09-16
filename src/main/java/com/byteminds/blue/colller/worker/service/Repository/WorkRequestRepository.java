package com.byteminds.blue.colller.worker.service.Repository;

import com.byteminds.blue.colller.worker.service.models.WorkRequest;
import com.byteminds.blue.colller.worker.service.models.WorkRequestStatus;
import com.byteminds.blue.colller.worker.service.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkRequestRepository extends JpaRepository<WorkRequest, Long> {
    
    List<WorkRequest> findByCustomer(Users customer);
    
    List<WorkRequest> findByStatus(WorkRequestStatus status);
    
    List<WorkRequest> findByCategory(String category);
    
    List<WorkRequest> findByAssignedWorker(Users worker);
    
    @Query("SELECT wr FROM WorkRequest wr WHERE wr.status = :status ORDER BY wr.createdAt DESC")
    List<WorkRequest> findByStatusOrderByCreatedAtDesc(@Param("status") WorkRequestStatus status);
    
    @Query("SELECT wr FROM WorkRequest wr WHERE wr.category = :category AND wr.status = 'OPEN' ORDER BY wr.createdAt DESC")
    List<WorkRequest> findOpenRequestsByCategory(@Param("category") String category);
    
    @Query("SELECT wr FROM WorkRequest wr WHERE wr.status = 'OPEN' AND " +
           "(:category IS NULL OR wr.category = :category) AND " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(wr.latitude)) * " +
           "cos(radians(wr.longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(wr.latitude)))) <= :radius " +
           "ORDER BY wr.createdAt DESC")
    List<WorkRequest> findOpenRequestsNearLocation(
        @Param("latitude") Double latitude,
        @Param("longitude") Double longitude,
        @Param("radius") Double radius,
        @Param("category") String category
    );
}