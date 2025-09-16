package com.byteminds.blue.colller.worker.service.Controller;

import com.byteminds.blue.colller.worker.service.models.Negotiation;
import com.byteminds.blue.colller.worker.service.models.NegotiationStatus;
import com.byteminds.blue.colller.worker.service.models.Users;
import com.byteminds.blue.colller.worker.service.service.NegotiationService;
import com.byteminds.blue.colller.worker.service.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/negotiations")
@CrossOrigin(origins = "*")
public class NegotiationController {
    
    @Autowired
    private NegotiationService negotiationService;
    
    @Autowired
    private UsersService usersService;
    
    /**
     * Initiate a negotiation for a booking
     */
    @PostMapping("/initiate")
    public ResponseEntity<?> initiateNegotiation(
            @RequestHeader("Authorization") String jwt,
            @RequestParam Long bookingId,
            @RequestParam Double proposedAmount,
            @RequestParam String message) {
        try {
            Users customer = usersService.findByJwtToken(jwt);
            
            Negotiation negotiation = negotiationService.initiateNegotiation(
                bookingId, customer.getId(), proposedAmount, message);
            
            return ResponseEntity.ok(Map.of(
                "message", "Negotiation initiated successfully",
                "negotiationId", negotiation.getId()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Worker responds to a negotiation
     */
    @PostMapping("/{negotiationId}/respond")
    public ResponseEntity<?> respondToNegotiation(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long negotiationId,
            @RequestParam String workerMessage,
            @RequestParam NegotiationStatus status) {
        try {
            Users worker = usersService.findByJwtToken(jwt);
            
            Negotiation negotiation = negotiationService.respondToNegotiation(
                negotiationId, worker.getId(), workerMessage, status);
            
            return ResponseEntity.ok(Map.of(
                "message", "Negotiation response recorded successfully",
                "negotiation", negotiation
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get negotiations for current user
     */
    @GetMapping("/my-negotiations")
    public ResponseEntity<?> getMyNegotiations(@RequestHeader("Authorization") String jwt) {
        try {
            Users user = usersService.findByJwtToken(jwt);
            
            List<Negotiation> negotiations;
            if ("CUSTOMER".equals(user.getRole().toString())) {
                negotiations = negotiationService.getNegotiationsForCustomer(user.getId());
            } else if ("WORKER".equals(user.getRole().toString())) {
                negotiations = negotiationService.getNegotiationsForWorker(user.getId());
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            return ResponseEntity.ok(negotiations);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch negotiations"));
        }
    }
    
    /**
     * Get active negotiations for current user
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveNegotiations(@RequestHeader("Authorization") String jwt) {
        try {
            Users user = usersService.findByJwtToken(jwt);
            
            List<Negotiation> negotiations;
            if ("CUSTOMER".equals(user.getRole().toString())) {
                negotiations = negotiationService.getActiveNegotiationsForCustomer(user.getId());
            } else if ("WORKER".equals(user.getRole().toString())) {
                negotiations = negotiationService.getActiveNegotiationsForWorker(user.getId());
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            return ResponseEntity.ok(negotiations);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch active negotiations"));
        }
    }
    
    /**
     * Cancel a negotiation (customer action)
     */
    @PostMapping("/{negotiationId}/cancel")
    public ResponseEntity<?> cancelNegotiation(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long negotiationId) {
        try {
            Users customer = usersService.findByJwtToken(jwt);
            
            Negotiation negotiation = negotiationService.cancelNegotiation(
                negotiationId, customer.getId());
            
            return ResponseEntity.ok(Map.of(
                "message", "Negotiation cancelled successfully",
                "negotiation", negotiation
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
}