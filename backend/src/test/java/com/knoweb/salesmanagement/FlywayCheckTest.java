package com.knoweb.salesmanagement;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
import java.util.Map;

@SpringBootTest
public class FlywayCheckTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    public void testFlyway() {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT * FROM flyway_schema_history WHERE version = '8'");
        for (Map<String, Object> row : rows) {
            System.out.println("====== FLYWAY VERSION 8 ROW ======");
            row.forEach((k, v) -> System.out.println(k + ": " + v));
            System.out.println("==================================");
        }
    }
}
