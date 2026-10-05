package com.biofit.backend;

import com.biofit.backend.config.DotEnvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BiofitBackendApplication {

	public static void main(String[] args) {
		DotEnvLoader.loadIfPresent();
		SpringApplication.run(BiofitBackendApplication.class, args);
	}

}
