package com.byteminds.blue.colller.worker.service.Controller;



import com.byteminds.blue.colller.worker.service.models.Users;
import com.byteminds.blue.colller.worker.service.models.Work;
import com.byteminds.blue.colller.worker.service.service.UsersService;
import com.byteminds.blue.colller.worker.service.service.WorkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/works")
public class WorkController {

    private final WorkService workService;
    @Autowired
    private UsersService usersService;

    public WorkController(WorkService workService) {
        this.workService = workService;
    }

    // ✅ Create Work (with optional image upload)
    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<Work> createWork(
            @RequestHeader("Authorization") String jwt,
            @RequestParam Long userId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam Double charges,
            @RequestParam Double estimatedTimeHours,
            @RequestParam String category,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) MultipartFile image) throws IOException {

        Users user = usersService.findByJwtToken(jwt);
        Work work = workService.createWork(
                userId, title, description, charges, estimatedTimeHours, category, latitude, longitude, image
        );
        return new ResponseEntity<>(work, HttpStatus.CREATED);
    }

    // ✅ Get all Works
    @GetMapping
    public ResponseEntity<List<Work>> getAllWorks() {
        return ResponseEntity.ok(workService.getAllWork());
    }

    // ✅ Get Work by ID
    @GetMapping("/{id}")
    public ResponseEntity<Work> getWorkById(@PathVariable Long id) {
        Optional<Work> work = workService.getWorkById(id);
        return work.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // ✅ Fetch Work image (download)
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getWorkImage(@PathVariable Long id) {
        Optional<Work> work = workService.getWorkById(id);

        if (work.isPresent() && work.get().getImage() != null) {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"work_" + id + ".jpg\"")
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(work.get().getImage());
        }
        return ResponseEntity.notFound().build();
    }

    // ✅ Delete Work
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWork(@PathVariable Long id) {
        workService.deleteWork(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ Update Work availability
    @PatchMapping("/{id}/availability")
    public ResponseEntity<Work> updateAvailability(
            @PathVariable Long id,
            @RequestParam boolean isAvailable) {
        return ResponseEntity.ok(workService.updateAvailability(id, isAvailable));
    }
}

