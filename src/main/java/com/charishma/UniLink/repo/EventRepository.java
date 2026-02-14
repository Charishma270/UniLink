package com.charishma.UniLink.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.charishma.UniLink.model.Event;
import com.charishma.UniLink.model.EventStatus;

public interface EventRepository extends JpaRepository<Event, Long> {
	List<Event> findByStatus(EventStatus status);

	List<Event> findByCreatedBy_Id(Long createdById);

	List<Event> findByStatusAndCreatedBy_Id(EventStatus status, Long createdById);
}
