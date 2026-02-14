package com.charishma.UniLink.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.charishma.UniLink.dto.EventRequest;
import com.charishma.UniLink.dto.EventResponse;
import com.charishma.UniLink.model.Event;
import com.charishma.UniLink.model.EventStatus;
import com.charishma.UniLink.model.Role;
import com.charishma.UniLink.model.User;
import com.charishma.UniLink.repo.EventRepository;
import com.charishma.UniLink.repo.UserRepository;

@Service
public class EventService {
	private final EventRepository eventRepository;
	private final UserRepository userRepository;

	public EventService(EventRepository eventRepository, UserRepository userRepository) {
		this.eventRepository = eventRepository;
		this.userRepository = userRepository;
	}

	public EventResponse createEvent(EventRequest request) {
		User creator = userRepository.findById(request.getCreatedById())
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user"));

		if (creator.getRole() != Role.EVENT_MANAGER && creator.getRole() != Role.ADMIN) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to create events");
		}

		Event event = new Event();
		event.setClub(request.getClub());
		event.setTitle(request.getTitle());
		event.setDate(request.getDate());
		event.setTime(request.getTime());
		event.setLocation(request.getLocation());
		event.setDescription(request.getDescription());
		event.setTags(request.getTags() == null ? new ArrayList<>() : request.getTags());
		event.setStatus(EventStatus.PENDING);
		event.setCreatedBy(creator);

		Event saved = eventRepository.save(event);
		return toResponse(saved);
	}

	public List<EventResponse> listEvents(Optional<EventStatus> status, Optional<Long> createdById) {
		List<Event> events;

		if (status.isPresent() && createdById.isPresent()) {
			events = eventRepository.findByStatusAndCreatedBy_Id(status.get(), createdById.get());
		} else if (status.isPresent()) {
			events = eventRepository.findByStatus(status.get());
		} else if (createdById.isPresent()) {
			events = eventRepository.findByCreatedBy_Id(createdById.get());
		} else {
			events = eventRepository.findAll();
		}

		return events.stream().map(this::toResponse).toList();
	}

	public EventResponse updateStatus(Long id, EventStatus status) {
		Event event = eventRepository.findById(id)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

		event.setStatus(status);
		Event saved = eventRepository.save(event);
		return toResponse(saved);
	}

	public void deleteEvent(Long id, Long requesterId) {
		Event event = eventRepository.findById(id)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

		if (event.getCreatedBy() == null || !event.getCreatedBy().getId().equals(requesterId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to remove this event");
		}

		eventRepository.delete(event);
	}

	private EventResponse toResponse(Event event) {
		EventResponse response = new EventResponse();
		response.setId(event.getId());
		response.setClub(event.getClub());
		response.setTitle(event.getTitle());
		response.setDate(event.getDate());
		response.setTime(event.getTime());
		response.setLocation(event.getLocation());
		response.setDescription(event.getDescription());
		response.setTags(event.getTags());
		response.setStatus(event.getStatus());
		response.setCreatedAt(event.getCreatedAt());
		response.setCreatedById(event.getCreatedBy() == null ? null : event.getCreatedBy().getId());
		return response;
	}
}
