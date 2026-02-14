package com.charishma.UniLink.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.charishma.UniLink.dto.ApiResponse;
import com.charishma.UniLink.dto.ForgotPasswordRequest;
import com.charishma.UniLink.dto.ResetPasswordRequest;
import com.charishma.UniLink.service.PasswordResetService;

@RestController
@RequestMapping("/api/password")
public class PasswordResetController {
	private final PasswordResetService passwordResetService;

	public PasswordResetController(PasswordResetService passwordResetService) {
		this.passwordResetService = passwordResetService;
	}

	@PostMapping("/forgot")
	public ResponseEntity<ApiResponse> forgot(@RequestBody ForgotPasswordRequest request) {
		passwordResetService.sendOtp(request.getEmail());
		return ResponseEntity.ok(new ApiResponse(true, "If the account exists, an OTP has been sent."));
	}

	@PostMapping("/reset")
	public ResponseEntity<ApiResponse> reset(@RequestBody ResetPasswordRequest request) {
		passwordResetService.resetPassword(
			request.getEmail(),
			request.getOtp(),
			request.getNewPassword(),
			request.getConfirmPassword()
		);
		return ResponseEntity.ok(new ApiResponse(true, "Password updated successfully."));
	}
}
