package com.biofit.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BiofitBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BiofitBackendApplication.class, args);
	}

}
