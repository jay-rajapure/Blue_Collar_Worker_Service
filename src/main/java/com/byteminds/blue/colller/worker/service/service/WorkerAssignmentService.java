package com.byteminds.blue.colller.worker.service.service;

import com.byteminds.blue.colller.worker.service.Repository.UsersRepository;
import com.byteminds.blue.colller.worker.service.Repository.WorkerAssignmentRepository;
import com.byteminds.blue.colller.worker.service.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class WorkerAssignmentService {
    
    @Autowired
    private UsersRepository usersRepository;
    
    @Autowired
    private WorkerAssignmentRepository workerAssignmentRepository;
    
    /**
     * Auto-assign the best available worker to a booking
     */
    public Users assignBestWorker(Booking booking, Work work) {
        // Get list of rejected workers to exclude them
        List<Long> rejectedWorkerIds = workerAssignmentRepository.findRejectedWorkerIdsByBookingId(booking.getId());
        
        // Find the best available worker
        Users bestWorker = findBestAvailableWorker(work, booking, rejectedWorkerIds);
        
        if (bestWorker != null) {
            // Create worker assignment record
            Integer nextOrder = workerAssignmentRepository.getMaxAssignmentOrderByBookingId(booking.getId()) + 1;
            WorkerAssignment assignment = new WorkerAssignment(booking, bestWorker, nextOrder);
            assignment.setStatus(AssignmentStatus.ASSIGNED);
            
            workerAssignmentRepository.save(assignment);
            
            // Update booking status
            booking.setStatus(BookingStatus.WORKER_ASSIGNED);
            booking.setWorker(bestWorker);
            
            return bestWorker;
        }
        
        return null;
    }
    
    /**
     * Find the best available worker based on rating, experience, and location
     */
    private Users findBestAvailableWorker(Work work, Booking booking, List<Long> excludedWorkerIds) {
        List<Users> availableWorkers;
        
        // If we have workers to exclude, use the exclusion query
        if (!excludedWorkerIds.isEmpty()) {
            availableWorkers = usersRepository.findAvailableWorkersExcluding(Role.WORKER, excludedWorkerIds);        } else {
            // Find top-rated available workers
            availableWorkers = usersRepository.findTopWorkersByRating(Role.WORKER, 0.0);
        }
        
        if (availableWorkers.isEmpty()) {
            return null;
        }
        
        // For now, return the first (highest-rated) worker
        // In future, can add more sophisticated matching logic:
        // - Match skills with work category
        // - Consider distance from work location
        // - Check availability schedule
        
        return filterBySkillsAndLocation(availableWorkers, work, booking);
    }
    
    /**
     * Filter workers by skills and location proximity
     */
    private Users filterBySkillsAndLocation(List<Users> workers, Work work, Booking booking) {
        // Simple implementation - return the first available worker
        // Can be enhanced to:
        // 1. Check if worker skills match work category
        // 2. Calculate distance between worker and job location
        // 3. Check worker's service area
        // 4. Consider worker's current workload
        
        for (Users worker : workers) {
            // Basic skill matching - check if worker has relevant skills
            if (hasRelevantSkills(worker, work)) {
                return worker;
            }
        }
        
        // If no skill match, return the best-rated available worker
        return workers.get(0);
    }
    
    /**
     * Check if worker has relevant skills for the work
     */
    private boolean hasRelevantSkills(Users worker, Work work) {
        if (worker.getSkills() == null || work.getCategory() == null) {
            return true; // Default to true if no skills/category specified
        }
        
        String workerSkills = worker.getSkills().toLowerCase();
        String workCategory = work.getCategory().toLowerCase();
        
        // Simple keyword matching
        return workerSkills.contains(workCategory) || 
               workCategory.contains(workerSkills) ||
               hasCommonKeywords(workerSkills, workCategory);
    }
    
    /**
     * Check for common keywords between worker skills and work category
     */
    private boolean hasCommonKeywords(String skills, String category) {
        String[] skillWords = skills.split("[,\\s]+");
        String[] categoryWords = category.split("[,\\s]+");
        
        for (String skill : skillWords) {
            for (String catWord : categoryWords) {
                if (skill.equalsIgnoreCase(catWord) && skill.length() > 2) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * Handle customer rejection of assigned worker
     */
    public boolean rejectAssignedWorker(Long bookingId, String rejectionReason) {
        Optional<WorkerAssignment> currentAssignment = 
            workerAssignmentRepository.findCurrentAssignmentByBookingIdAndStatus(bookingId, AssignmentStatus.ASSIGNED);
        
        if (currentAssignment.isPresent()) {
            WorkerAssignment assignment = currentAssignment.get();
            assignment.setStatus(AssignmentStatus.REJECTED_BY_CUSTOMER);
            assignment.setRejectionReason(rejectionReason);
            assignment.setResponseAt(LocalDateTime.now());
            
            workerAssignmentRepository.save(assignment);
            
            // Update booking status
            Booking booking = assignment.getBooking();
            booking.setStatus(BookingStatus.WORKER_REJECTED);
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Handle worker acceptance of assignment
     */
    public boolean acceptWorkerAssignment(Long bookingId, Long workerId) {
        Optional<WorkerAssignment> currentAssignment = 
            workerAssignmentRepository.findCurrentAssignmentByBookingIdAndStatus(bookingId, AssignmentStatus.ASSIGNED);
        
        if (currentAssignment.isPresent() && 
            currentAssignment.get().getWorker().getId().equals(workerId)) {
            
            WorkerAssignment assignment = currentAssignment.get();
            assignment.setStatus(AssignmentStatus.ACCEPTED);
            assignment.setResponseAt(LocalDateTime.now());
            
            workerAssignmentRepository.save(assignment);
            
            // Update booking status
            Booking booking = assignment.getBooking();
            booking.setStatus(BookingStatus.CONFIRMED);
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Handle worker rejection of assignment
     */
    public boolean rejectWorkerAssignment(Long bookingId, Long workerId, String rejectionReason) {
        Optional<WorkerAssignment> currentAssignment = 
            workerAssignmentRepository.findCurrentAssignmentByBookingIdAndStatus(bookingId, AssignmentStatus.ASSIGNED);
        
        if (currentAssignment.isPresent() && 
            currentAssignment.get().getWorker().getId().equals(workerId)) {
            
            WorkerAssignment assignment = currentAssignment.get();
            assignment.setStatus(AssignmentStatus.REJECTED_BY_WORKER);
            assignment.setRejectionReason(rejectionReason);
            assignment.setResponseAt(LocalDateTime.now());
            
            workerAssignmentRepository.save(assignment);
            
            // Update booking status to pending for reassignment
            Booking booking = assignment.getBooking();
            booking.setStatus(BookingStatus.PENDING);
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Get current worker assignment for a booking
     */
    public Optional<WorkerAssignment> getCurrentAssignment(Long bookingId) {
        return workerAssignmentRepository.findCurrentAssignmentByBookingIdAndStatus(bookingId, AssignmentStatus.ASSIGNED);
    }
    
    /**
     * Get all assignments for a booking
     */
    public List<WorkerAssignment> getBookingAssignments(Long bookingId) {
        return workerAssignmentRepository.findByBookingIdOrderByAssignmentOrderAsc(bookingId);
    }
}