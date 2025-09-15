package com.byteminds.blue.colller.worker.service.models;

public enum BookingStatus {
    PENDING,
    WORKER_ASSIGNED,    // Worker has been auto-assigned by system
    WORKER_REJECTED,    // Customer rejected the assigned worker
    CONFIRMED,          // Worker accepted and customer approved
    IN_PROGRESS,
    COMPLETED,
    CANCELLED,
    REJECTED            // Worker rejected the booking
}
