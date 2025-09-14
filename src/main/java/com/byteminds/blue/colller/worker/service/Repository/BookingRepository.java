package com.byteminds.blue.colller.worker.service.Repository;

import com.byteminds.blue.colller.worker.service.models.Booking;
import com.byteminds.blue.colller.worker.service.models.BookingStatus;
import com.byteminds.blue.colller.worker.service.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    // Find bookings by customer
    List<Booking> findByCustomer(Users customer);
    
    // Find bookings by worker
    List<Booking> findByWorker(Users worker);
    
    // Find bookings by status
    List<Booking> findByStatus(BookingStatus status);
    
    // Find bookings by customer and status
    List<Booking> findByCustomerAndStatus(Users customer, BookingStatus status);
    
    // Find bookings by worker and status
    List<Booking> findByWorkerAndStatus(Users worker, BookingStatus status);
    
    // Find bookings by customer ID
    @Query("SELECT b FROM Booking b WHERE b.customer.id = :customerId")
    List<Booking> findByCustomerId(@Param("customerId") Long customerId);
    
    // Find bookings by worker ID
    @Query("SELECT b FROM Booking b WHERE b.worker.id = :workerId")
    List<Booking> findByWorkerId(@Param("workerId") Long workerId);
    
    // Find pending bookings for worker
    @Query("SELECT b FROM Booking b WHERE b.worker.id = :workerId AND b.status = 'PENDING'")
    List<Booking> findPendingBookingsForWorker(@Param("workerId") Long workerId);
    
    // Count bookings by status for worker
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.worker.id = :workerId AND b.status = :status")
    Long countBookingsByWorkerAndStatus(@Param("workerId") Long workerId, @Param("status") BookingStatus status);
}
