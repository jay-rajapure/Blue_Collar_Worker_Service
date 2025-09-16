package com.byteminds.blue.colller.worker.service.service;

import com.byteminds.blue.colller.worker.service.Repository.BookingRepository;
import com.byteminds.blue.colller.worker.service.Repository.NegotiationRepository;
import com.byteminds.blue.colller.worker.service.Repository.UsersRepository;
import com.byteminds.blue.colller.worker.service.models.Booking;
import com.byteminds.blue.colller.worker.service.models.BookingStatus;
import com.byteminds.blue.colller.worker.service.models.Negotiation;
import com.byteminds.blue.colller.worker.service.models.NegotiationStatus;
import com.byteminds.blue.colller.worker.service.models.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NegotiationService {
    
    @Autowired
    private NegotiationRepository negotiationRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UsersRepository usersRepository;
    
    /**
     * Initiate a negotiation for a booking
     */
    public Negotiation initiateNegotiation(Long bookingId, Long customerId, Double proposedAmount, String message) throws Exception {
        // Validate booking exists and belongs to customer
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            throw new Exception("Booking not found");
        }
        
        Booking booking = bookingOpt.get();
        if (!booking.getCustomer().getId().equals(customerId)) {
            throw new Exception("Unauthorized: Booking does not belong to customer");
        }
        
        // Validate worker exists
        if (booking.getWorker() == null) {
            throw new Exception("No worker assigned to this booking");
        }
        
        // Check if there's already an active negotiation
        Optional<Negotiation> existingNegotiation = negotiationRepository.findCurrentNegotiationByBooking(bookingId);
        if (existingNegotiation.isPresent()) {
            throw new Exception("A negotiation is already in progress for this booking");
        }
        
        // Create negotiation
        Negotiation negotiation = new Negotiation(
            booking, 
            booking.getCustomer(), 
            booking.getWorker(), 
            proposedAmount, 
            message
        );
        
        return negotiationRepository.save(negotiation);
    }
    
    /**
     * Worker responds to a negotiation
     */
    public Negotiation respondToNegotiation(Long negotiationId, Long workerId, String workerMessage, NegotiationStatus status) throws Exception {
        Optional<Negotiation> negotiationOpt = negotiationRepository.findById(negotiationId);
        if (negotiationOpt.isEmpty()) {
            throw new Exception("Negotiation not found");
        }
        
        Negotiation negotiation = negotiationOpt.get();
        if (!negotiation.getWorker().getId().equals(workerId)) {
            throw new Exception("Unauthorized: Negotiation does not belong to worker");
        }
        
        if (negotiation.getStatus() != NegotiationStatus.PENDING) {
            throw new Exception("Negotiation is no longer active");
        }
        
        // Update negotiation
        negotiation.setWorkerMessage(workerMessage);
        negotiation.setStatus(status);
        
        Negotiation updatedNegotiation = negotiationRepository.save(negotiation);
        
        // If accepted, update booking amount
        if (status == NegotiationStatus.ACCEPTED) {
            Booking booking = negotiation.getBooking();
            booking.setTotalAmount(negotiation.getProposedAmount());
            bookingRepository.save(booking);
        }
        
        return updatedNegotiation;
    }
    
    /**
     * Get negotiations for a customer
     */
    public List<Negotiation> getNegotiationsForCustomer(Long customerId) {
        return negotiationRepository.findByCustomerId(customerId);
    }
    
    /**
     * Get negotiations for a worker
     */
    public List<Negotiation> getNegotiationsForWorker(Long workerId) {
        return negotiationRepository.findByWorkerId(workerId);
    }
    
    /**
     * Get active negotiations for a customer
     */
    public List<Negotiation> getActiveNegotiationsForCustomer(Long customerId) {
        return negotiationRepository.findActiveNegotiationsByCustomer(customerId);
    }
    
    /**
     * Get active negotiations for a worker
     */
    public List<Negotiation> getActiveNegotiationsForWorker(Long workerId) {
        return negotiationRepository.findActiveNegotiationsByWorker(workerId);
    }
    
    /**
     * Cancel a negotiation (customer action)
     */
    public Negotiation cancelNegotiation(Long negotiationId, Long customerId) throws Exception {
        Optional<Negotiation> negotiationOpt = negotiationRepository.findById(negotiationId);
        if (negotiationOpt.isEmpty()) {
            throw new Exception("Negotiation not found");
        }
        
        Negotiation negotiation = negotiationOpt.get();
        if (!negotiation.getCustomer().getId().equals(customerId)) {
            throw new Exception("Unauthorized: Negotiation does not belong to customer");
        }
        
        if (negotiation.getStatus() != NegotiationStatus.PENDING) {
            throw new Exception("Negotiation is no longer active");
        }
        
        negotiation.setStatus(NegotiationStatus.CANCELLED);
        return negotiationRepository.save(negotiation);
    }
}