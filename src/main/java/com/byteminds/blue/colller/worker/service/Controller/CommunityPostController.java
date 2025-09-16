package com.byteminds.blue.colller.worker.service.Controller;

import com.byteminds.blue.colller.worker.service.Repository.CommunityPostRepository;
import com.byteminds.blue.colller.worker.service.Repository.UsersRepository;
import com.byteminds.blue.colller.worker.service.dto.CommunityPostDTO;
import com.byteminds.blue.colller.worker.service.models.CommunityPost;
import com.byteminds.blue.colller.worker.service.models.Users;
import com.byteminds.blue.colller.worker.service.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/community-posts")
@CrossOrigin(origins = "*")
public class CommunityPostController {
    
    @Autowired
    private CommunityPostRepository communityPostRepository;
    
    @Autowired
    private UsersService usersService;
    
    @Autowired
    private UsersRepository usersRepository;
    
    // Create a community post (both customers and workers)
    @PostMapping
    public ResponseEntity<?> createCommunityPost(
            @RequestHeader("Authorization") String jwt,
            @RequestBody CommunityPostDTO postDTO) {
        try {
            Users user = usersService.findByJwtToken(jwt);
            
            // Validate required fields
            if (postDTO.getTitle() == null || postDTO.getTitle().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Title is required"));
            }
            
            if (postDTO.getCategory() == null || postDTO.getCategory().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Category is required"));
            }
            
            if (postDTO.getPostType() == null || 
                (!"SERVICE_REQUEST".equals(postDTO.getPostType()) && 
                 !"SERVICE_OFFER".equals(postDTO.getPostType()))) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Post type must be SERVICE_REQUEST or SERVICE_OFFER"));
            }
            
            // Create community post
            CommunityPost communityPost = new CommunityPost();
            communityPost.setTitle(postDTO.getTitle());
            communityPost.setDescription(postDTO.getDescription());
            communityPost.setCategory(postDTO.getCategory());
            communityPost.setPostType(postDTO.getPostType());
            communityPost.setLocation(postDTO.getLocation());
            communityPost.setAddress(postDTO.getAddress());
            communityPost.setLatitude(postDTO.getLatitude());
            communityPost.setLongitude(postDTO.getLongitude());
            communityPost.setPhoneNumber(postDTO.getPhoneNumber());
            communityPost.setIsUrgent(postDTO.getIsUrgent() != null ? postDTO.getIsUrgent() : false);
            communityPost.setBudget(postDTO.getBudget());
            communityPost.setUser(user);
            
            CommunityPost savedPost = communityPostRepository.save(communityPost);
            
            // If this is a customer post (service request), notify nearby workers
            if ("SERVICE_REQUEST".equals(postDTO.getPostType()) && 
                postDTO.getLatitude() != null && postDTO.getLongitude() != null) {
                notifyNearbyWorkers(savedPost);
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Community post created successfully",
                "postId", savedPost.getId()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create community post", "message", e.getMessage()));
        }
    }
    
    // Get posts for customer (their own posts + worker service offers)
    @GetMapping("/customer")
    public ResponseEntity<?> getCustomerPosts(@RequestHeader("Authorization") String jwt) {
        try {
            Users customer = usersService.findByJwtToken(jwt);
            
            if (!"CUSTOMER".equals(customer.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only customers can access this endpoint"));
            }
            
            // Get customer's own posts
            List<CommunityPost> customerPosts = communityPostRepository.findByUser(customer);
            
            // Get all worker service offers (only from active workers)
            List<CommunityPost> workerPosts = communityPostRepository.findAllWorkerPosts()
                .stream()
                .filter(post -> post.getUser().getIsAvailable() != null && post.getUser().getIsAvailable())
                .collect(Collectors.toList());
            
            // Combine and sort by creation date
            List<CommunityPost> allPosts = new ArrayList<>();
            allPosts.addAll(customerPosts);
            allPosts.addAll(workerPosts);
            allPosts.sort((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()));
            
            List<Map<String, Object>> responseList = allPosts.stream()
                .map(this::convertToResponseMap)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(responseList);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch community posts"));
        }
    }
    
    // Get posts for worker (their own posts + customer service requests)
    @GetMapping("/worker")
    public ResponseEntity<?> getWorkerPosts(@RequestHeader("Authorization") String jwt) {
        try {
            Users worker = usersService.findByJwtToken(jwt);
            
            if (!"WORKER".equals(worker.getRole().toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only workers can access this endpoint"));
            }
            
            // Get worker's own posts
            List<CommunityPost> workerPosts = communityPostRepository.findByUser(worker);
            
            // Get all customer service requests
            List<CommunityPost> customerPosts = communityPostRepository.findAllCustomerPosts();
            
            // Combine and sort by creation date
            List<CommunityPost> allPosts = new ArrayList<>();
            allPosts.addAll(workerPosts);
            allPosts.addAll(customerPosts);
            allPosts.sort((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()));
            
            List<Map<String, Object>> responseList = allPosts.stream()
                .map(this::convertToResponseMap)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(responseList);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch community posts"));
        }
    }
    
    // Get my own posts
    @GetMapping("/my-posts")
    public ResponseEntity<?> getMyPosts(@RequestHeader("Authorization") String jwt) {
        try {
            Users user = usersService.findByJwtToken(jwt);
            
            List<CommunityPost> myPosts = communityPostRepository.findByUser(user);
            myPosts.sort((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()));
            
            List<Map<String, Object>> responseList = myPosts.stream()
                .map(this::convertToResponseMap)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(responseList);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch my posts"));
        }
    }
    
    // Delete a community post
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deleteCommunityPost(
            @PathVariable Long postId,
            @RequestHeader("Authorization") String jwt) {
        try {
            Users user = usersService.findByJwtToken(jwt);
            
            CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
            
            // Check if user owns this post
            if (!post.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only delete your own posts"));
            }
            
            communityPostRepository.delete(post);
            
            return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete post", "message", e.getMessage()));
        }
    }
    
    // Notify nearby workers about a new customer service request
    private void notifyNearbyWorkers(CommunityPost post) {
        try {
            // Find workers within 10km who match the category and are available
            List<CommunityPost> nearbyWorkers = communityPostRepository.findWorkerPostsNearLocation(
                post.getLatitude(), 
                post.getLongitude(), 
                10.0, // 10km radius
                post.getCategory()
            );
            
            // Filter only active workers
            List<CommunityPost> activeNearbyWorkers = nearbyWorkers.stream()
                .filter(workerPost -> workerPost.getUser().getIsAvailable() != null && 
                   workerPost.getUser().getIsAvailable())
                .collect(Collectors.toList());
            
            // Log detailed notification information
            System.out.println("=== NEW SERVICE REQUEST NOTIFICATION ===");
            System.out.println("Service Request: " + post.getTitle());
            System.out.println("Category: " + post.getCategory());
            System.out.println("Description: " + (post.getDescription() != null ? post.getDescription() : "N/A"));
            System.out.println("Budget: ₹" + (post.getBudget() != null ? post.getBudget() : "Not specified"));
            System.out.println("Location: " + (post.getLocation() != null ? post.getLocation() : "N/A"));
            System.out.println("Urgent: " + (post.getIsUrgent() != null && post.getIsUrgent() ? "Yes" : "No"));
            System.out.println("Notifying " + activeNearbyWorkers.size() + " active workers within 10km");
            System.out.println("========================================");
            
            // In a real implementation, you would send notifications here
            // For now, we'll just log the notification
            if (activeNearbyWorkers.size() > 0) {
                System.out.println("Notification sent to:");
                for (CommunityPost workerPost : activeNearbyWorkers) {
                    System.out.println("- " + workerPost.getUser().getName() + 
                                     " (" + workerPost.getUser().getEmail() + ")");
                }
            } else {
                System.out.println("No active workers found within 10km for this service category.");
            }
            
            // TODO: Implement actual notification system (email, SMS, push notifications)
            
        } catch (Exception e) {
            System.err.println("Error notifying nearby workers: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private Map<String, Object> convertToResponseMap(CommunityPost post) {
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("id", post.getId());
        responseMap.put("title", post.getTitle());
        responseMap.put("description", post.getDescription() != null ? post.getDescription() : "");
        responseMap.put("category", post.getCategory());
        responseMap.put("postType", post.getPostType());
        responseMap.put("location", post.getLocation() != null ? post.getLocation() : "");
        responseMap.put("address", post.getAddress() != null ? post.getAddress() : "");
        responseMap.put("latitude", post.getLatitude() != null ? post.getLatitude() : 0);
        responseMap.put("longitude", post.getLongitude() != null ? post.getLongitude() : 0);
        responseMap.put("phoneNumber", post.getPhoneNumber() != null ? post.getPhoneNumber() : "");
        responseMap.put("isUrgent", post.getIsUrgent() != null ? post.getIsUrgent() : false);
        responseMap.put("budget", post.getBudget() != null ? post.getBudget() : 0);
        responseMap.put("userName", post.getUser().getName());
        responseMap.put("userEmail", post.getUser().getEmail());
        responseMap.put("userId", post.getUser().getId());
        responseMap.put("userRole", post.getUser().getRole().toString());
        responseMap.put("createdAt", post.getCreatedAt().toString());
        responseMap.put("updatedAt", post.getUpdatedAt().toString());
        return responseMap;
    }
}
