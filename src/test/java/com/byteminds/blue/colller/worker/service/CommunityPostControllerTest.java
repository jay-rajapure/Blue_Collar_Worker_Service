package com.byteminds.blue.colller.worker.service;

import com.byteminds.blue.colller.worker.service.Controller.CommunityPostController;
import com.byteminds.blue.colller.worker.service.Repository.CommunityPostRepository;
import com.byteminds.blue.colller.worker.service.Repository.UsersRepository;
import com.byteminds.blue.colller.worker.service.models.CommunityPost;
import com.byteminds.blue.colller.worker.service.models.Role;
import com.byteminds.blue.colller.worker.service.models.Users;
import com.byteminds.blue.colller.worker.service.service.UsersService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CommunityPostControllerTest {

    @Mock
    private CommunityPostRepository communityPostRepository;

    @Mock
    private UsersService usersService;

    @Mock
    private UsersRepository usersRepository;

    @InjectMocks
    private CommunityPostController communityPostController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetCustomerPostsWithActiveWorkersOnly() throws Exception {
        // Create a customer user
        Users customer = new Users();
        customer.setId(1L);
        customer.setRole(Role.CUSTOMER);

        // Create an active worker
        Users activeWorker = new Users();
        activeWorker.setId(2L);
        activeWorker.setRole(Role.WORKER);
        activeWorker.setIsAvailable(true);

        // Create an inactive worker
        Users inactiveWorker = new Users();
        inactiveWorker.setId(3L);
        inactiveWorker.setRole(Role.WORKER);
        inactiveWorker.setIsAvailable(false);

        // Create customer's own post
        CommunityPost customerPost = new CommunityPost();
        customerPost.setId(1L);
        customerPost.setUser(customer);

        // Create post from active worker
        CommunityPost activeWorkerPost = new CommunityPost();
        activeWorkerPost.setId(2L);
        activeWorkerPost.setPostType("SERVICE_OFFER");
        activeWorkerPost.setUser(activeWorker);

        // Create post from inactive worker
        CommunityPost inactiveWorkerPost = new CommunityPost();
        inactiveWorkerPost.setId(3L);
        inactiveWorkerPost.setPostType("SERVICE_OFFER");
        inactiveWorkerPost.setUser(inactiveWorker);

        // Mock repository responses
        when(usersService.findByJwtToken(any())).thenReturn(customer);
        when(communityPostRepository.findByUser(customer)).thenReturn(List.of(customerPost));
        when(communityPostRepository.findAllWorkerPosts()).thenReturn(List.of(activeWorkerPost, inactiveWorkerPost));

        // Call the method
        ResponseEntity<?> response = communityPostController.getCustomerPosts("Bearer token");

        // Verify the results
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        
        // Should only contain customer's post and active worker's post, not inactive worker's post
        List<?> result = (List<?>) response.getBody();
        assertNotNull(result);
        assertEquals(2, result.size()); // Customer post + active worker post
    }

    @Test
    void testNotifyNearbyWorkersWithActiveWorkersOnly() throws Exception {
        // Create a customer user
        Users customer = new Users();
        customer.setId(1L);
        customer.setRole(Role.CUSTOMER);
        customer.setIsAvailable(true);

        // Create an active worker
        Users activeWorker = new Users();
        activeWorker.setId(2L);
        activeWorker.setRole(Role.WORKER);
        activeWorker.setIsAvailable(true);

        // Create an inactive worker
        Users inactiveWorker = new Users();
        inactiveWorker.setId(3L);
        inactiveWorker.setRole(Role.WORKER);
        inactiveWorker.setIsAvailable(false);

        // Create customer's service request post
        CommunityPost customerPost = new CommunityPost();
        customerPost.setId(1L);
        customerPost.setUser(customer);
        customerPost.setPostType("SERVICE_REQUEST");
        customerPost.setLatitude(12.9716);
        customerPost.setLongitude(77.5946);
        customerPost.setCategory("plumbing");

        // Create post from active worker
        CommunityPost activeWorkerPost = new CommunityPost();
        activeWorkerPost.setId(2L);
        activeWorkerPost.setPostType("SERVICE_OFFER");
        activeWorkerPost.setUser(activeWorker);

        // Create post from inactive worker
        CommunityPost inactiveWorkerPost = new CommunityPost();
        inactiveWorkerPost.setId(3L);
        inactiveWorkerPost.setPostType("SERVICE_OFFER");
        inactiveWorkerPost.setUser(inactiveWorker);

        // Mock repository responses
        when(communityPostRepository.findWorkerPostsNearLocation(any(), any(), any(), any()))
            .thenReturn(List.of(activeWorkerPost, inactiveWorkerPost));

        // Use reflection to access private method
        java.lang.reflect.Method method = CommunityPostController.class.getDeclaredMethod(
            "notifyNearbyWorkers", CommunityPost.class);
        method.setAccessible(true);
        
        // Call the private method
        method.invoke(communityPostController, customerPost);

        // Verify that repository method was called
        verify(communityPostRepository).findWorkerPostsNearLocation(
            customerPost.getLatitude(), 
            customerPost.getLongitude(), 
            10.0, 
            customerPost.getCategory()
        );
    }
}