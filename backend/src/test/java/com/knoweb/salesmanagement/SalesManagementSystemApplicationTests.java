package com.knoweb.salesmanagement;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {"knoweb.database.init.enabled=false"})
class SalesManagementSystemApplicationTests {

	@Test
	void contextLoads() {
	}

}
