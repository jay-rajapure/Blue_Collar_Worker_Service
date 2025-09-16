package com.byteminds.blue.colller.worker.service.Repository;

import com.byteminds.blue.colller.worker.service.models.Negotiation;
import com.byteminds.blue.colller.worker.service.models.NegotiationStatus;
import com.byteminds.blue.colller.worker.service.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NegotiationRepository extends JpaRepository<Negotiation, Long> {
    
    // Find negotiations by booking ID
    List<Negotiation> findByBookingId(Long bookingId);
    
    // Find negotiations by customer ID
    List<Negotiation> findByCustomerId(Long customerId);
    
    // Find negotiations by worker ID
    List<Negotiation> findByWorkerId(Long workerId);
    
    // Find negotiations by status
    List<Negotiation> findByStatus(NegotiationStatus status);
    
    // Find active negotiations for a customer
    @Query("SELECT n FROM Negotiation n WHERE n.customer.id = :customerId AND n.status = 'PENDING' ORDER BY n.createdAt DESC")
    List<Negotiation> findActiveNegotiationsByCustomer(@Param("customerId") Long customerId);
    
    // Find active negotiations for a worker
    @Query("SELECT n FROM Negotiation n WHERE n.worker.id = :workerId AND n.status = 'PENDING' ORDER BY n.createdAt DESC")
    List<Negotiation> findActiveNegotiationsByWorker(@Param("workerId") Long workerId);
    
    // Find current negotiation for a booking
    @Query("SELECT n FROM Negotiation n WHERE n.booking.id = :bookingId AND n.status = 'PENDING' ORDER BY n.createdAt DESC")
    Optional<Negotiation> findCurrentNegotiationByBooking(@Param("bookingId") Long bookingId);
}