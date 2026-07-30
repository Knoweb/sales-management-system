package com.knoweb.salesmanagement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.web.config.EnableSpringDataWebSupport;


@Configuration
@ConditionalOnProperty(name = "knoweb.database.init.enabled", havingValue = "true", matchIfMissing = true)
@EnableSpringDataWebSupport(
    pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO
)
public class SpringDataWebConfig {
}
