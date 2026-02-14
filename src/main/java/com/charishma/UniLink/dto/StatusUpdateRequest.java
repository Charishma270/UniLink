package com.charishma.UniLink.dto;

import com.charishma.UniLink.model.EventStatus;

public class StatusUpdateRequest {
	private EventStatus status;

	public EventStatus getStatus() {
		return status;
	}

	public void setStatus(EventStatus status) {
		this.status = status;
	}
}
