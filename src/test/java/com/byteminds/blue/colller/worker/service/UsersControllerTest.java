package com.byteminds.blue.colller.worker.service;

import com.byteminds.blue.colller.worker.service.Controller.UsersController;
import com.byteminds.blue.colller.worker.service.Repository.UsersRepository;
import com.byteminds.blue.colller.worker.service.models.Role;
import com.byteminds.blue.colller.worker.service.models.Users;
import com.byteminds.blue.colller.worker.service.service.UsersService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UsersControllerTest {

    @Mock
    private UsersService userService;

    @Mock
    private UsersRepository usersRepository;

    @InjectMocks
    private UsersController usersController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testUpdateWorkerStatusSuccess() throws Exception {
        // Create a worker user
        Users worker = new Users();
        worker.setId(1L);
        worker.setRole(Role.WORKER);
        worker.setIsAvailable(false); // Initially inactive

        // Mock service and repository responses
        when(userService.findByJwtToken(any())).thenReturn(worker);
        when(usersRepository.save(any(Users.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Create status update request
        Map<String, Boolean> statusUpdate = new HashMap<>();
        statusUpdate.put("isAvailable", true);

        // Call the method
        ResponseEntity<?> response = usersController.updateWorkerStatus("Bearer token", statusUpdate);

        // Verify the results
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        
        // Check response body
        @SuppressWarnings("unchecked")
        Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
        assertNotNull(responseBody);
        assertEquals("Status updated successfully", responseBody.get("message"));
        assertEquals(true, responseBody.get("isAvailable"));
        
        // Verify that the worker's status was updated
        assertTrue(worker.getIsAvailable());
        verify(usersRepository, times(1)).save(worker);
    }

    @Test
    void testUpdateWorkerStatusNonWorkerForbidden() throws Exception {
        // Create a customer user (not a worker)
        Users customer = new Users();
        customer.setId(1L);
        customer.setRole(Role.CUSTOMER);

        // Mock service response
        when(userService.findByJwtToken(any())).thenReturn(customer);

        // Create status update request
        Map<String, Boolean> statusUpdate = new HashMap<>();
        statusUpdate.put("isAvailable", true);

        // Call the method
        ResponseEntity<?> response = usersController.updateWorkerStatus("Bearer token", statusUpdate);

        // Verify the results - should be forbidden
        assertNotNull(response);
        assertEquals(403, response.getStatusCodeValue());
        
        // Check error message
        @SuppressWarnings("unchecked")
        Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
        assertNotNull(responseBody);
        assertEquals("Only workers can update availability status", responseBody.get("error"));
    }

    @Test
    void testUpdateWorkerStatusMissingField() throws Exception {
        // Create a worker user
        Users worker = new Users();
        worker.setId(1L);
        worker.setRole(Role.WORKER);

        // Mock service response
        when(userService.findByJwtToken(any())).thenReturn(worker);

        // Create status update request without required field
        Map<String, Boolean> statusUpdate = new HashMap<>();

        // Call the method
        ResponseEntity<?> response = usersController.updateWorkerStatus("Bearer token", statusUpdate);

        // Verify the results - should be bad request
        assertNotNull(response);
        assertEquals(400, response.getStatusCodeValue());
        
        // Check error message
        @SuppressWarnings("unchecked")
        Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
        assertNotNull(responseBody);
        assertEquals("isAvailable field is required", responseBody.get("error"));
    }
}