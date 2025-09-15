package com.byteminds.blue.colller.worker.service.models;

public enum AssignmentStatus {
    ASSIGNED,       // Worker has been assigned to the booking
    ACCEPTED,       // Worker accepted the assignment
    REJECTED_BY_WORKER,  // Worker rejected the assignment
    REJECTED_BY_CUSTOMER, // Customer rejected the assigned worker
    EXPIRED        // Assignment expired without response
}