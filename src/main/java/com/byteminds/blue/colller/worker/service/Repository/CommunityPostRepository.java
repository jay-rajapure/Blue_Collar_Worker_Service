package com.byteminds.blue.colller.worker.service.Repository;

import com.byteminds.blue.colller.worker.service.models.CommunityPost;
import com.byteminds.blue.colller.worker.service.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {
    
    // Find posts by user
    List<CommunityPost> findByUser(Users user);
    
    // Find customer posts (service requests) by category
    @Query("SELECT cp FROM CommunityPost cp WHERE cp.postType = 'SERVICE_REQUEST' AND cp.category = :category ORDER BY cp.createdAt DESC")
    List<CommunityPost> findCustomerPostsByCategory(@Param("category") String category);
    
    // Find worker posts (service offers) by category
    @Query("SELECT cp FROM CommunityPost cp WHERE cp.postType = 'SERVICE_OFFER' AND cp.category = :category ORDER BY cp.createdAt DESC")
    List<CommunityPost> findWorkerPostsByCategory(@Param("category") String category);
    
    // Find customer posts (service requests) near location
    @Query("SELECT cp FROM CommunityPost cp WHERE cp.postType = 'SERVICE_REQUEST' AND " +
           "(:category IS NULL OR cp.category = :category) AND " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(cp.latitude)) * " +
           "cos(radians(cp.longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(cp.latitude)))) <= :radius " +
           "ORDER BY cp.createdAt DESC")
    List<CommunityPost> findCustomerPostsNearLocation(
        @Param("latitude") Double latitude,
        @Param("longitude") Double longitude,
        @Param("radius") Double radius,
        @Param("category") String category
    );
    
    // Find worker posts (service offers) near location
    @Query("SELECT cp FROM CommunityPost cp WHERE cp.postType = 'SERVICE_OFFER' AND " +
           "(:category IS NULL OR cp.category = :category) AND " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(cp.latitude)) * " +
           "cos(radians(cp.longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(cp.latitude)))) <= :radius " +
           "ORDER BY cp.createdAt DESC")
    List<CommunityPost> findWorkerPostsNearLocation(
        @Param("latitude") Double latitude,
        @Param("longitude") Double longitude,
        @Param("radius") Double radius,
        @Param("category") String category
    );
    
    // Find all customer posts (service requests)
    @Query("SELECT cp FROM CommunityPost cp WHERE cp.postType = 'SERVICE_REQUEST' ORDER BY cp.createdAt DESC")
    List<CommunityPost> findAllCustomerPosts();
    
    // Find all worker posts (service offers)
    @Query("SELECT cp FROM CommunityPost cp WHERE cp.postType = 'SERVICE_OFFER' ORDER BY cp.createdAt DESC")
    List<CommunityPost> findAllWorkerPosts();
}