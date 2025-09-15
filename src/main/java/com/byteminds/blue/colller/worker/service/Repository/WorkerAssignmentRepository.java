package com.byteminds.blue.colller.worker.service.Repository;

import com.byteminds.blue.colller.worker.service.models.WorkerAssignment;
import com.byteminds.blue.colller.worker.service.models.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerAssignmentRepository extends JpaRepository<WorkerAssignment, Long> {
    
    // Get all assignments for a booking ordered by assignment order
    List<WorkerAssignment> findByBookingIdOrderByAssignmentOrderAsc(Long bookingId);
    
    // Get current active assignment for a booking
    @Query("SELECT wa FROM WorkerAssignment wa WHERE wa.booking.id = :bookingId AND wa.status = :status ORDER BY wa.assignmentOrder DESC")
    Optional<WorkerAssignment> findCurrentAssignmentByBookingIdAndStatus(@Param("bookingId") Long bookingId, @Param("status") AssignmentStatus status);
    
    // Get assignments for a specific worker
    List<WorkerAssignment> findByWorkerIdOrderByAssignedAtDesc(Long workerId);
    
    // Get rejected workers for a booking to avoid reassigning
    @Query("SELECT wa.worker.id FROM WorkerAssignment wa WHERE wa.booking.id = :bookingId AND wa.status IN ('REJECTED_BY_WORKER', 'REJECTED_BY_CUSTOMER')")
    List<Long> findRejectedWorkerIdsByBookingId(@Param("bookingId") Long bookingId);
    
    // Get current assignment order for a booking
    @Query("SELECT COALESCE(MAX(wa.assignmentOrder), 0) FROM WorkerAssignment wa WHERE wa.booking.id = :bookingId")
    Integer getMaxAssignmentOrderByBookingId(@Param("bookingId") Long bookingId);
}