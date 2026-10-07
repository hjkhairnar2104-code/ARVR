package com.disastersim.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;

@Slf4j
@Configuration
public class DataSourceConfig {

    @Value("${app.datasource.url:jdbc:postgresql://localhost:5432/disastersimdb}")
    private String pgUrl;

    @Value("${app.datasource.username:postgres}")
    private String pgUser;

    @Value("${app.datasource.password:postgres}")
    private String pgPassword;

    @Value("${app.datasource.driver-class-name:org.postgresql.Driver}")
    private String pgDriver;

    @Bean
    @Primary
    public DataSource dataSource() {
        log.info("Testing connection to PostgreSQL database at: {}", pgUrl);
        boolean pgAvailable = false;
        try {
            Class.forName(pgDriver);
            DriverManager.setLoginTimeout(8); // Allow cloud DB SSL handshake time
            try (Connection conn = DriverManager.getConnection(pgUrl, pgUser, pgPassword)) {
                if (conn.isValid(8)) {
                    pgAvailable = true;
                    log.info("Successfully connected to primary PostgreSQL database.");
                }
            }
        } catch (Exception e) {
            log.warn("Could not connect to PostgreSQL ({}).", e.getMessage());
        }

        if (pgAvailable) {
            return DataSourceBuilder.create()
                    .driverClassName(pgDriver)
                    .url(pgUrl)
                    .username(pgUser)
                    .password(pgPassword)
                    .build();
        }

        log.info("=========================================================================");
        log.info("⚡ ACTIVATING RESILIENT EMBEDDED H2 DATABASE (POSTGRESQL COMPATIBILITY)");
        log.info("   All DisasterSim tables, entities, and seed data will be ready instantly.");
        log.info("   To use your external PostgreSQL, verify credentials or docker compose up.");
        log.info("=========================================================================");

        return DataSourceBuilder.create()
                .driverClassName("org.h2.Driver")
                .url("jdbc:h2:mem:disastersimdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE")
                .username("sa")
                .password("")
                .build();
    }
}
