package com.byteminds.blue.colller.worker.service.Controller;

import com.byteminds.blue.colller.worker.service.Response.BookingResponse;
import com.byteminds.blue.colller.worker.service.models.BookingStatus;
import com.byteminds.blue.colller.worker.service.models.Users;
import com.byteminds.blue.colller.worker.service.request.BookingRequest;
import com.byteminds.blue.colller.worker.service.request.AutoBookingRequest;
import com.byteminds.blue.colller.worker.service.service.BookingService;
import com.byteminds.blue.colller.worker.service.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    
    @Autowired
    private BookingService bookingService;
    
    @Autowired
    private UsersService usersService;
    
    // Create a new booking with auto-assignment
    @PostMapping("/auto")
    public ResponseEntity<BookingResponse> createAutoBooking(
            @RequestHeader("Authorization") String jwt,
            @RequestBody AutoBookingRequest bookingRequest) {
        try {
            Users customer = usersService.findByJwtToken(jwt);
            BookingResponse booking = bookingService.createAutoBooking(bookingRequest, customer.getId());
            return new ResponseEntity<>(booking, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
    
    // Create a new booking (original method)
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @RequestHeader("Authorization") String jwt,
            @RequestBody BookingRequest bookingRequest) {
        try {
            Users customer = usersService.findByJwtToken(jwt);
            BookingResponse booking = bookingService.createBooking(bookingRequest, customer.getId());
            return new ResponseEntity<>(booking, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
    
    // Get all bookings (admin only)
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        List<BookingResponse> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }
    
    // Get booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        Optional<BookingResponse> booking = bookingService.getBookingById(id);
        return booking.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    // Get bookings for current user (customer or worker)
    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @RequestHeader("Authorization") String jwt) {
        try {
            Users user = usersService.findByJwtToken(jwt);
            List<BookingResponse> bookings;
            
            if ("CUSTOMER".equals(user.getRole().toString())) {
                bookings = bookingService.getBookingsByCustomerId(user.getId());
            } else if ("WORKER".equals(user.getRole().toString())) {
                bookings = bookingService.getBookingsByWorkerId(user.getId());
            } else {
                return ResponseEntity.badRequest().build();
            }
            
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get bookings by customer ID
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByCustomerId(@PathVariable Long customerId) {
        List<BookingResponse> bookings = bookingService.getBookingsByCustomerId(customerId);
        return ResponseEntity.ok(bookings);
    }
    
    // Get bookings by worker ID
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByWorkerId(@PathVariable Long workerId) {
        List<BookingResponse> bookings = bookingService.getBookingsByWorkerId(workerId);
        return ResponseEntity.ok(bookings);
    }
    
    // Get pending bookings for worker
    @GetMapping("/worker/{workerId}/pending")
    public ResponseEntity<List<BookingResponse>> getPendingBookingsForWorker(@PathVariable Long workerId) {
        List<BookingResponse> bookings = bookingService.getPendingBookingsForWorker(workerId);
        return ResponseEntity.ok(bookings);
    }
    
    // Update booking status
    @PutMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status) {
        try {
            BookingResponse booking = bookingService.updateBookingStatus(id, status);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Accept booking (for workers)
    @PutMapping("/{id}/accept")
    public ResponseEntity<BookingResponse> acceptBooking(
            @PathVariable Long id,
            @RequestHeader("Authorization") String jwt) {
        try {
            Users worker = usersService.findByJwtToken(jwt);
            BookingResponse booking = bookingService.acceptBooking(id);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Reject booking (for workers)
    @PutMapping("/{id}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable Long id,
            @RequestHeader("Authorization") String jwt) {
        try {
            Users worker = usersService.findByJwtToken(jwt);
            BookingResponse booking = bookingService.rejectBooking(id);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Start work
    @PutMapping("/{id}/start")
    public ResponseEntity<BookingResponse> startWork(
            @PathVariable Long id,
            @RequestHeader("Authorization") String jwt) {
        try {
            Users worker = usersService.findByJwtToken(jwt);
            BookingResponse booking = bookingService.startWork(id);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Complete work
    @PutMapping("/{id}/complete")
    public ResponseEntity<BookingResponse> completeWork(
            @PathVariable Long id,
            @RequestHeader("Authorization") String jwt) {
        try {
            Users worker = usersService.findByJwtToken(jwt);
            BookingResponse booking = bookingService.completeWork(id);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Cancel booking
    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @RequestHeader("Authorization") String jwt) {
        try {
            Users user = usersService.findByJwtToken(jwt);
            BookingResponse booking = bookingService.cancelBooking(id);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Delete booking
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
    
    // Reject assigned worker (customer action)
    @PutMapping("/{id}/reject-worker")
    public ResponseEntity<BookingResponse> rejectAssignedWorker(
            @PathVariable Long id,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) String rejectionReason) {
        try {
            Users customer = usersService.findByJwtToken(jwt);
            if (!"CUSTOMER".equals(customer.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            String reason = rejectionReason != null ? rejectionReason : "Customer requested different worker";
            BookingResponse booking = bookingService.rejectAssignedWorker(id, reason);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Accept worker assignment (worker action)
    @PutMapping("/{id}/accept-assignment")
    public ResponseEntity<BookingResponse> acceptWorkerAssignment(
            @PathVariable Long id,
            @RequestHeader("Authorization") String jwt) {
        try {
            Users worker = usersService.findByJwtToken(jwt);
            if (!"WORKER".equals(worker.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            BookingResponse booking = bookingService.acceptWorkerAssignment(id, worker.getId());
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Reject worker assignment (worker action)
    @PutMapping("/{id}/reject-assignment")
    public ResponseEntity<BookingResponse> rejectWorkerAssignment(
            @PathVariable Long id,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) String rejectionReason) {
        try {
            Users worker = usersService.findByJwtToken(jwt);
            if (!"WORKER".equals(worker.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            String reason = rejectionReason != null ? rejectionReason : "Worker unable to take this job";
            BookingResponse booking = bookingService.rejectWorkerAssignment(id, worker.getId(), reason);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
