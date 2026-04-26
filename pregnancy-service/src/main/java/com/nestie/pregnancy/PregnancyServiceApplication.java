package com.nestie.pregnancy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PregnancyServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PregnancyServiceApplication.class, args);
    }
}
