package com.byteminds.blue.colller.worker.service.service;

import com.byteminds.blue.colller.worker.service.Repository.BookingRepository;
import com.byteminds.blue.colller.worker.service.Repository.UsersRepository;
import com.byteminds.blue.colller.worker.service.Repository.WorkRepository;
import com.byteminds.blue.colller.worker.service.Response.BookingResponse;
import com.byteminds.blue.colller.worker.service.models.Booking;
import com.byteminds.blue.colller.worker.service.models.BookingStatus;
import com.byteminds.blue.colller.worker.service.models.Users;
import com.byteminds.blue.colller.worker.service.models.Work;
import com.byteminds.blue.colller.worker.service.request.BookingRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UsersRepository usersRepository;
    
    @Autowired
    private WorkRepository workRepository;
    
    // Create a new booking
    public BookingResponse createBooking(BookingRequest request, Long customerId) throws Exception {
        // Validate customer exists
        Optional<Users> customerOpt = usersRepository.findById(customerId);
        if (customerOpt.isEmpty()) {
            throw new Exception("Customer not found");
        }
        
        // Validate worker exists
        Optional<Users> workerOpt = usersRepository.findById(request.getWorkerId());
        if (workerOpt.isEmpty()) {
            throw new Exception("Worker not found");
        }
        
        // Validate work exists
        Optional<Work> workOpt = workRepository.findById(request.getWorkId());
        if (workOpt.isEmpty()) {
            throw new Exception("Work/Service not found");
        }
        
        Users customer = customerOpt.get();
        Users worker = workerOpt.get();
        Work work = workOpt.get();
        
        // Create booking
        Booking booking = new Booking(
            customer, worker, work, 
            request.getDescription(),
            request.getScheduledDate(),
            request.getCustomerAddress()
        );
        
        booking.setCustomerPhone(request.getCustomerPhone());
        booking.setSpecialInstructions(request.getSpecialInstructions());
        booking.setEstimatedDurationHours(work.getEstimatedTimeHours());
        booking.setTotalAmount(work.getCharges());
        
        Booking savedBooking = bookingRepository.save(booking);
        
        return convertToResponse(savedBooking);
    }
    
    // Get all bookings
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    // Get booking by ID
    public Optional<BookingResponse> getBookingById(Long id) {
        return bookingRepository.findById(id)
            .map(this::convertToResponse);
    }
    
    // Get bookings by customer ID
    public List<BookingResponse> getBookingsByCustomerId(Long customerId) {
        return bookingRepository.findByCustomerId(customerId).stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    // Get bookings by worker ID
    public List<BookingResponse> getBookingsByWorkerId(Long workerId) {
        return bookingRepository.findByWorkerId(workerId).stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    // Update booking status
    public BookingResponse updateBookingStatus(Long bookingId, BookingStatus status) throws Exception {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            throw new Exception("Booking not found");
        }
        
        Booking booking = bookingOpt.get();
        booking.setStatus(status);
        
        Booking updatedBooking = bookingRepository.save(booking);
        return convertToResponse(updatedBooking);
    }
    
    // Cancel booking
    public BookingResponse cancelBooking(Long bookingId) throws Exception {
        return updateBookingStatus(bookingId, BookingStatus.CANCELLED);
    }
    
    // Accept booking (for workers)
    public BookingResponse acceptBooking(Long bookingId) throws Exception {
        return updateBookingStatus(bookingId, BookingStatus.CONFIRMED);
    }
    
    // Reject booking (for workers)
    public BookingResponse rejectBooking(Long bookingId) throws Exception {
        return updateBookingStatus(bookingId, BookingStatus.REJECTED);
    }
    
    // Start work
    public BookingResponse startWork(Long bookingId) throws Exception {
        return updateBookingStatus(bookingId, BookingStatus.IN_PROGRESS);
    }
    
    // Complete work
    public BookingResponse completeWork(Long bookingId) throws Exception {
        return updateBookingStatus(bookingId, BookingStatus.COMPLETED);
    }
    
    // Get pending bookings for worker
    public List<BookingResponse> getPendingBookingsForWorker(Long workerId) {
        return bookingRepository.findPendingBookingsForWorker(workerId).stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    // Delete booking
    public void deleteBooking(Long bookingId) {
        bookingRepository.deleteById(bookingId);
    }
    
    // Convert Booking entity to BookingResponse DTO
    private BookingResponse convertToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setCustomerId(booking.getCustomer().getId());
        response.setCustomerName(booking.getCustomer().getName());
        response.setWorkerId(booking.getWorker().getId());
        response.setWorkerName(booking.getWorker().getName());
        response.setWorkId(booking.getWork().getId());
        response.setWorkTitle(booking.getWork().getTitle());
        response.setDescription(booking.getDescription());
        response.setScheduledDate(booking.getScheduledDate());
        response.setEstimatedDurationHours(booking.getEstimatedDurationHours());
        response.setTotalAmount(booking.getTotalAmount());
        response.setStatus(booking.getStatus());
        response.setCustomerAddress(booking.getCustomerAddress());
        response.setCustomerPhone(booking.getCustomerPhone());
        response.setSpecialInstructions(booking.getSpecialInstructions());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        return response;
    }
}
