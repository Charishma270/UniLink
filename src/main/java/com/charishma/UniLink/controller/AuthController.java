package com.charishma.UniLink.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.charishma.UniLink.dto.LoginRequest;
import com.charishma.UniLink.dto.LoginResponse;
import com.charishma.UniLink.model.User;
import com.charishma.UniLink.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
		User user = authService.authenticate(request.getEmail(), request.getPassword());
		LoginResponse response = new LoginResponse(
			true,
			user.getId(),
			user.getEmail(),
			user.getRole(),
			user.getName(),
			"Login successful"
		);
		return ResponseEntity.ok(response);
	}
}
