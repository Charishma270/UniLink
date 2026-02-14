package com.charishma.UniLink.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.charishma.UniLink.dto.EventRequest;
import com.charishma.UniLink.dto.EventResponse;
import com.charishma.UniLink.dto.StatusUpdateRequest;
import com.charishma.UniLink.model.EventStatus;
import com.charishma.UniLink.service.EventService;

@RestController
@RequestMapping("/api/events")
public class EventController {
	private final EventService eventService;

	public EventController(EventService eventService) {
		this.eventService = eventService;
	}

	@PostMapping
	public ResponseEntity<EventResponse> createEvent(@RequestBody EventRequest request) {
		return ResponseEntity.ok(eventService.createEvent(request));
	}

	@GetMapping
	public ResponseEntity<List<EventResponse>> listEvents(
		@RequestParam Optional<EventStatus> status,
		@RequestParam Optional<Long> createdById
	) {
		return ResponseEntity.ok(eventService.listEvents(status, createdById));
	}

	@PatchMapping("/{id}/status")
	public ResponseEntity<EventResponse> updateStatus(
		@PathVariable Long id,
		@RequestBody StatusUpdateRequest request
	) {
		return ResponseEntity.ok(eventService.updateStatus(id, request.getStatus()));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteEvent(
		@PathVariable Long id,
		@RequestParam Long requesterId
	) {
		eventService.deleteEvent(id, requesterId);
		return ResponseEntity.noContent().build();
	}
}
