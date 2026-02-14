package com.charishma.UniLink.dto;

import com.charishma.UniLink.model.Role;

public class LoginResponse {
	private boolean success;
	private Long userId;
	private String email;
	private Role role;
	private String name;
	private String message;

	public LoginResponse() {
	}

	public LoginResponse(boolean success, Long userId, String email, Role role, String name, String message) {
		this.success = success;
		this.userId = userId;
		this.email = email;
		this.role = role;
		this.name = name;
		this.message = message;
	}

	public boolean isSuccess() {
		return success;
	}

	public void setSuccess(boolean success) {
		this.success = success;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
}
