package com.byteminds.blue.colller.worker.service.service;

import com.byteminds.blue.colller.worker.service.Repository.RecurringJobRepository;
import com.byteminds.blue.colller.worker.service.Repository.UsersRepository;
import com.byteminds.blue.colller.worker.service.models.RecurringJob;
import com.byteminds.blue.colller.worker.service.models.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RecurringJobService {
    
    @Autowired
    private RecurringJobRepository recurringJobRepository;
    
    @Autowired
    private UsersRepository usersRepository;
    
    /**
     * Create a new recurring job
     */
    public RecurringJob createRecurringJob(RecurringJob job, Long customerId) throws Exception {
        // Validate customer exists
        Optional<Users> customerOpt = usersRepository.findById(customerId);
        if (customerOpt.isEmpty()) {
            throw new Exception("Customer not found");
        }
        
        job.setCustomer(customerOpt.get());
        return recurringJobRepository.save(job);
    }
    
    /**
     * Get recurring jobs for a customer
     */
    public List<RecurringJob> getRecurringJobsForCustomer(Long customerId) {
        return recurringJobRepository.findByCustomerId(customerId);
    }
    
    /**
     * Get active recurring jobs for a customer
     */
    public List<RecurringJob> getActiveRecurringJobsForCustomer(Long customerId) {
        return recurringJobRepository.findByCustomerIdAndIsActiveTrue(customerId);
    }
    
    /**
     * Update a recurring job
     */
    public RecurringJob updateRecurringJob(Long jobId, RecurringJob updatedJob, Long customerId) throws Exception {
        Optional<RecurringJob> jobOpt = recurringJobRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            throw new Exception("Recurring job not found");
        }
        
        RecurringJob job = jobOpt.get();
        if (!job.getCustomer().getId().equals(customerId)) {
            throw new Exception("Unauthorized: Recurring job does not belong to customer");
        }
        
        // Update fields
        job.setJobTitle(updatedJob.getJobTitle());
        job.setJobDescription(updatedJob.getJobDescription());
        job.setCategory(updatedJob.getCategory());
        job.setFrequency(updatedJob.getFrequency());
        job.setPreferredTime(updatedJob.getPreferredTime());
        job.setEstimatedAmount(updatedJob.getEstimatedAmount());
        job.setCustomerAddress(updatedJob.getCustomerAddress());
        job.setLatitude(updatedJob.getLatitude());
        job.setLongitude(updatedJob.getLongitude());
        job.setIsActive(updatedJob.getIsActive());
        
        return recurringJobRepository.save(job);
    }
    
    /**
     * Delete a recurring job
     */
    public void deleteRecurringJob(Long jobId, Long customerId) throws Exception {
        Optional<RecurringJob> jobOpt = recurringJobRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            throw new Exception("Recurring job not found");
        }
        
        RecurringJob job = jobOpt.get();
        if (!job.getCustomer().getId().equals(customerId)) {
            throw new Exception("Unauthorized: Recurring job does not belong to customer");
        }
        
        recurringJobRepository.delete(job);
    }
}