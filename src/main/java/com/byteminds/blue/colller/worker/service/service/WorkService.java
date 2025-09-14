package com.byteminds.blue.colller.worker.service.service;

import com.byteminds.blue.colller.worker.service.Repository.UsersRepository;
import com.byteminds.blue.colller.worker.service.Repository.WorkRepository;
import com.byteminds.blue.colller.worker.service.models.Users;
import com.byteminds.blue.colller.worker.service.models.Work;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class WorkService {
    @Autowired
    private  WorkRepository workPostRepository;
    @Autowired
    private UsersRepository usersRepository;



    /**
     * Create a new work post (with or without image).
     */
    public Work createWork(Long userId,
                               String title,
                               String description,
                               Double charges,
                               Double estimatedTimeHours,
                               String category,
                               Double latitude,
                               Double longitude,
                               MultipartFile imageFile) throws IOException {

        // Find the user who is posting
        Users worker = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Worker not found with id: " + userId));

        Work post = new Work();
        post.setTitle(title);
        post.setDescription(description);
        post.setCharges(charges);
        post.setEstimatedTimeHours(estimatedTimeHours);
        post.setCategory(category);
        post.setLatitude(latitude);
        post.setLongitude(longitude);
        post.setWorker(worker);

        // Save image if provided
        if (imageFile != null && !imageFile.isEmpty()) {
            post.setImage(imageFile.getBytes());
        }

        return workPostRepository.save(post);
    }

    /**
     * Get all work posts.
     */
    public List<Work> getAllWork() {
        return workPostRepository.findAll();
    }

    /**
     * Get a work post by ID.
     */
    public Optional<Work> getWorkById(Long id) {
        return workPostRepository.findById(id);
    }

    /**
     * Delete a work post by ID.
     */
    public void deleteWork(Long id) {
        workPostRepository.deleteById(id);
    }

    /**
     * Update availability of work post.
     */
    public Work updateAvailability(Long id, boolean isAvailable) {
        Work post = workPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkPost not found with id: " + id));
        post.setAvailable(isAvailable);
        return workPostRepository.save(post);
    }
}

