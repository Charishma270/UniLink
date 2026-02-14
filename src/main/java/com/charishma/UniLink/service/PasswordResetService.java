package com.charishma.UniLink.service;

import java.security.SecureRandom;
import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.charishma.UniLink.model.PasswordResetToken;
import com.charishma.UniLink.model.User;
import com.charishma.UniLink.repo.PasswordResetTokenRepository;
import com.charishma.UniLink.repo.UserRepository;

@Service
public class PasswordResetService {
	private static final int OTP_LENGTH = 6;
	private static final long EXPIRY_SECONDS = 10 * 60;
	private static final long RESEND_COOLDOWN_SECONDS = 30;

	private final UserRepository userRepository;
	private final PasswordResetTokenRepository tokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final JavaMailSender mailSender;
	private final SecureRandom random = new SecureRandom();

	public PasswordResetService(
		UserRepository userRepository,
		PasswordResetTokenRepository tokenRepository,
		PasswordEncoder passwordEncoder,
		JavaMailSender mailSender
	) {
		this.userRepository = userRepository;
		this.tokenRepository = tokenRepository;
		this.passwordEncoder = passwordEncoder;
		this.mailSender = mailSender;
	}

	public void sendOtp(String email) {
		tokenRepository.findTopByEmailOrderByCreatedAtDesc(email)
			.filter((token) -> token.getCreatedAt() != null)
			.filter((token) -> token.getCreatedAt().isAfter(Instant.now().minusSeconds(RESEND_COOLDOWN_SECONDS)))
			.ifPresent((token) -> {
				throw new ResponseStatusException(
					HttpStatus.TOO_MANY_REQUESTS,
					"Please wait 30 seconds before requesting another OTP."
				);
			});

		User user = userRepository.findByEmail(email).orElse(null);
		if (user == null) {
			return;
		}

		String otp = generateOtp();
		PasswordResetToken token = new PasswordResetToken();
		token.setEmail(email);
		token.setOtpHash(passwordEncoder.encode(otp));
		token.setExpiresAt(Instant.now().plusSeconds(EXPIRY_SECONDS));
		tokenRepository.save(token);

		SimpleMailMessage message = new SimpleMailMessage();
		message.setTo(email);
		message.setSubject("UniLink Password Reset OTP");
		message.setText(
			"Your UniLink password reset OTP is " + otp + ". It expires in 10 minutes."
		);
		mailSender.send(message);
	}

	public void resetPassword(String email, String otp, String newPassword, String confirmPassword) {
		if (newPassword == null || newPassword.length() < 8) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters.");
		}

		if (!newPassword.equals(confirmPassword)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match.");
		}

		User user = userRepository.findByEmail(email)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

		PasswordResetToken token = tokenRepository
			.findTopByEmailAndUsedAtIsNullOrderByCreatedAtDesc(email)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP not found."));

		if (token.getExpiresAt().isBefore(Instant.now())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP expired.");
		}

		if (!passwordEncoder.matches(otp, token.getOtpHash())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP.");
		}

		user.setPasswordHash(passwordEncoder.encode(newPassword));
		userRepository.save(user);

		token.setUsedAt(Instant.now());
		tokenRepository.save(token);
	}

	private String generateOtp() {
		int max = (int) Math.pow(10, OTP_LENGTH);
		int value = random.nextInt(max);
		return String.format("%0" + OTP_LENGTH + "d", value);
	}
}
